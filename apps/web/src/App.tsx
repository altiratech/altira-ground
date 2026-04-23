import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type {
  AnalystNoteInput,
  Event,
  EvidenceClaim,
  Memo,
  ProjectCreateInput,
  Project,
  ProjectSummary,
  SourceRecord,
  SourceRecordInput,
  WatchDecision,
} from '@ground/shared';
import {
  createAnalystNote,
  createMemo,
  createProject,
  createSourceRecord,
  getProject,
  getProjectFeed,
  getProjects,
  updateWatchState,
} from './api';
import { buildCoveragePosture, type CoverageFocusSummary } from './coverage-posture';

type DossierState = {
  project: Project;
  sourceRecords: SourceRecord[];
  events: Event[];
};

type MemoDraft = {
  memoType: Memo['memoType'];
  title: string;
  bodyMarkdown: string;
  sourceRecordIds: string[];
};

const defaultAdvanceReason =
  'Advance because the dossier shows enough project-scale, jurisdiction-process visibility, and infrastructure posture to move beyond passive monitoring.';
const defaultWatchReason =
  'Watch because the project remains useful for monitoring infrastructure, process, and maturity signals without forcing premature conviction.';
const defaultProjectDraft: ProjectCreateInput = {
  name: '',
  marketKey: 'texas_ercot_corridor',
  thesis: '',
};
const defaultAnalystNoteDraft: AnalystNoteInput = {
  title: '',
  summary: '',
  author: 'Ground local review',
};
const defaultSourceRecordDraft: SourceRecordInput = {
  title: '',
  publisher: '',
  sourceUrl: '',
  recordType: 'permit_record',
  summary: '',
  publishedAt: '',
};
const defaultMemoDraft: MemoDraft = {
  memoType: 'screen',
  title: '',
  bodyMarkdown: '',
  sourceRecordIds: [],
};

function appendUniqueSourceId(ids: string[], sourceId: string) {
  return ids.includes(sourceId) ? ids : [sourceId, ...ids];
}

function sortAnalystNoteRecords(records: SourceRecord[]) {
  return [...records]
    .filter((record) => record.recordType === 'manual_note')
    .sort((left, right) => right.retrievedAt.localeCompare(left.retrievedAt) || left.title.localeCompare(right.title));
}

function sortSourceTrailRecords(records: SourceRecord[]) {
  return [...records].sort((left, right) => right.retrievedAt.localeCompare(left.retrievedAt) || left.title.localeCompare(right.title));
}

function App() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dossier, setDossier] = useState<DossierState | null>(null);
  const [projectDraft, setProjectDraft] = useState<ProjectCreateInput>(defaultProjectDraft);
  const [analystNoteDraft, setAnalystNoteDraft] = useState<AnalystNoteInput>(defaultAnalystNoteDraft);
  const [memoDraft, setMemoDraft] = useState<MemoDraft>(defaultMemoDraft);
  const [sourceRecordDraft, setSourceRecordDraft] = useState<SourceRecordInput>(defaultSourceRecordDraft);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingAnalystNote, setIsCreatingAnalystNote] = useState(false);
  const [isCreatingMemo, setIsCreatingMemo] = useState(false);
  const [isCreatingSourceRecord, setIsCreatingSourceRecord] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memoStatus, setMemoStatus] = useState<string | null>(null);
  const [analystNoteStatus, setAnalystNoteStatus] = useState<string | null>(null);
  const [projectStatus, setProjectStatus] = useState<string | null>(null);
  const [sourceRecordStatus, setSourceRecordStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        setIsLoading(true);
        const payload = await getProjects();
        if (cancelled) {
          return;
        }

        setProjects(payload.projects);
        setSelectedProjectId((current) => current ?? payload.projects[0]?.id ?? null);
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : 'Unable to load Ground coverage.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      return;
    }

    let cancelled = false;

    async function loadProject(projectId: string) {
      try {
        setError(null);
        const [projectPayload, feedPayload] = await Promise.all([
          getProject(projectId),
          getProjectFeed(projectId),
        ]);

        if (cancelled) {
          return;
        }

        setDossier({
          project: projectPayload.project,
          sourceRecords: projectPayload.sourceRecords,
          events: feedPayload.events,
        });
        setMemoDraft(defaultMemoDraft);
        setMemoStatus(null);
        setAnalystNoteStatus(null);
        setSourceRecordStatus(null);
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : 'Unable to load dossier.');
        }
      }
    }

    void loadProject(selectedProjectId);

    return () => {
      cancelled = true;
    };
  }, [selectedProjectId]);

  async function handleWatchDecision(decision: Exclude<WatchDecision, 'none'>) {
    if (!dossier) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const reason = decision === 'advance' ? defaultAdvanceReason : defaultWatchReason;
      const payload = await updateWatchState(dossier.project.id, {
        decision,
        reason,
        decidedBy: 'Ground local review',
      });

      setDossier((current) =>
        current
          ? {
              ...current,
              project: payload.project,
            }
          : current,
      );
      setProjects((current) =>
        current.map((entry) =>
          entry.id === payload.project.id
            ? {
                ...entry,
                status: payload.project.status,
                watchDecision: payload.watchState.decision,
              }
            : entry,
        ),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to update watch state.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMemoAdd() {
    if (!dossier) {
      return;
    }

    const trimmedTitle = memoDraft.title.trim();
    const trimmedBody = memoDraft.bodyMarkdown.trim();
    if (!trimmedTitle || !trimmedBody) {
      setMemoStatus('Memo creation needs both a title and memo body.');
      return;
    }

    if (memoDraft.sourceRecordIds.length === 0) {
      setMemoStatus('Select at least one cited source record before saving a memo.');
      return;
    }

    try {
      setIsCreatingMemo(true);
      setMemoStatus('Saving memo...');
      const payload = await createMemo(dossier.project.id, {
        memoType: memoDraft.memoType,
        title: trimmedTitle,
        bodyMarkdown: trimmedBody,
        author: 'Ground local review',
        sourceRecordIds: memoDraft.sourceRecordIds,
      });

      setDossier((current) =>
        current
          ? {
              ...current,
              project: payload.project,
            }
          : current,
      );
      setMemoDraft((current) => ({
        ...current,
        title: '',
        bodyMarkdown: '',
      }));
      setMemoStatus('Saved one memo with explicit source citations.');
    } catch (caught) {
      setMemoStatus(caught instanceof Error ? caught.message : 'Unable to save memo.');
    } finally {
      setIsCreatingMemo(false);
    }
  }

  function handleMemoSourceToggle(sourceId: string) {
    setMemoDraft((current) => ({
      ...current,
      sourceRecordIds: current.sourceRecordIds.includes(sourceId)
        ? current.sourceRecordIds.filter((id) => id !== sourceId)
        : [...current.sourceRecordIds, sourceId],
    }));
  }

  async function handleSourceRecordAdd() {
    if (!dossier) {
      return;
    }

    const trimmedTitle = sourceRecordDraft.title.trim();
    const trimmedPublisher = sourceRecordDraft.publisher.trim();
    const trimmedSourceUrl = sourceRecordDraft.sourceUrl.trim();
    const trimmedSummary = sourceRecordDraft.summary.trim();
    if (!trimmedTitle || !trimmedPublisher || !trimmedSourceUrl || !trimmedSummary) {
      setSourceRecordStatus('Source record creation needs a title, publisher, source URL, and summary.');
      return;
    }

    try {
      setIsCreatingSourceRecord(true);
      setSourceRecordStatus('Saving source record...');
      setError(null);
      const payload = await createSourceRecord(dossier.project.id, {
        ...sourceRecordDraft,
        title: trimmedTitle,
        publisher: trimmedPublisher,
        sourceUrl: trimmedSourceUrl,
        summary: trimmedSummary,
      });

      setDossier((current) => {
        if (!current) {
          return current;
        }

        const nextSourceRecords = current.sourceRecords.some((record) => record.id === payload.sourceRecord.id)
          ? current.sourceRecords
          : [...current.sourceRecords, payload.sourceRecord];

        return {
          ...current,
          project: payload.project,
          sourceRecords: nextSourceRecords,
        };
      });
      setSourceRecordDraft({
        ...defaultSourceRecordDraft,
        publisher: trimmedPublisher,
      });
      setMemoDraft((current) => ({
        ...current,
        sourceRecordIds: appendUniqueSourceId(current.sourceRecordIds, payload.sourceRecord.id),
      }));
      setSourceRecordStatus('Saved one public source record in the dossier.');
    } catch (caught) {
      setSourceRecordStatus(caught instanceof Error ? caught.message : 'Unable to save source record.');
    } finally {
      setIsCreatingSourceRecord(false);
    }
  }

  async function handleAnalystNoteAdd() {
    if (!dossier) {
      return;
    }

    const trimmedTitle = analystNoteDraft.title.trim();
    const trimmedSummary = analystNoteDraft.summary.trim();
    if (!trimmedTitle || !trimmedSummary) {
      setAnalystNoteStatus('Analyst note creation needs both a note title and the local judgment text.');
      return;
    }

    try {
      setIsCreatingAnalystNote(true);
      setAnalystNoteStatus('Saving analyst note...');
      setError(null);
      const payload = await createAnalystNote(dossier.project.id, {
        ...analystNoteDraft,
        title: trimmedTitle,
        summary: trimmedSummary,
      });

      setDossier((current) => {
        if (!current) {
          return current;
        }

        const nextSourceRecords = current.sourceRecords.some((record) => record.id === payload.sourceRecord.id)
          ? current.sourceRecords
          : [...current.sourceRecords, payload.sourceRecord];

        return {
          ...current,
          project: payload.project,
          sourceRecords: nextSourceRecords,
        };
      });
      setAnalystNoteDraft((current) => ({
        ...current,
        title: '',
        summary: '',
      }));
      setMemoDraft((current) => ({
        ...current,
        sourceRecordIds: appendUniqueSourceId(current.sourceRecordIds, payload.sourceRecord.id),
      }));
      setAnalystNoteStatus('Saved one analyst note in the dossier.');
    } catch (caught) {
      setAnalystNoteStatus(caught instanceof Error ? caught.message : 'Unable to save analyst note.');
    } finally {
      setIsCreatingAnalystNote(false);
    }
  }

  async function handleProjectCreate() {
    const trimmedName = projectDraft.name.trim();
    const trimmedThesis = projectDraft.thesis.trim();
    if (!trimmedName || !trimmedThesis) {
      setProjectStatus('Project creation needs both a project name and a thesis.');
      return;
    }

    try {
      setIsCreatingProject(true);
      setProjectStatus('Creating manual project...');
      setError(null);
      const payload = await createProject({
        name: trimmedName,
        thesis: trimmedThesis,
        marketKey: projectDraft.marketKey,
      });

      setProjects((current) => [
        {
          id: payload.project.id,
          name: payload.project.name,
          lens: payload.project.lens,
          status: payload.project.status,
          marketKey: payload.project.marketKey,
          thesis: payload.project.thesis,
          latestEventAt: payload.project.timeline[0]?.happenedAt ?? null,
          watchDecision: payload.project.watchState.decision,
        },
        ...current,
      ]);
      setSelectedProjectId(payload.project.id);
      setProjectDraft(defaultProjectDraft);
      setProjectStatus('Created one manual project shell in Coverage Universe.');
    } catch (caught) {
      setProjectStatus(caught instanceof Error ? caught.message : 'Unable to create project.');
    } finally {
      setIsCreatingProject(false);
    }
  }

  const sourceMap = new Map(dossier?.sourceRecords.map((record) => [record.id, record]) ?? []);
  const primarySite = dossier?.project.sites[0] ?? null;
  const planningPortalLabel = dossier ? `${dossier.project.jurisdiction.name} planning portal` : 'Planning portal';
  const coveragePosture = dossier ? buildCoveragePosture(dossier.project, dossier.sourceRecords) : null;
  const analystNoteRecords = dossier ? sortAnalystNoteRecords(dossier.sourceRecords) : [];
  const sortedSourceTrailRecords = dossier ? sortSourceTrailRecords(dossier.sourceRecords) : [];

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-brand">
          <img className="topbar-brand-mark" src="/brand/altira-wordmark-dark.png" alt="Altira" />
          <p className="eyebrow">Ground</p>
          <h1>Project-first transition intelligence</h1>
        </div>
        <div className="topbar-meta">
          <span className="chip chip-lens">industrial development</span>
          <span className="chip chip-market">Texas / ERCOT corridor</span>
        </div>
      </header>

      <main className="workspace">
        <aside className="rail">
          <div className="panel rail-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Coverage Universe</p>
                <h2>Seeded pilot coverage</h2>
              </div>
              <span className="count">{projects.length}</span>
            </div>
            <p className="panel-copy">
              Ground still starts narrow, but this rail can now hold the real Sherman seed plus manual project shells for adjacent ERCOT corridor tracking.
            </p>

            <div className="manual-create">
              <div className="manual-create-head">
                <p className="eyebrow">Manual Intake</p>
                <span className="chip">pilot only</span>
              </div>
              <label>
                <span>Project name</span>
                <input
                  type="text"
                  value={projectDraft.name}
                  onChange={(event) =>
                    setProjectDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Sherman supplier campus"
                />
              </label>
              <label>
                <span>Why this belongs in Ground</span>
                <textarea
                  value={projectDraft.thesis}
                  onChange={(event) =>
                    setProjectDraft((current) => ({
                      ...current,
                      thesis: event.target.value,
                    }))
                  }
                  placeholder="Explain the monitoring thesis in one sentence."
                  rows={4}
                />
              </label>
              <button className="button-primary" disabled={isCreatingProject} onClick={handleProjectCreate} type="button">
                Add Manual Project
              </button>
              {projectStatus ? <p className="muted">{projectStatus}</p> : null}
            </div>

            {isLoading ? <p className="muted">Loading coverage…</p> : null}
            {error && !dossier ? <p className="error">{error}</p> : null}

            <div className="project-list">
              {projects.map((project) => (
                <button
                  key={project.id}
                  className={`project-card ${project.id === selectedProjectId ? 'project-card-active' : ''}`}
                  onClick={() => setSelectedProjectId(project.id)}
                  type="button"
                >
                  <div className="project-card-head">
                    <strong>{project.name}</strong>
                    <span className={`status status-${project.status}`}>{project.status}</span>
                  </div>
                  <p>{project.thesis}</p>
                  <div className="project-card-meta">
                    <span>{project.marketKey.replaceAll('_', ' ')}</span>
                    <span>{project.watchDecision}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="content">
          {!dossier ? (
            <div className="panel empty-state">
              <h2>Choose a project</h2>
              <p>Ground will render the dossier, feed, and watch decision here.</p>
            </div>
          ) : (
            <>
              <div className="panel hero-panel">
                <div className="hero-copy">
                  <p className="eyebrow">Project Dossier</p>
                  <h2>{dossier.project.name}</h2>
                  <p className="hero-thesis">{dossier.project.thesis}</p>
                  <div className="hero-meta">
                    <span className="chip">{dossier.project.status}</span>
                    <span className="chip">watch decision: {dossier.project.watchState.decision}</span>
                    <span className="chip">jurisdiction: {dossier.project.jurisdiction.name}, {dossier.project.jurisdiction.state}</span>
                  </div>
                </div>
                <div className="hero-actions">
                  <button disabled={isSaving} onClick={() => handleWatchDecision('watch')} type="button">
                    Watch
                  </button>
                  <button
                    className="button-primary"
                    disabled={isSaving}
                    onClick={() => handleWatchDecision('advance')}
                    type="button"
                  >
                    Advance
                  </button>
                </div>
              </div>

              {error ? <p className="error">{error}</p> : null}

              <div className="grid">
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">Coverage Posture</p>
                      <h3>What Ground really has versus what is still missing</h3>
                    </div>
                  </div>
                  {coveragePosture ? <CoveragePosturePanel coverage={coveragePosture} /> : null}
                </section>

                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">Key Claims</p>
                      <h3>What the dossier can say with confidence</h3>
                    </div>
                  </div>
                  <ClaimList claims={dossier.project.keyClaims} sourceMap={sourceMap} />
                </section>
              </div>

              <div className="grid">
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">Blockers</p>
                      <h3>What can slow conviction</h3>
                    </div>
                  </div>
                  <ClaimList claims={dossier.project.blockers} sourceMap={sourceMap} />
                </section>

                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">Unlocks</p>
                      <h3>What supports the thesis</h3>
                    </div>
                  </div>
                  <ClaimList claims={dossier.project.unlocks} sourceMap={sourceMap} />
                </section>
              </div>

              <div className="grid">
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">Ground Feed</p>
                      <h3>Recent project and jurisdiction change</h3>
                    </div>
                  </div>
                  <FeedList events={dossier.events} sourceMap={sourceMap} />
                </section>

                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">Source Trail</p>
                      <h3>Material records in dossier</h3>
                    </div>
                  </div>
                  <SourceTrailPanel
                    draft={sourceRecordDraft}
                    isSaving={isCreatingSourceRecord}
                    onDraftChange={setSourceRecordDraft}
                    onSubmit={handleSourceRecordAdd}
                    sourceRecords={sortedSourceTrailRecords}
                    status={sourceRecordStatus}
                  />
                </section>
              </div>

              <div className="grid">
                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">Site Context</p>
                      <h3>Physical and jurisdiction context</h3>
                    </div>
                  </div>
                  <dl className="detail-list">
                    <div>
                      <dt>Site</dt>
                      <dd>{primarySite?.name ?? 'No site parcel attached yet'}</dd>
                    </div>
                    <div>
                      <dt>County</dt>
                      <dd>{primarySite?.county ?? 'Not set yet'}</dd>
                    </div>
                    <div>
                      <dt>Current use</dt>
                      <dd>{primarySite?.currentUse ?? 'Manual project shell still needs site context'}</dd>
                    </div>
                    <div>
                      <dt>Portal</dt>
                      <dd>
                        {dossier.project.jurisdiction.planningPortalUrl ? (
                          <a href={dossier.project.jurisdiction.planningPortalUrl} target="_blank" rel="noreferrer">
                            {planningPortalLabel}
                          </a>
                        ) : (
                          <span className="muted">No planning portal linked yet</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </section>

                <section className="panel">
                  <div className="panel-header">
                    <div>
                      <p className="eyebrow">Analyst Notes</p>
                      <h3>Manual context and memo trail</h3>
                    </div>
                  </div>
                  <AnalystNotesPanel
                    analystNoteRecords={analystNoteRecords}
                    availableSources={sortedSourceTrailRecords}
                    draft={analystNoteDraft}
                    isSaving={isCreatingAnalystNote}
                    isSavingMemo={isCreatingMemo}
                    memoDraft={memoDraft}
                    memos={dossier.project.memos}
                    onDraftChange={setAnalystNoteDraft}
                    onMemoDraftChange={setMemoDraft}
                    onMemoSourceToggle={handleMemoSourceToggle}
                    onMemoSubmit={handleMemoAdd}
                    onSubmit={handleAnalystNoteAdd}
                    memoStatus={memoStatus}
                    status={analystNoteStatus}
                  />
                </section>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function ClaimList({
  claims,
  sourceMap,
}: {
  claims: EvidenceClaim[];
  sourceMap: Map<string, SourceRecord>;
}) {
  if (claims.length === 0) {
    return <p className="muted">No claims captured yet. Start with observed facts before adding inference.</p>;
  }

  return (
    <div className="stack">
      {claims.map((claim) => (
        <article key={claim.id} className="claim-card">
          <div className="claim-header">
            <strong>{claim.label}</strong>
            <div className="badge-row">
              <span className={`truth truth-${claim.truthType}`}>{claim.truthType}</span>
              {claim.confidence !== null ? <span className="truth truth-confidence">{Math.round(claim.confidence * 100)}%</span> : null}
            </div>
          </div>
          <p>{claim.valueText}</p>
          <ul className="source-inline-list">
            {claim.sourceRecordIds.map((sourceId) => {
              const source = sourceMap.get(sourceId);
              if (!source) {
                return null;
              }

              return (
                <li key={source.id}>
                  <SourcePublisher source={source} />
                  <span>{source.title}</span>
                  <span>retrieved {formatDate(source.retrievedAt)}</span>
                </li>
              );
            })}
          </ul>
        </article>
      ))}
    </div>
  );
}

function FeedList({ events, sourceMap }: { events: Event[]; sourceMap: Map<string, SourceRecord> }) {
  if (events.length === 0) {
    return <p className="muted">No change events yet. Manual shells can stay empty until the first real signal lands.</p>;
  }

  return (
    <div className="stack">
      {events.map((event) => (
        <article key={event.id} className="feed-item">
          <div className="feed-head">
            <strong>{event.title}</strong>
            <span>{formatDate(event.happenedAt)}</span>
          </div>
          <div className="badge-row">
            <span className={`truth truth-${event.truthType}`}>{event.truthType}</span>
            {event.confidence !== null ? <span className="truth truth-confidence">{Math.round(event.confidence * 100)}%</span> : null}
          </div>
          <p>{event.whyItMatters}</p>
          <ul className="source-inline-list">
            {event.sourceRecordIds.map((sourceId) => {
              const source = sourceMap.get(sourceId);
              if (!source) {
                return null;
              }

              return (
                <li key={source.id}>
                  <SourcePublisher source={source} />
                  <span>{source.title}</span>
                </li>
              );
            })}
          </ul>
        </article>
      ))}
    </div>
  );
}

function CoveragePosturePanel({ coverage }: { coverage: ReturnType<typeof buildCoveragePosture> }) {
  const missingFocuses = coverage.focuses.filter((focus) => focus.status === 'missing');

  return (
    <div className="stack">
      <div className="coverage-summary">
        <article className="coverage-stat">
          <span>Source records</span>
          <strong>{coverage.sourceRecordCount}</strong>
        </article>
        <article className="coverage-stat">
          <span>Observed core claims</span>
          <strong>{coverage.observedCoreClaimCount}</strong>
        </article>
        <article className="coverage-stat">
          <span>Inferred claims</span>
          <strong>{coverage.inferredClaimCount}</strong>
        </article>
        <article className="coverage-stat">
          <span>Needs analyst review</span>
          <strong>{coverage.analystReviewRequiredCount}</strong>
        </article>
        <article className="coverage-stat">
          <span>Timeline events</span>
          <strong>{coverage.eventCount}</strong>
        </article>
        <article className="coverage-stat">
          <span>Memos</span>
          <strong>{coverage.memoCount}</strong>
        </article>
      </div>

      {missingFocuses.length > 0 ? (
        <p className="muted">
          Next data lifts: {missingFocuses.map((focus) => focus.label.toLowerCase()).join(', ')}.
        </p>
      ) : (
        <p className="muted">Ground has at least one source layer attached across every founding coverage bucket.</p>
      )}

      <div className="focus-list">
        {coverage.focuses.map((focus) => (
          <CoverageFocusCard key={focus.key} focus={focus} />
        ))}
      </div>
    </div>
  );
}

function CoverageFocusCard({ focus }: { focus: CoverageFocusSummary }) {
  return (
    <article className={`focus-card focus-card-${focus.status}`}>
      <div className="focus-card-head">
        <strong>{focus.label}</strong>
        <span className={`truth truth-${focus.status === 'covered' ? 'observed' : 'hypothetical'}`}>
          {focus.status === 'covered' ? `${focus.supportingSourceCount} source${focus.supportingSourceCount === 1 ? '' : 's'}` : 'missing'}
        </span>
      </div>
      <p>{focus.note}</p>
    </article>
  );
}

function SourceTrailPanel({
  draft,
  isSaving,
  onDraftChange,
  onSubmit,
  sourceRecords,
  status,
}: {
  draft: SourceRecordInput;
  isSaving: boolean;
  onDraftChange: Dispatch<SetStateAction<SourceRecordInput>>;
  onSubmit: () => void;
  sourceRecords: SourceRecord[];
  status: string | null;
}) {
  return (
    <div className="stack">
      <div className="manual-create source-create">
        <div className="manual-create-head">
          <p className="eyebrow">Add Source Record</p>
          <span className="chip">public source</span>
        </div>

        <div className="source-create-grid">
          <label>
            <span>Record title</span>
            <input
              type="text"
              value={draft.title}
              onChange={(event) =>
                onDraftChange((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Sherman infrastructure program update"
            />
          </label>

          <label>
            <span>Publisher</span>
            <input
              type="text"
              value={draft.publisher}
              onChange={(event) =>
                onDraftChange((current) => ({
                  ...current,
                  publisher: event.target.value,
                }))
              }
              placeholder="City of Sherman"
            />
          </label>

          <label>
            <span>Record type</span>
            <select
              value={draft.recordType}
              onChange={(event) =>
                onDraftChange((current) => ({
                  ...current,
                  recordType: event.target.value as SourceRecordInput['recordType'],
                }))
              }
            >
              <option value="permit_record">permit record</option>
              <option value="agenda_item">agenda item</option>
              <option value="zoning_record">zoning record</option>
              <option value="parcel_record">parcel record</option>
              <option value="hazard_layer">hazard layer</option>
              <option value="infrastructure_record">infrastructure record</option>
              <option value="imagery_layer">imagery layer</option>
            </select>
          </label>

          <label>
            <span>Published date</span>
            <input
              type="date"
              value={draft.publishedAt ?? ''}
              onChange={(event) =>
                onDraftChange((current) => ({
                  ...current,
                  publishedAt: event.target.value,
                }))
              }
            />
          </label>
        </div>

        <label>
          <span>Source URL</span>
          <input
            type="url"
            value={draft.sourceUrl}
            onChange={(event) =>
              onDraftChange((current) => ({
                ...current,
                sourceUrl: event.target.value,
              }))
            }
            placeholder="https://cityofsherman.com/..."
          />
        </label>

        <label>
          <span>What this adds to the dossier</span>
          <textarea
            value={draft.summary}
            onChange={(event) =>
              onDraftChange((current) => ({
                ...current,
                summary: event.target.value,
              }))
            }
            placeholder="Capture the precise new fact or posture this public record adds."
            rows={4}
          />
        </label>

        <button className="button-primary" disabled={isSaving} onClick={onSubmit} type="button">
          Add Source Record
        </button>
        {status ? <p className="muted">{status}</p> : null}
      </div>

      <SourceList sourceRecords={sourceRecords} />
    </div>
  );
}

function SourceList({ sourceRecords }: { sourceRecords: SourceRecord[] }) {
  if (sourceRecords.length === 0) {
    return <p className="muted">No source records linked yet.</p>;
  }

  return (
    <div className="stack">
      {sourceRecords.map((record) => (
        <article key={record.id} className="source-card">
          <div className="source-head">
            <strong>{record.publisher}</strong>
            <span>{record.recordType.replaceAll('_', ' ')}</span>
          </div>
          <SourceTitle source={record} />
          <p>{record.summary}</p>
          <p className="source-meta">
            published {record.publishedAt ? formatDate(record.publishedAt) : 'n/a'} · retrieved {formatDate(record.retrievedAt)}
          </p>
        </article>
      ))}
    </div>
  );
}

function AnalystNotesPanel({
  analystNoteRecords,
  availableSources,
  draft,
  isSaving,
  isSavingMemo,
  memoDraft,
  memos,
  onDraftChange,
  onMemoDraftChange,
  onMemoSourceToggle,
  onMemoSubmit,
  onSubmit,
  memoStatus,
  status,
}: {
  analystNoteRecords: SourceRecord[];
  availableSources: SourceRecord[];
  draft: AnalystNoteInput;
  isSaving: boolean;
  isSavingMemo: boolean;
  memoDraft: MemoDraft;
  memos: Memo[];
  onDraftChange: Dispatch<SetStateAction<AnalystNoteInput>>;
  onMemoDraftChange: Dispatch<SetStateAction<MemoDraft>>;
  onMemoSourceToggle: (sourceId: string) => void;
  onMemoSubmit: () => void;
  onSubmit: () => void;
  memoStatus: string | null;
  status: string | null;
}) {
  const linkedMemoTitlesBySourceId = new Map<string, string[]>();
  const linkedMemoCount = memos.filter((memo) =>
    memo.sourceRecordIds.some((sourceId) => analystNoteRecords.some((record) => record.id === sourceId)),
  ).length;

  analystNoteRecords.forEach((record) => {
    linkedMemoTitlesBySourceId.set(record.id, []);
  });

  memos.forEach((memo) => {
    memo.sourceRecordIds.forEach((sourceId) => {
      const linkedTitles = linkedMemoTitlesBySourceId.get(sourceId);
      if (linkedTitles) {
        linkedTitles.push(memo.title);
      }
    });
  });

  return (
    <div className="stack">
      <div className="manual-create analyst-create">
        <div className="manual-create-head">
          <p className="eyebrow">Add Analyst Note</p>
          <span className="chip">manual only</span>
        </div>
        <label>
          <span>Note title</span>
          <input
            type="text"
            value={draft.title}
            onChange={(event) =>
              onDraftChange((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
            placeholder="Ground analyst note: why this stays sourced"
          />
        </label>
        <label>
          <span>Local judgment</span>
          <textarea
            value={draft.summary}
            onChange={(event) =>
              onDraftChange((current) => ({
                ...current,
                summary: event.target.value,
              }))
            }
            placeholder="Write the bounded local judgment this dossier should preserve."
            rows={5}
          />
        </label>
        <button className="button-primary" disabled={isSaving} onClick={onSubmit} type="button">
          Add Analyst Note
        </button>
        {status ? <p className="muted">{status}</p> : null}
      </div>

      <div className="analyst-summary">
        <article className="analyst-summary-stat">
          <span>Manual sources</span>
          <strong>{analystNoteRecords.length}</strong>
        </article>
        <article className="analyst-summary-stat">
          <span>Linked memos</span>
          <strong>{linkedMemoCount}</strong>
        </article>
        <p className="analyst-summary-copy">Local judgment stays visible and provenance-preserved instead of blending into sourced evidence.</p>
      </div>

      <div className="manual-create memo-create">
        <div className="manual-create-head">
          <p className="eyebrow">Add Memo</p>
          <span className="chip">explicit citations</span>
        </div>
        <div className="source-create-grid">
          <label>
            <span>Memo type</span>
            <select
              value={memoDraft.memoType}
              onChange={(event) =>
                onMemoDraftChange((current) => ({
                  ...current,
                  memoType: event.target.value as MemoDraft['memoType'],
                }))
              }
            >
              <option value="screen">screen</option>
              <option value="diligence">diligence</option>
              <option value="investment_committee">investment committee</option>
            </select>
          </label>
          <label>
            <span>Memo title</span>
            <input
              type="text"
              value={memoDraft.title}
              onChange={(event) =>
                onMemoDraftChange((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Why this new evidence matters"
            />
          </label>
        </div>

        <label>
          <span>Memo body</span>
          <textarea
            value={memoDraft.bodyMarkdown}
            onChange={(event) =>
              onMemoDraftChange((current) => ({
                ...current,
                bodyMarkdown: event.target.value,
              }))
            }
            placeholder="Write the bounded interpretation Ground should preserve from these sources."
            rows={5}
          />
        </label>

        <div className="memo-source-picker">
          <div className="manual-create-head">
            <p className="eyebrow">Cited Sources</p>
            <span className="chip">{memoDraft.sourceRecordIds.length} selected</span>
          </div>
          <p className="memo-helper">Choose the records this memo is actually grounded in. New analyst notes or public records stay selectable here.</p>
          <div className="source-link-picker">
            {availableSources.map((source) => {
              const isSelected = memoDraft.sourceRecordIds.includes(source.id);

              return (
                <button
                  key={source.id}
                  className={`source-link-button ${isSelected ? 'source-link-button-active' : ''}`}
                  onClick={() => onMemoSourceToggle(source.id)}
                  type="button"
                >
                  <strong>{source.title}</strong>
                  <span>
                    {source.publisher} · {source.recordType.replaceAll('_', ' ')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button className="button-primary" disabled={isSavingMemo} onClick={onMemoSubmit} type="button">
          Save Memo
        </button>
        {memoStatus ? <p className="muted">{memoStatus}</p> : null}
      </div>

      {analystNoteRecords.length > 0 ? (
        <div className="stack analyst-section">
          <p className="eyebrow">Manual Source Layer</p>
          {analystNoteRecords.map((record) => {
            const linkedMemoTitles = linkedMemoTitlesBySourceId.get(record.id) ?? [];

            return (
              <article key={record.id} className="source-card analyst-source-card">
                <div className="source-head">
                  <strong>{record.publisher}</strong>
                  <span>{record.sourceClass.replaceAll('_', ' ')}</span>
                </div>
                <div className="badge-row">
                  <span className="chip">manual note</span>
                  <span className="chip">
                    {linkedMemoTitles.length} linked memo{linkedMemoTitles.length === 1 ? '' : 's'}
                  </span>
                </div>
                <SourceTitle source={record} />
                <p>{record.summary}</p>
                <p className="source-meta">
                  published {record.publishedAt ? formatDate(record.publishedAt) : 'n/a'} · retrieved {formatDate(record.retrievedAt)}
                </p>
                {linkedMemoTitles.length > 0 ? (
                  <div className="analyst-links">
                    {linkedMemoTitles.map((title) => (
                      <span key={title} className="chip">
                        {title}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="muted">No memo cites this analyst note yet.</p>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="muted">No manual analyst source is attached to this dossier yet.</p>
      )}

      <div className="analyst-panel-divider" />

      <div className="stack analyst-section">
        <p className="eyebrow">Memo Trail</p>
        <MemoList memos={memos} sourceMap={new Map(availableSources.map((source) => [source.id, source]))} />
      </div>
    </div>
  );
}

function MemoList({ memos, sourceMap }: { memos: Memo[]; sourceMap: Map<string, SourceRecord> }) {
  if (memos.length === 0) {
    return <p className="muted">No memos yet. Add one when the project needs a screen or diligence note.</p>;
  }

  return (
    <div className="stack">
      {memos.map((memo) => (
        <article key={memo.id} className="memo-card">
          <div className="feed-head">
            <strong>{memo.title}</strong>
            <span>{formatDate(memo.updatedAt)}</span>
          </div>
          <p className="eyebrow">{memo.memoType}</p>
          <MemoProvenanceSummary memo={memo} sourceMap={sourceMap} />
          <p>{memo.bodyMarkdown}</p>
          {memo.sourceRecordIds.length > 0 ? (
            <div className="memo-source-group">
              <p className="eyebrow">Cited Sources</p>
              <div className="memo-source-chips">
                {memo.sourceRecordIds.map((sourceId) => {
                  const source = sourceMap.get(sourceId);
                  if (!source) {
                    return (
                      <span key={sourceId} className="memo-source-chip memo-source-chip-missing">
                        source unavailable
                      </span>
                    );
                  }

                  const sourceKind = source.recordType === 'manual_note' ? 'manual note' : 'source-backed record';
                  const chipMeta = `${source.publisher} · ${sourceKind}`;
                  return (
                    <div key={source.id} className="memo-source-chip">
                      <div className="memo-source-title">
                        <SourceTitle source={source} />
                      </div>
                      <span className="memo-source-meta">{chipMeta}</span>
                      <span className="memo-source-recency">{formatSourceRecency(source)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          <p className="muted">author: {memo.author}</p>
        </article>
      ))}
    </div>
  );
}

function MemoProvenanceSummary({ memo, sourceMap }: { memo: Memo; sourceMap: Map<string, SourceRecord> }) {
  const citedSources = memo.sourceRecordIds
    .map((sourceId) => sourceMap.get(sourceId))
    .filter((source): source is SourceRecord => Boolean(source));
  const summary = describeMemoProvenance(citedSources, memo.sourceRecordIds.length);

  return (
    <div className="memo-provenance">
      <span className={`memo-provenance-badge ${summary.tone}`}>{summary.label}</span>
      <span className="memo-provenance-detail">{summary.detail}</span>
    </div>
  );
}

function SourcePublisher({ source }: { source: SourceRecord }) {
  if (!source.sourceUrl) {
    return <span>{source.publisher}</span>;
  }

  return (
    <a href={source.sourceUrl} target="_blank" rel="noreferrer">
      {source.publisher}
    </a>
  );
}

function SourceTitle({ source }: { source: SourceRecord }) {
  if (!source.sourceUrl) {
    return <span>{source.title}</span>;
  }

  return (
    <a href={source.sourceUrl} target="_blank" rel="noreferrer">
      {source.title}
    </a>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value));
}

function formatSourceRecency(source: SourceRecord) {
  const recencyBits = [];
  if (source.publishedAt) {
    recencyBits.push(`published ${formatDate(source.publishedAt)}`);
  }
  recencyBits.push(`retrieved ${formatDate(source.retrievedAt)}`);
  return recencyBits.join(' · ');
}

function describeMemoProvenance(sources: SourceRecord[], expectedSourceCount: number) {
  if (sources.length === 0) {
    return {
      label: 'source coverage missing',
      detail: expectedSourceCount > 0
        ? 'One or more cited records are unavailable in this dossier view.'
        : 'This memo has no cited records attached yet.',
      tone: 'memo-provenance-missing',
    };
  }

  const manualCount = sources.filter((source) => source.recordType === 'manual_note' || source.sourceClass === 'manual').length;
  const publicCount = sources.filter((source) => source.sourceClass === 'official_public').length;
  const reviewRightsCount = sources.filter((source) => source.rightsStatus !== 'approved').length;
  const hasOtherSourceClasses = sources.some((source) => !['manual', 'official_public'].includes(source.sourceClass));

  let label = 'mixed source basis';
  if (publicCount > 0 && manualCount === 0 && !hasOtherSourceClasses) {
    label = 'public-record backed';
  } else if (publicCount > 0 && manualCount > 0 && !hasOtherSourceClasses) {
    label = 'public + manual context';
  } else if (publicCount === 0 && manualCount > 0 && !hasOtherSourceClasses) {
    label = 'manual-context memo';
  }

  const detailParts = [];
  if (publicCount > 0) {
    detailParts.push(`${publicCount} public record${publicCount === 1 ? '' : 's'}`);
  }
  if (manualCount > 0) {
    detailParts.push(`${manualCount} manual note${manualCount === 1 ? '' : 's'}`);
  }
  if (hasOtherSourceClasses) {
    detailParts.push('non-public source classes included');
  }
  if (reviewRightsCount > 0) {
    detailParts.push(`${reviewRightsCount} citation${reviewRightsCount === 1 ? '' : 's'} need rights review`);
  }

  return {
    label,
    detail: detailParts.join(' · '),
    tone: publicCount > 0 ? 'memo-provenance-grounded' : 'memo-provenance-manual',
  };
}

export default App;

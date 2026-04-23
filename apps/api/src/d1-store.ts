import type {
  AnalystNoteInput,
  AnalystNoteResponse,
  BootstrapResetResponse,
  BootstrapStateResponse,
  EvidenceClaim,
  Event,
  FeedResponse,
  Jurisdiction,
  Memo,
  MemoInput,
  Project,
  ProjectCreateInput,
  ProjectResponse,
  ProjectsResponse,
  SiteParcel,
  SourceRecord,
  SourceRecordInput,
  SourceRecordResponse,
  WatchState,
  WatchStateInput,
} from '@ground/shared';
import { buildSeedState } from './seed';
import {
  buildAnalystNoteSourceRecord,
  buildBootstrapState,
  buildNewProject,
  buildPublicSourceRecord,
  collectProjectSourceRecordIds,
  MemoryGroundStore,
  sortEventsDescending,
  type GroundStore,
} from './store';

type ProjectRow = {
  id: string;
  name: string;
  lens: Project['lens'];
  status: Project['status'];
  marketKey: Project['marketKey'];
  thesis: string;
  jurisdictionId: string;
  nextUseOptionsJson: string;
  alertIdsJson: string;
  createdAt: string;
  updatedAt: string;
};

type JurisdictionRow = {
  id: string;
  name: string;
  state: string;
  marketKey: Project['marketKey'];
  governmentBodiesJson: string;
  planningPortalUrl: string | null;
  notes: string | null;
};

type SiteParcelRow = {
  id: string;
  projectId: string;
  name: string;
  county: string;
  state: string;
  acreage: number | null;
  ownershipStatus: SiteParcel['ownershipStatus'];
  currentUse: string | null;
  geometryRef: string | null;
};

type SourceRecordRow = {
  id: string;
  title: string;
  sourceClass: SourceRecord['sourceClass'];
  rightsStatus: SourceRecord['rightsStatus'];
  publisher: string;
  sourceUrl: string | null;
  jurisdictionId: string | null;
  recordType: SourceRecord['recordType'];
  publishedAt: string | null;
  retrievedAt: string;
  updateCadence: SourceRecord['updateCadence'];
  summary: string;
};

type EventRow = {
  id: string;
  projectId: string;
  eventType: Event['eventType'];
  title: string;
  happenedAt: string;
  truthType: Event['truthType'];
  confidence: number | null;
  whyItMatters: string;
};

type EvidenceClaimBucket = 'blocker' | 'unlock' | 'key_claim';

type EvidenceClaimRow = {
  id: string;
  projectId: string;
  claimBucket: EvidenceClaimBucket;
  label: string;
  valueText: string;
  truthType: EvidenceClaim['truthType'];
  confidence: number | null;
  materiality: EvidenceClaim['materiality'];
  analystReviewRequired: number;
  lastReviewedAt: string | null;
};

type MemoRow = {
  id: string;
  projectId: string;
  memoType: Memo['memoType'];
  title: string;
  bodyMarkdown: string;
  createdAt: string;
  updatedAt: string;
  author: string;
};

type WatchStateRow = {
  projectId: string;
  decision: WatchState['decision'];
  reason: string;
  decidedAt: string;
  decidedBy: string;
};

type ProjectListRow = {
  id: string;
  name: string;
  lens: Project['lens'];
  status: Project['status'];
  marketKey: Project['marketKey'];
  thesis: string;
  latestEventAt: string | null;
  watchDecision: WatchState['decision'] | null;
};

type SourceLinkRow = {
  ownerId: string;
  sourceRecordId: string;
};

function toJson(value: unknown): string {
  return JSON.stringify(value);
}

function parseJsonArray<T>(value: string | null): T[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function buildPlaceholders(count: number): string {
  return Array.from({ length: count }, () => '?').join(', ');
}

function mapSourceRecordRow(row: SourceRecordRow): SourceRecord {
  return {
    id: row.id,
    title: row.title,
    sourceClass: row.sourceClass,
    rightsStatus: row.rightsStatus,
    publisher: row.publisher,
    sourceUrl: row.sourceUrl,
    jurisdictionId: row.jurisdictionId,
    recordType: row.recordType,
    publishedAt: row.publishedAt,
    retrievedAt: row.retrievedAt,
    updateCadence: row.updateCadence,
    summary: row.summary,
  };
}

function mapJurisdictionRow(row: JurisdictionRow): Jurisdiction {
  return {
    id: row.id,
    name: row.name,
    state: row.state,
    marketKey: row.marketKey,
    governmentBodies: parseJsonArray<string>(row.governmentBodiesJson),
    planningPortalUrl: row.planningPortalUrl,
    notes: row.notes,
  };
}

function mapWatchStateRow(row: WatchStateRow): WatchState {
  return {
    projectId: row.projectId,
    decision: row.decision,
    reason: row.reason,
    decidedAt: row.decidedAt,
    decidedBy: row.decidedBy,
  };
}

function defaultWatchState(projectId: string, createdAt: string): WatchState {
  return {
    projectId,
    decision: 'none',
    reason: 'No decision captured yet.',
    decidedAt: createdAt,
    decidedBy: 'system',
  };
}

export class D1GroundStore implements GroundStore {
  private seedPromise: Promise<void> | null = null;
  private mode: 'd1' | 'memory' = 'd1';
  private readonly memoryFallback = new MemoryGroundStore();

  constructor(private readonly db: D1Database) {}

  async listProjects(): Promise<ProjectsResponse> {
    if ((await this.ensureSeeded()) === 'memory') {
      return this.memoryFallback.listProjects();
    }

    const result = await this.db.prepare(
      `SELECT p.id, p.name, p.lens, p.status, p.market_key AS marketKey, p.thesis,
              MAX(e.happened_at) AS latestEventAt, w.decision AS watchDecision
       FROM projects p
       LEFT JOIN events e ON e.project_id = p.id
       LEFT JOIN watch_states w ON w.project_id = p.id
       GROUP BY p.id, p.name, p.lens, p.status, p.market_key, p.thesis, w.decision
       ORDER BY p.updated_at DESC, p.name ASC`,
    ).all<ProjectListRow>();

    return {
      projects: (result.results ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        lens: row.lens,
        status: row.status,
        marketKey: row.marketKey,
        thesis: row.thesis,
        latestEventAt: row.latestEventAt,
        watchDecision: row.watchDecision ?? 'none',
      })),
    };
  }

  async getProject(projectId: string): Promise<ProjectResponse | null> {
    if ((await this.ensureSeeded()) === 'memory') {
      return this.memoryFallback.getProject(projectId);
    }

    const project = await this.loadProject(projectId);
    if (!project) {
      return null;
    }

    return {
      project,
      sourceRecords: await this.getSourceRecordsByIds(collectProjectSourceRecordIds(project)),
    };
  }

  async getProjectFeed(projectId: string): Promise<FeedResponse | null> {
    if ((await this.ensureSeeded()) === 'memory') {
      return this.memoryFallback.getProjectFeed(projectId);
    }

    const project = await this.loadProject(projectId);
    if (!project) {
      return null;
    }

    const sourceRecordIds = [...new Set(project.timeline.flatMap((event) => event.sourceRecordIds))];
    return {
      events: project.timeline,
      sourceRecords: await this.getSourceRecordsByIds(sourceRecordIds),
    };
  }

  async createProject(input: ProjectCreateInput): Promise<Project> {
    if ((await this.ensureSeeded()) === 'memory') {
      return this.memoryFallback.createProject(input);
    }

    const project = buildNewProject(input);
    await this.db.batch([
      this.db
        .prepare(
          `INSERT OR REPLACE INTO jurisdictions
           (id, name, state, market_key, government_bodies_json, planning_portal_url, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          project.jurisdiction.id,
          project.jurisdiction.name,
          project.jurisdiction.state,
          project.jurisdiction.marketKey,
          toJson(project.jurisdiction.governmentBodies),
          project.jurisdiction.planningPortalUrl,
          project.jurisdiction.notes,
        ),
      this.db
        .prepare(
          `INSERT OR REPLACE INTO projects
           (id, name, lens, status, market_key, thesis, jurisdiction_id, next_use_options_json, alert_ids_json, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          project.id,
          project.name,
          project.lens,
          project.status,
          project.marketKey,
          project.thesis,
          project.jurisdiction.id,
          toJson(project.nextUseOptions),
          toJson(project.alertIds),
          project.createdAt,
          project.updatedAt,
        ),
      this.db
        .prepare(
          `INSERT OR REPLACE INTO watch_states
           (project_id, decision, reason, decided_at, decided_by)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(
          project.watchState.projectId,
          project.watchState.decision,
          project.watchState.reason,
          project.watchState.decidedAt,
          project.watchState.decidedBy,
        ),
    ]);

    return project;
  }

  async updateWatchState(
    projectId: string,
    input: WatchStateInput,
  ): Promise<{ project: Project; watchState: WatchState } | null> {
    if ((await this.ensureSeeded()) === 'memory') {
      return this.memoryFallback.updateWatchState(projectId, input);
    }

    if (!(await this.projectExists(projectId))) {
      return null;
    }

    const decidedAt = new Date().toISOString();
    const watchState: WatchState = {
      projectId,
      decision: input.decision,
      reason: input.reason.trim(),
      decidedAt,
      decidedBy: input.decidedBy?.trim() || 'local-ground-user',
    };

    await this.db.batch([
      this.db.prepare(`UPDATE projects SET status = ?, updated_at = ? WHERE id = ?`).bind(
        input.decision === 'watch' ? 'watching' : 'advancing',
        decidedAt,
        projectId,
      ),
      this.db
        .prepare(
          `INSERT OR REPLACE INTO watch_states
           (project_id, decision, reason, decided_at, decided_by)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(projectId, watchState.decision, watchState.reason, watchState.decidedAt, watchState.decidedBy),
    ]);

    const project = await this.loadProject(projectId);
    if (!project) {
      return null;
    }

    return {
      project,
      watchState,
    };
  }

  async addMemo(projectId: string, input: MemoInput): Promise<{ project: Project; memo: Memo } | null> {
    if ((await this.ensureSeeded()) === 'memory') {
      return this.memoryFallback.addMemo(projectId, input);
    }

    if (!(await this.projectExists(projectId))) {
      return null;
    }

    const now = new Date().toISOString();
    const memo: Memo = {
      id: `memo-${crypto.randomUUID()}`,
      projectId,
      memoType: input.memoType,
      title: input.title.trim(),
      bodyMarkdown: input.bodyMarkdown.trim(),
      sourceRecordIds: input.sourceRecordIds,
      createdAt: now,
      updatedAt: now,
      author: input.author?.trim() || 'local-ground-user',
    };

    const statements: D1PreparedStatement[] = [
      this.db
        .prepare(
          `INSERT OR REPLACE INTO memos
           (id, project_id, memo_type, title, body_markdown, created_at, updated_at, author)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(memo.id, memo.projectId, memo.memoType, memo.title, memo.bodyMarkdown, memo.createdAt, memo.updatedAt, memo.author),
      this.db.prepare(`UPDATE projects SET updated_at = ? WHERE id = ?`).bind(now, projectId),
    ];

    this.pushSourceLinkStatements(statements, 'memo_source_records', 'memo_id', memo.id, memo.sourceRecordIds);
    await this.db.batch(statements);

    const project = await this.loadProject(projectId);
    if (!project) {
      return null;
    }

    return {
      project,
      memo,
    };
  }

  async addSourceRecord(projectId: string, input: SourceRecordInput): Promise<SourceRecordResponse | null> {
    if ((await this.ensureSeeded()) === 'memory') {
      return this.memoryFallback.addSourceRecord(projectId, input);
    }

    const project = await this.loadProject(projectId);
    if (!project) {
      return null;
    }

    const sourceRecord = buildPublicSourceRecord(project, input);
    const positionRow = await this.db
      .prepare(
        `SELECT COALESCE(MAX(position), -1) AS maxPosition
         FROM project_source_records
         WHERE project_id = ?`,
      )
      .bind(projectId)
      .first<{ maxPosition: number }>();
    const nextPosition = (positionRow?.maxPosition ?? -1) + 1;

    await this.db.batch([
      this.db
        .prepare(
          `INSERT OR REPLACE INTO source_records
           (id, title, source_class, rights_status, publisher, source_url, jurisdiction_id, record_type,
            published_at, retrieved_at, update_cadence, summary)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          sourceRecord.id,
          sourceRecord.title,
          sourceRecord.sourceClass,
          sourceRecord.rightsStatus,
          sourceRecord.publisher,
          sourceRecord.sourceUrl,
          sourceRecord.jurisdictionId,
          sourceRecord.recordType,
          sourceRecord.publishedAt,
          sourceRecord.retrievedAt,
          sourceRecord.updateCadence,
          sourceRecord.summary,
        ),
      this.db
        .prepare(
          `INSERT OR REPLACE INTO project_source_records
           (project_id, source_record_id, position)
           VALUES (?, ?, ?)`,
        )
        .bind(projectId, sourceRecord.id, nextPosition),
      this.db.prepare(`UPDATE projects SET updated_at = ? WHERE id = ?`).bind(sourceRecord.retrievedAt, projectId),
    ]);

    const updatedProject = await this.loadProject(projectId);
    if (!updatedProject) {
      return null;
    }

    return {
      sourceRecord,
      project: updatedProject,
    };
  }

  async addAnalystNote(projectId: string, input: AnalystNoteInput): Promise<AnalystNoteResponse | null> {
    if ((await this.ensureSeeded()) === 'memory') {
      return this.memoryFallback.addAnalystNote(projectId, input);
    }

    const project = await this.loadProject(projectId);
    if (!project) {
      return null;
    }

    const sourceRecord = buildAnalystNoteSourceRecord(project, input);
    const positionRow = await this.db
      .prepare(
        `SELECT COALESCE(MAX(position), -1) AS maxPosition
         FROM project_source_records
         WHERE project_id = ?`,
      )
      .bind(projectId)
      .first<{ maxPosition: number }>();
    const nextPosition = (positionRow?.maxPosition ?? -1) + 1;

    await this.db.batch([
      this.db
        .prepare(
          `INSERT OR REPLACE INTO source_records
           (id, title, source_class, rights_status, publisher, source_url, jurisdiction_id, record_type,
            published_at, retrieved_at, update_cadence, summary)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          sourceRecord.id,
          sourceRecord.title,
          sourceRecord.sourceClass,
          sourceRecord.rightsStatus,
          sourceRecord.publisher,
          sourceRecord.sourceUrl,
          sourceRecord.jurisdictionId,
          sourceRecord.recordType,
          sourceRecord.publishedAt,
          sourceRecord.retrievedAt,
          sourceRecord.updateCadence,
          sourceRecord.summary,
        ),
      this.db
        .prepare(
          `INSERT OR REPLACE INTO project_source_records
           (project_id, source_record_id, position)
           VALUES (?, ?, ?)`,
        )
        .bind(projectId, sourceRecord.id, nextPosition),
      this.db.prepare(`UPDATE projects SET updated_at = ? WHERE id = ?`).bind(sourceRecord.retrievedAt, projectId),
    ]);

    const updatedProject = await this.loadProject(projectId);
    if (!updatedProject) {
      return null;
    }

    return {
      sourceRecord,
      project: updatedProject,
    };
  }

  async getBootstrapState(): Promise<BootstrapStateResponse> {
    if ((await this.ensureSeeded()) === 'memory') {
      return this.memoryFallback.getBootstrapState();
    }

    return buildBootstrapState(await this.listFullProjects(), 'd1');
  }

  async resetToBootstrapSeed(): Promise<BootstrapResetResponse> {
    if ((await this.ensureSeeded()) === 'memory') {
      return this.memoryFallback.resetToBootstrapSeed();
    }

    const before = await this.getBootstrapState();
    await this.db.batch(this.buildResetStatements());

    const state = buildSeedState();
    const seedStatements = state.projects.flatMap((project) => this.buildProjectGraphStatements(project, state.sourceRecords));
    if (seedStatements.length > 0) {
      await this.db.batch(seedStatements);
    }

    return {
      before,
      after: await this.getBootstrapState(),
      resetAppliedAt: new Date().toISOString(),
    };
  }

  private async ensureSeeded(): Promise<'d1' | 'memory'> {
    if (!this.seedPromise) {
      this.seedPromise = this.initializeStoreMode();
    }

    await this.seedPromise;
    return this.mode;
  }

  private async initializeStoreMode() {
    const schemaRow = await this.db
      .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'projects'`)
      .first<{ name: string }>();

    if (!schemaRow) {
      this.mode = 'memory';
      return;
    }

    const existing = await this.db.prepare(`SELECT id FROM projects LIMIT 1`).first<{ id: string }>();
    if (existing) {
      return;
    }

    const state = buildSeedState();
    if (state.projects.length === 0) {
      return;
    }

    const statements = state.projects.flatMap((project) => this.buildProjectGraphStatements(project, state.sourceRecords));
    await this.db.batch(statements);
  }

  private async projectExists(projectId: string): Promise<boolean> {
    const row = await this.db.prepare(`SELECT id FROM projects WHERE id = ?`).bind(projectId).first<{ id: string }>();
    return Boolean(row);
  }

  private async loadProject(projectId: string): Promise<Project | null> {
    const projectRow = await this.db.prepare(
      `SELECT id, name, lens, status, market_key AS marketKey, thesis, jurisdiction_id AS jurisdictionId,
              next_use_options_json AS nextUseOptionsJson, alert_ids_json AS alertIdsJson,
              created_at AS createdAt, updated_at AS updatedAt
       FROM projects
       WHERE id = ?`,
    ).bind(projectId).first<ProjectRow>();

    if (!projectRow) {
      return null;
    }

    const [jurisdictionRow, siteRowsResult, claimRowsResult, eventRowsResult, memoRowsResult, watchStateRow] = await Promise.all([
      this.db.prepare(
        `SELECT id, name, state, market_key AS marketKey, government_bodies_json AS governmentBodiesJson,
                planning_portal_url AS planningPortalUrl, notes
         FROM jurisdictions
         WHERE id = ?`,
      ).bind(projectRow.jurisdictionId).first<JurisdictionRow>(),
      this.db.prepare(
        `SELECT id, project_id AS projectId, name, county, state, acreage,
                ownership_status AS ownershipStatus, current_use AS currentUse, geometry_ref AS geometryRef
         FROM site_parcels
         WHERE project_id = ?
         ORDER BY name ASC`,
      ).bind(projectId).all<SiteParcelRow>(),
      this.db.prepare(
        `SELECT id, project_id AS projectId, claim_bucket AS claimBucket, label, value_text AS valueText,
                truth_type AS truthType, confidence, materiality,
                analyst_review_required AS analystReviewRequired, last_reviewed_at AS lastReviewedAt
         FROM evidence_claims
         WHERE project_id = ?
         ORDER BY CASE claim_bucket WHEN 'blocker' THEN 0 WHEN 'unlock' THEN 1 ELSE 2 END, id ASC`,
      ).bind(projectId).all<EvidenceClaimRow>(),
      this.db.prepare(
        `SELECT id, project_id AS projectId, event_type AS eventType, title, happened_at AS happenedAt,
                truth_type AS truthType, confidence, why_it_matters AS whyItMatters
         FROM events
         WHERE project_id = ?
         ORDER BY happened_at DESC, id DESC`,
      ).bind(projectId).all<EventRow>(),
      this.db.prepare(
        `SELECT id, project_id AS projectId, memo_type AS memoType, title, body_markdown AS bodyMarkdown,
                created_at AS createdAt, updated_at AS updatedAt, author
         FROM memos
         WHERE project_id = ?
         ORDER BY created_at DESC, id DESC`,
      ).bind(projectId).all<MemoRow>(),
      this.db.prepare(
        `SELECT project_id AS projectId, decision, reason, decided_at AS decidedAt, decided_by AS decidedBy
         FROM watch_states
         WHERE project_id = ?`,
      ).bind(projectId).first<WatchStateRow>(),
    ]);

    if (!jurisdictionRow) {
      return null;
    }

    const siteRows = siteRowsResult.results ?? [];
    const claimRows = claimRowsResult.results ?? [];
    const eventRows = eventRowsResult.results ?? [];
    const memoRows = memoRowsResult.results ?? [];

    const [projectSourceIdsByOwner, siteSourceIdsByOwner, claimSourceIdsByOwner, eventSourceIdsByOwner, memoSourceIdsByOwner] =
      await Promise.all([
        this.listSourceRecordIdsByOwner('project_source_records', 'project_id', [projectId]),
        this.listSourceRecordIdsByOwner('site_parcel_source_records', 'site_parcel_id', siteRows.map((row) => row.id)),
        this.listSourceRecordIdsByOwner(
          'evidence_claim_source_records',
          'evidence_claim_id',
          claimRows.map((row) => row.id),
        ),
        this.listSourceRecordIdsByOwner('event_source_records', 'event_id', eventRows.map((row) => row.id)),
        this.listSourceRecordIdsByOwner('memo_source_records', 'memo_id', memoRows.map((row) => row.id)),
      ]);

    const blockers: EvidenceClaim[] = [];
    const unlocks: EvidenceClaim[] = [];
    const keyClaims: EvidenceClaim[] = [];

    for (const row of claimRows) {
      const claim: EvidenceClaim = {
        id: row.id,
        label: row.label,
        valueText: row.valueText,
        truthType: row.truthType,
        confidence: row.confidence,
        materiality: row.materiality,
        sourceRecordIds: claimSourceIdsByOwner.get(row.id) ?? [],
        analystReviewRequired: Boolean(row.analystReviewRequired),
        lastReviewedAt: row.lastReviewedAt,
      };

      if (row.claimBucket === 'blocker') {
        blockers.push(claim);
      } else if (row.claimBucket === 'unlock') {
        unlocks.push(claim);
      } else {
        keyClaims.push(claim);
      }
    }

    const project: Project = {
      id: projectRow.id,
      name: projectRow.name,
      lens: projectRow.lens,
      status: projectRow.status,
      marketKey: projectRow.marketKey,
      thesis: projectRow.thesis,
      nextUseOptions: parseJsonArray<string>(projectRow.nextUseOptionsJson),
      blockers,
      unlocks,
      sites: siteRows.map((row) => ({
        id: row.id,
        name: row.name,
        county: row.county,
        state: row.state,
        acreage: row.acreage,
        ownershipStatus: row.ownershipStatus,
        currentUse: row.currentUse,
        geometryRef: row.geometryRef,
        sourceRecordIds: siteSourceIdsByOwner.get(row.id) ?? [],
      })),
      jurisdiction: mapJurisdictionRow(jurisdictionRow),
      keyClaims,
      timeline: eventRows.map((row) => ({
        id: row.id,
        projectId: row.projectId,
        eventType: row.eventType,
        title: row.title,
        happenedAt: row.happenedAt,
        sourceRecordIds: eventSourceIdsByOwner.get(row.id) ?? [],
        truthType: row.truthType,
        confidence: row.confidence,
        whyItMatters: row.whyItMatters,
      })),
      memos: memoRows.map((row) => ({
        id: row.id,
        projectId: row.projectId,
        memoType: row.memoType,
        title: row.title,
        bodyMarkdown: row.bodyMarkdown,
        sourceRecordIds: memoSourceIdsByOwner.get(row.id) ?? [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        author: row.author,
      })),
      watchState: watchStateRow ? mapWatchStateRow(watchStateRow) : defaultWatchState(projectId, projectRow.createdAt),
      alertIds: parseJsonArray<string>(projectRow.alertIdsJson),
      sourceRecordIds: projectSourceIdsByOwner.get(projectId) ?? [],
      createdAt: projectRow.createdAt,
      updatedAt: projectRow.updatedAt,
    };

    return sortEventsDescending(project);
  }

  private async getSourceRecordsByIds(ids: string[]): Promise<SourceRecord[]> {
    if (ids.length === 0) {
      return [];
    }

    const result = await this.db.prepare(
      `SELECT id, title, source_class AS sourceClass, rights_status AS rightsStatus, publisher,
              source_url AS sourceUrl, jurisdiction_id AS jurisdictionId, record_type AS recordType,
              published_at AS publishedAt, retrieved_at AS retrievedAt, update_cadence AS updateCadence, summary
       FROM source_records
       WHERE id IN (${buildPlaceholders(ids.length)})`,
    ).bind(...ids).all<SourceRecordRow>();

    const byId = new Map((result.results ?? []).map((row) => [row.id, mapSourceRecordRow(row)]));
    return ids.flatMap((id) => {
      const record = byId.get(id);
      return record ? [record] : [];
    });
  }

  private async listFullProjects(): Promise<Project[]> {
    const result = await this.db.prepare(
      `SELECT id
       FROM projects
       ORDER BY updated_at DESC, name ASC`,
    ).all<{ id: string }>();

    const projects: Project[] = [];
    for (const row of result.results ?? []) {
      const project = await this.loadProject(row.id);
      if (project) {
        projects.push(project);
      }
    }

    return projects;
  }

  private buildResetStatements(): D1PreparedStatement[] {
    return [
      this.db.prepare(`DELETE FROM memo_source_records`),
      this.db.prepare(`DELETE FROM memos`),
      this.db.prepare(`DELETE FROM event_source_records`),
      this.db.prepare(`DELETE FROM events`),
      this.db.prepare(`DELETE FROM evidence_claim_source_records`),
      this.db.prepare(`DELETE FROM evidence_claims`),
      this.db.prepare(`DELETE FROM site_parcel_source_records`),
      this.db.prepare(`DELETE FROM site_parcels`),
      this.db.prepare(`DELETE FROM project_source_records`),
      this.db.prepare(`DELETE FROM watch_states`),
      this.db.prepare(`DELETE FROM projects`),
      this.db.prepare(`DELETE FROM source_records`),
      this.db.prepare(`DELETE FROM jurisdictions`),
    ];
  }

  private async listSourceRecordIdsByOwner(
    table: string,
    ownerColumn: string,
    ownerIds: string[],
  ): Promise<Map<string, string[]>> {
    if (ownerIds.length === 0) {
      return new Map();
    }

    const result = await this.db.prepare(
      `SELECT ${ownerColumn} AS ownerId, source_record_id AS sourceRecordId
       FROM ${table}
       WHERE ${ownerColumn} IN (${buildPlaceholders(ownerIds.length)})
       ORDER BY ${ownerColumn} ASC, position ASC`,
    ).bind(...ownerIds).all<SourceLinkRow>();

    const grouped = new Map<string, string[]>();
    for (const row of result.results ?? []) {
      const entries = grouped.get(row.ownerId) ?? [];
      entries.push(row.sourceRecordId);
      grouped.set(row.ownerId, entries);
    }

    return grouped;
  }

  private buildProjectGraphStatements(project: Project, sourceRecords: SourceRecord[]): D1PreparedStatement[] {
    const statements: D1PreparedStatement[] = [];

    statements.push(
      this.db
        .prepare(
          `INSERT OR REPLACE INTO jurisdictions
           (id, name, state, market_key, government_bodies_json, planning_portal_url, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          project.jurisdiction.id,
          project.jurisdiction.name,
          project.jurisdiction.state,
          project.jurisdiction.marketKey,
          toJson(project.jurisdiction.governmentBodies),
          project.jurisdiction.planningPortalUrl,
          project.jurisdiction.notes,
        ),
      this.db
        .prepare(
          `INSERT OR REPLACE INTO projects
           (id, name, lens, status, market_key, thesis, jurisdiction_id, next_use_options_json, alert_ids_json, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          project.id,
          project.name,
          project.lens,
          project.status,
          project.marketKey,
          project.thesis,
          project.jurisdiction.id,
          toJson(project.nextUseOptions),
          toJson(project.alertIds),
          project.createdAt,
          project.updatedAt,
        ),
      this.db
        .prepare(
          `INSERT OR REPLACE INTO watch_states
           (project_id, decision, reason, decided_at, decided_by)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .bind(
          project.watchState.projectId,
          project.watchState.decision,
          project.watchState.reason,
          project.watchState.decidedAt,
          project.watchState.decidedBy,
        ),
    );

    for (const sourceRecord of sourceRecords) {
      statements.push(
        this.db
          .prepare(
            `INSERT OR REPLACE INTO source_records
             (id, title, source_class, rights_status, publisher, source_url, jurisdiction_id, record_type,
              published_at, retrieved_at, update_cadence, summary)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            sourceRecord.id,
            sourceRecord.title,
            sourceRecord.sourceClass,
            sourceRecord.rightsStatus,
            sourceRecord.publisher,
            sourceRecord.sourceUrl,
            sourceRecord.jurisdictionId,
            sourceRecord.recordType,
            sourceRecord.publishedAt,
            sourceRecord.retrievedAt,
            sourceRecord.updateCadence,
            sourceRecord.summary,
          ),
      );
    }

    this.pushSourceLinkStatements(statements, 'project_source_records', 'project_id', project.id, project.sourceRecordIds);

    for (const site of project.sites) {
      statements.push(
        this.db
          .prepare(
            `INSERT OR REPLACE INTO site_parcels
             (id, project_id, name, county, state, acreage, ownership_status, current_use, geometry_ref)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            site.id,
            project.id,
            site.name,
            site.county,
            site.state,
            site.acreage,
            site.ownershipStatus,
            site.currentUse,
            site.geometryRef,
          ),
      );
      this.pushSourceLinkStatements(statements, 'site_parcel_source_records', 'site_parcel_id', site.id, site.sourceRecordIds);
    }

    for (const blocker of project.blockers) {
      this.pushClaimStatements(statements, project.id, 'blocker', blocker);
    }
    for (const unlock of project.unlocks) {
      this.pushClaimStatements(statements, project.id, 'unlock', unlock);
    }
    for (const claim of project.keyClaims) {
      this.pushClaimStatements(statements, project.id, 'key_claim', claim);
    }

    for (const event of project.timeline) {
      statements.push(
        this.db
          .prepare(
            `INSERT OR REPLACE INTO events
             (id, project_id, event_type, title, happened_at, truth_type, confidence, why_it_matters)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            event.id,
            project.id,
            event.eventType,
            event.title,
            event.happenedAt,
            event.truthType,
            event.confidence,
            event.whyItMatters,
          ),
      );
      this.pushSourceLinkStatements(statements, 'event_source_records', 'event_id', event.id, event.sourceRecordIds);
    }

    for (const memo of project.memos) {
      statements.push(
        this.db
          .prepare(
            `INSERT OR REPLACE INTO memos
             (id, project_id, memo_type, title, body_markdown, created_at, updated_at, author)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          )
          .bind(
            memo.id,
            project.id,
            memo.memoType,
            memo.title,
            memo.bodyMarkdown,
            memo.createdAt,
            memo.updatedAt,
            memo.author,
          ),
      );
      this.pushSourceLinkStatements(statements, 'memo_source_records', 'memo_id', memo.id, memo.sourceRecordIds);
    }

    return statements;
  }

  private pushClaimStatements(
    statements: D1PreparedStatement[],
    projectId: string,
    bucket: EvidenceClaimBucket,
    claim: EvidenceClaim,
  ) {
    statements.push(
      this.db
        .prepare(
          `INSERT OR REPLACE INTO evidence_claims
           (id, project_id, claim_bucket, label, value_text, truth_type, confidence, materiality, analyst_review_required, last_reviewed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          claim.id,
          projectId,
          bucket,
          claim.label,
          claim.valueText,
          claim.truthType,
          claim.confidence,
          claim.materiality,
          claim.analystReviewRequired ? 1 : 0,
          claim.lastReviewedAt,
        ),
    );

    this.pushSourceLinkStatements(
      statements,
      'evidence_claim_source_records',
      'evidence_claim_id',
      claim.id,
      claim.sourceRecordIds,
    );
  }

  private pushSourceLinkStatements(
    statements: D1PreparedStatement[],
    table: string,
    ownerColumn: string,
    ownerId: string,
    sourceRecordIds: string[],
  ) {
    sourceRecordIds.forEach((sourceRecordId, index) => {
      statements.push(
        this.db
          .prepare(
            `INSERT OR REPLACE INTO ${table}
             (${ownerColumn}, source_record_id, position)
             VALUES (?, ?, ?)`,
          )
          .bind(ownerId, sourceRecordId, index),
      );
    });
  }
}

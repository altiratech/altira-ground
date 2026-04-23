import type {
  AnalystNoteInput,
  AnalystNoteResponse,
  BootstrapResetResponse,
  BootstrapStateResponse,
  FeedResponse,
  Memo,
  MemoInput,
  Project,
  ProjectCreateInput,
  ProjectResponse,
  ProjectsResponse,
  ProjectSummary,
  SourceRecord,
  SourceRecordInput,
  SourceRecordResponse,
  WatchState,
  WatchStateInput,
} from '@ground/shared';
import { GROUND_BOOTSTRAP_SEED_VERSION, buildSeedState, getBootstrapSeedProjects, seedProjects } from './seed';

export type GroundState = {
  projects: Project[];
  sourceRecords: SourceRecord[];
};

export interface GroundStore {
  listProjects(): Promise<ProjectsResponse>;
  getProject(projectId: string): Promise<ProjectResponse | null>;
  getProjectFeed(projectId: string): Promise<FeedResponse | null>;
  createProject(input: ProjectCreateInput): Promise<Project>;
  updateWatchState(projectId: string, input: WatchStateInput): Promise<{ project: Project; watchState: WatchState } | null>;
  addMemo(projectId: string, input: MemoInput): Promise<{ project: Project; memo: Memo } | null>;
  addSourceRecord(projectId: string, input: SourceRecordInput): Promise<SourceRecordResponse | null>;
  addAnalystNote(projectId: string, input: AnalystNoteInput): Promise<AnalystNoteResponse | null>;
  getBootstrapState(): Promise<BootstrapStateResponse>;
  resetToBootstrapSeed(): Promise<BootstrapResetResponse>;
}

export function toProjectSummary(project: Project): ProjectSummary {
  return {
    id: project.id,
    name: project.name,
    lens: project.lens,
    status: project.status,
    marketKey: project.marketKey,
    thesis: project.thesis,
    latestEventAt: project.timeline[0]?.happenedAt ?? null,
    watchDecision: project.watchState.decision,
  };
}

export function sortEventsDescending(project: Project): Project {
  return {
    ...project,
    timeline: [...project.timeline].sort((left, right) => right.happenedAt.localeCompare(left.happenedAt)),
  };
}

export function collectProjectSourceRecordIds(project: Project): string[] {
  const sourceRecordIds = new Set<string>();

  const pushIds = (ids: string[]) => {
    ids.forEach((id) => {
      sourceRecordIds.add(id);
    });
  };

  pushIds(project.sourceRecordIds);
  project.sites.forEach((site) => pushIds(site.sourceRecordIds));
  project.blockers.forEach((claim) => pushIds(claim.sourceRecordIds));
  project.unlocks.forEach((claim) => pushIds(claim.sourceRecordIds));
  project.keyClaims.forEach((claim) => pushIds(claim.sourceRecordIds));
  project.timeline.forEach((event) => pushIds(event.sourceRecordIds));
  project.memos.forEach((memo) => pushIds(memo.sourceRecordIds));

  return [...sourceRecordIds];
}

export function buildBootstrapState(projects: Project[], mode: BootstrapStateResponse['mode']): BootstrapStateResponse {
  const currentProjects = projects.map(sortEventsDescending).map(toProjectSummary);
  const seedProjectIds = new Set(seedProjects.map((project) => project.id));
  const currentProjectIds = new Set(currentProjects.map((project) => project.id));

  return {
    mode,
    seedVersion: GROUND_BOOTSTRAP_SEED_VERSION,
    seedProjects: getBootstrapSeedProjects(),
    currentProjects,
    currentProjectCount: currentProjects.length,
    missingSeedProjectIds: [...seedProjectIds].filter((projectId) => !currentProjectIds.has(projectId)),
    extraProjectIds: [...currentProjectIds].filter((projectId) => !seedProjectIds.has(projectId)),
    canResetToSeed: true,
  };
}

function nowIso() {
  return new Date().toISOString();
}

export function buildAnalystNoteSourceRecord(project: Project, input: AnalystNoteInput, createdAt = nowIso()): SourceRecord {
  return {
    id: `src-ground-analyst-note-${crypto.randomUUID()}`,
    title: input.title.trim(),
    sourceClass: 'manual',
    rightsStatus: 'approved',
    publisher: input.author?.trim() || 'Ground analyst',
    sourceUrl: null,
    jurisdictionId: project.jurisdiction.id,
    recordType: 'manual_note',
    publishedAt: null,
    retrievedAt: createdAt,
    updateCadence: 'one_time',
    summary: input.summary.trim(),
  };
}

export function buildPublicSourceRecord(project: Project, input: SourceRecordInput, createdAt = nowIso()): SourceRecord {
  return {
    id: `src-ground-public-source-${crypto.randomUUID()}`,
    title: input.title.trim(),
    sourceClass: 'official_public',
    rightsStatus: 'approved',
    publisher: input.publisher.trim(),
    sourceUrl: input.sourceUrl.trim(),
    jurisdictionId: project.jurisdiction.id,
    recordType: input.recordType,
    publishedAt: input.publishedAt?.trim() || null,
    retrievedAt: createdAt,
    updateCadence: 'one_time',
    summary: input.summary.trim(),
  };
}

export function buildNewProject(input: ProjectCreateInput, createdAt = nowIso()): Project {
  const projectId = `project-${crypto.randomUUID()}`;

  return {
    id: projectId,
    name: input.name.trim(),
    lens: 'industrial_development',
    status: 'sourced',
    marketKey: input.marketKey,
    thesis: input.thesis.trim(),
    nextUseOptions: [],
    blockers: [],
    unlocks: [],
    sites: [],
    jurisdiction: {
      id: `jurisdiction-${crypto.randomUUID()}`,
      name: 'Unknown jurisdiction',
      state: 'TX',
      marketKey: input.marketKey,
      governmentBodies: [],
      planningPortalUrl: null,
      notes: null,
    },
    keyClaims: [],
    timeline: [],
    memos: [],
    watchState: {
      projectId,
      decision: 'none',
      reason: 'No decision captured yet.',
      decidedAt: createdAt,
      decidedBy: 'system',
    },
    alertIds: [],
    sourceRecordIds: [],
    createdAt,
    updatedAt: createdAt,
  };
}

export class MemoryGroundStore implements GroundStore {
  private state: GroundState;

  constructor(initialState: GroundState = buildSeedState()) {
    this.state = structuredClone(initialState);
  }

  async listProjects(): Promise<ProjectsResponse> {
    return {
      projects: this.state.projects.map(sortEventsDescending).map(toProjectSummary),
    };
  }

  async getProject(projectId: string): Promise<ProjectResponse | null> {
    const project = this.state.projects.find((entry) => entry.id === projectId);
    if (!project) {
      return null;
    }

    const orderedProject = sortEventsDescending(project);
    return {
      project: orderedProject,
      sourceRecords: this.getSourceRecordsByIds(collectProjectSourceRecordIds(orderedProject)),
    };
  }

  async getProjectFeed(projectId: string): Promise<FeedResponse | null> {
    const project = this.state.projects.find((entry) => entry.id === projectId);
    if (!project) {
      return null;
    }

    const orderedProject = sortEventsDescending(project);
    const sourceRecordIds = new Set(orderedProject.timeline.flatMap((event) => event.sourceRecordIds));

    return {
      events: orderedProject.timeline,
      sourceRecords: this.getSourceRecordsByIds([...sourceRecordIds]),
    };
  }

  async createProject(input: ProjectCreateInput): Promise<Project> {
    const nextProject = buildNewProject(input);
    this.state.projects = [nextProject, ...this.state.projects];
    return nextProject;
  }

  async updateWatchState(
    projectId: string,
    input: WatchStateInput,
  ): Promise<{ project: Project; watchState: WatchState } | null> {
    const project = this.state.projects.find((entry) => entry.id === projectId);
    if (!project) {
      return null;
    }

    const now = nowIso();
    const watchState: WatchState = {
      projectId,
      decision: input.decision,
      reason: input.reason.trim(),
      decidedAt: now,
      decidedBy: input.decidedBy?.trim() || 'local-ground-user',
    };

    project.watchState = watchState;
    project.status = input.decision === 'watch' ? 'watching' : 'advancing';
    project.updatedAt = now;

    return {
      project: sortEventsDescending(project),
      watchState,
    };
  }

  async addMemo(projectId: string, input: MemoInput): Promise<{ project: Project; memo: Memo } | null> {
    const project = this.state.projects.find((entry) => entry.id === projectId);
    if (!project) {
      return null;
    }

    const now = nowIso();
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

    project.memos = [memo, ...project.memos];
    project.updatedAt = now;

    return {
      project: sortEventsDescending(project),
      memo,
    };
  }

  async addSourceRecord(projectId: string, input: SourceRecordInput): Promise<SourceRecordResponse | null> {
    const project = this.state.projects.find((entry) => entry.id === projectId);
    if (!project) {
      return null;
    }

    const sourceRecord = buildPublicSourceRecord(project, input);
    this.state.sourceRecords = [...this.state.sourceRecords, sourceRecord];
    project.sourceRecordIds = [...project.sourceRecordIds, sourceRecord.id];
    project.updatedAt = sourceRecord.retrievedAt;

    return {
      sourceRecord,
      project: sortEventsDescending(project),
    };
  }

  async addAnalystNote(projectId: string, input: AnalystNoteInput): Promise<AnalystNoteResponse | null> {
    const project = this.state.projects.find((entry) => entry.id === projectId);
    if (!project) {
      return null;
    }

    const sourceRecord = buildAnalystNoteSourceRecord(project, input);
    this.state.sourceRecords = [...this.state.sourceRecords, sourceRecord];
    project.sourceRecordIds = [...project.sourceRecordIds, sourceRecord.id];
    project.updatedAt = sourceRecord.retrievedAt;

    return {
      sourceRecord,
      project: sortEventsDescending(project),
    };
  }

  async getBootstrapState(): Promise<BootstrapStateResponse> {
    return buildBootstrapState(this.state.projects, 'memory');
  }

  async resetToBootstrapSeed(): Promise<BootstrapResetResponse> {
    const before = await this.getBootstrapState();
    this.state = structuredClone(buildSeedState());

    return {
      before,
      after: await this.getBootstrapState(),
      resetAppliedAt: nowIso(),
    };
  }

  private getSourceRecordsByIds(ids: string[]) {
    const idSet = new Set(ids);
    return this.state.sourceRecords.filter((record) => idSet.has(record.id));
  }
}

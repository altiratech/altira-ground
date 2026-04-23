import type {
  AnalystNoteInput,
  AnalystNoteResponse,
  FeedResponse,
  MemoInput,
  MemoResponse,
  ProjectCreateInput,
  ProjectCreateResponse,
  ProjectResponse,
  ProjectsResponse,
  SourceRecordInput,
  SourceRecordResponse,
  WatchStateInput,
  WatchStateResponse,
} from '@ground/shared';

type GroundReviewGlobal = typeof globalThis & {
  __GROUND_API_BASE__?: string;
};

function resolveApiBase() {
  const reviewApiBase = (globalThis as GroundReviewGlobal).__GROUND_API_BASE__;
  if (typeof reviewApiBase === 'string' && reviewApiBase.trim().length > 0) {
    return reviewApiBase.trim();
  }

  const viteEnv = (import.meta as ImportMeta & { env?: { VITE_API_URL?: string } }).env;
  if (typeof viteEnv?.VITE_API_URL === 'string' && viteEnv.VITE_API_URL.trim().length > 0) {
    return viteEnv.VITE_API_URL.trim();
  }

  return '';
}

const API_BASE = resolveApiBase();

export function getProjects(): Promise<ProjectsResponse> {
  return requestJson<ProjectsResponse>('/api/v1/projects');
}

export function createProject(input: ProjectCreateInput): Promise<ProjectCreateResponse> {
  return requestJson<ProjectCreateResponse>('/api/v1/projects', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getProject(projectId: string): Promise<ProjectResponse> {
  return requestJson<ProjectResponse>(`/api/v1/projects/${projectId}`);
}

export function getProjectFeed(projectId: string): Promise<FeedResponse> {
  return requestJson<FeedResponse>(`/api/v1/projects/${projectId}/feed`);
}

export function createAnalystNote(projectId: string, input: AnalystNoteInput): Promise<AnalystNoteResponse> {
  return requestJson<AnalystNoteResponse>(`/api/v1/projects/${projectId}/analyst-notes`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function createSourceRecord(projectId: string, input: SourceRecordInput): Promise<SourceRecordResponse> {
  return requestJson<SourceRecordResponse>(`/api/v1/projects/${projectId}/source-records`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateWatchState(projectId: string, input: WatchStateInput): Promise<WatchStateResponse> {
  return requestJson<WatchStateResponse>(`/api/v1/projects/${projectId}/watch-state`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function createMemo(projectId: string, input: MemoInput): Promise<MemoResponse> {
  return requestJson<MemoResponse>(`/api/v1/projects/${projectId}/memos`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

function api(path: string) {
  return `${API_BASE}${path}`;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(api(path), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

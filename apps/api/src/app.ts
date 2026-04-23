import { Hono } from 'hono';
import type { Context } from 'hono';
import type { AnalystNoteInput, MemoInput, ProjectCreateInput, SourceRecordInput, WatchStateInput } from '@ground/shared';
import { D1GroundStore } from './d1-store';
import { MemoryGroundStore, type GroundStore } from './store';

export type Bindings = {
  APP_NAME?: string;
  APP_STAGE?: string;
  DB?: D1Database;
  STORE?: GroundStore;
};

type AppContext = Context<{ Bindings: Bindings }>;

const fallbackStore = new MemoryGroundStore();
const d1StoreCache = new WeakMap<D1Database, D1GroundStore>();

function jsonError(c: AppContext, status: 400 | 404, error: string) {
  return c.json({ error }, { status });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isLocalControlEnabled(env?: Bindings) {
  return (env?.APP_STAGE ?? 'local') === 'local';
}

export function resolveStore(env?: Bindings, storeOverride?: GroundStore): GroundStore {
  if (storeOverride) {
    return storeOverride;
  }

  if (env?.STORE) {
    return env.STORE;
  }

  if (env?.DB) {
    const cached = d1StoreCache.get(env.DB);
    if (cached) {
      return cached;
    }

    const next = new D1GroundStore(env.DB);
    d1StoreCache.set(env.DB, next);
    return next;
  }

  return fallbackStore;
}

export function createApp(storeOverride?: GroundStore) {
  const app = new Hono<{ Bindings: Bindings }>();

  app.get('/health', (c) =>
    c.json({
      ok: true as const,
      app: c.env?.APP_NAME ?? 'Altira Ground',
      stage: c.env?.APP_STAGE ?? 'local',
    }),
  );

  app.get('/api/v1/local/bootstrap', async (c) => {
    if (!isLocalControlEnabled(c.env)) {
      return jsonError(c, 404, 'Not found.');
    }

    const store = resolveStore(c.env, storeOverride);
    return c.json(await store.getBootstrapState());
  });

  app.post('/api/v1/local/bootstrap/reset', async (c) => {
    if (!isLocalControlEnabled(c.env)) {
      return jsonError(c, 404, 'Not found.');
    }

    const store = resolveStore(c.env, storeOverride);
    return c.json(await store.resetToBootstrapSeed());
  });

  app.get('/api/v1/projects', async (c) => {
    const store = resolveStore(c.env, storeOverride);
    return c.json(await store.listProjects());
  });

  app.post('/api/v1/projects', async (c) => {
    const store = resolveStore(c.env, storeOverride);
    const body = await c.req
      .json<Partial<ProjectCreateInput>>()
      .catch((): Partial<ProjectCreateInput> => ({}));

    if (!isNonEmptyString(body.name) || !isNonEmptyString(body.thesis) || body.marketKey !== 'texas_ercot_corridor') {
      return jsonError(c, 400, 'Project creation requires name, thesis, and marketKey=texas_ercot_corridor.');
    }

    const project = await store.createProject({
      name: body.name,
      marketKey: body.marketKey,
      thesis: body.thesis,
    });

    return c.json({ project }, 201);
  });

  app.get('/api/v1/projects/:projectId', async (c) => {
    const store = resolveStore(c.env, storeOverride);
    const project = await store.getProject(c.req.param('projectId'));
    if (!project) {
      return jsonError(c, 404, 'Project not found.');
    }

    return c.json(project);
  });

  app.get('/api/v1/projects/:projectId/feed', async (c) => {
    const store = resolveStore(c.env, storeOverride);
    const feed = await store.getProjectFeed(c.req.param('projectId'));
    if (!feed) {
      return jsonError(c, 404, 'Project feed not found.');
    }

    return c.json(feed);
  });

  app.post('/api/v1/projects/:projectId/source-records', async (c) => {
    const store = resolveStore(c.env, storeOverride);
    const body = await c.req.json<SourceRecordInput>().catch(() => null);
    const allowedRecordTypes = [
      'parcel_record',
      'zoning_record',
      'agenda_item',
      'permit_record',
      'hazard_layer',
      'infrastructure_record',
      'imagery_layer',
    ] as const;

    if (
      !body ||
      !isNonEmptyString(body.title) ||
      !isNonEmptyString(body.publisher) ||
      !isNonEmptyString(body.summary) ||
      !isNonEmptyString(body.sourceUrl) ||
      !isValidHttpUrl(body.sourceUrl) ||
      !allowedRecordTypes.includes(body.recordType)
    ) {
      return jsonError(
        c,
        400,
        'Source record creation requires title, publisher, summary, a valid http(s) sourceUrl, and an allowed recordType.',
      );
    }

    const created = await store.addSourceRecord(c.req.param('projectId'), body);
    if (!created) {
      return jsonError(c, 404, 'Project not found.');
    }

    return c.json(created, 201);
  });

  app.post('/api/v1/projects/:projectId/analyst-notes', async (c) => {
    const store = resolveStore(c.env, storeOverride);
    const body = await c.req.json<AnalystNoteInput>().catch(() => null);
    if (!body || !isNonEmptyString(body.title) || !isNonEmptyString(body.summary)) {
      return jsonError(c, 400, 'Analyst note creation requires title and summary.');
    }

    const created = await store.addAnalystNote(c.req.param('projectId'), body);
    if (!created) {
      return jsonError(c, 404, 'Project not found.');
    }

    return c.json(created, 201);
  });

  app.post('/api/v1/projects/:projectId/watch-state', async (c) => {
    const store = resolveStore(c.env, storeOverride);
    const body = await c.req.json<WatchStateInput>().catch(() => null);
    if (!body || (body.decision !== 'watch' && body.decision !== 'advance') || !isNonEmptyString(body.reason)) {
      return jsonError(c, 400, 'Watch updates require decision=watch|advance and a non-empty reason.');
    }

    const updated = await store.updateWatchState(c.req.param('projectId'), body);
    if (!updated) {
      return jsonError(c, 404, 'Project not found.');
    }

    return c.json(updated, 201);
  });

  app.post('/api/v1/projects/:projectId/memos', async (c) => {
    const store = resolveStore(c.env, storeOverride);
    const body = await c.req.json<MemoInput>().catch(() => null);
    if (
      !body ||
      !isNonEmptyString(body.title) ||
      !isNonEmptyString(body.bodyMarkdown) ||
      !Array.isArray(body.sourceRecordIds) ||
      body.sourceRecordIds.length === 0 ||
      body.sourceRecordIds.some((sourceId) => !isNonEmptyString(sourceId))
    ) {
      return jsonError(c, 400, 'Memo creation requires title, bodyMarkdown, and at least one cited sourceRecordId.');
    }

    if (!['screen', 'diligence', 'investment_committee'].includes(body.memoType)) {
      return jsonError(c, 400, 'Memo type must be screen, diligence, or investment_committee.');
    }

    const created = await store.addMemo(c.req.param('projectId'), body);
    if (!created) {
      return jsonError(c, 404, 'Project not found.');
    }

    return c.json(created, 201);
  });

  return app;
}

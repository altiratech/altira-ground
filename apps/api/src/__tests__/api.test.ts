import { describe, expect, it } from 'vitest';
import { createApp } from '../app';
import { MemoryGroundStore } from '../store';
import type {
  AnalystNoteResponse,
  BootstrapResetResponse,
  BootstrapStateResponse,
  HealthResponse,
  MemoResponse,
  ProjectCreateResponse,
  ProjectResponse,
  ProjectsResponse,
  SourceRecordResponse,
  WatchStateResponse,
} from '@ground/shared';

describe('altira-ground api', () => {
  it('serves health', async () => {
    const app = createApp(new MemoryGroundStore());
    const response = await app.request('/health');
    const payload = (await response.json()) as HealthResponse;

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.app).toBe('Altira Ground');
  });

  it('returns seeded projects', async () => {
    const app = createApp(new MemoryGroundStore());
    const response = await app.request('/api/v1/projects');
    const payload = (await response.json()) as ProjectsResponse;

    expect(response.status).toBe(200);
    expect(payload.projects).toHaveLength(2);
    expect(payload.projects[0].id).toBe('project-ti-sherman');
    expect(payload.projects[0].watchDecision).toBe('watch');
    expect(payload.projects[1].id).toBe('project-globalwafers-sherman');
    expect(payload.projects[1].watchDecision).toBe('none');
  });

  it('returns seeded project detail with source records', async () => {
    const app = createApp(new MemoryGroundStore());
    const response = await app.request('/api/v1/projects/project-ti-sherman');
    const payload = (await response.json()) as ProjectResponse;

    expect(response.status).toBe(200);
    expect(payload.project.name).toBe('TI Sherman Manufacturing Mega-Site');
    expect(payload.project.blockers.length).toBeGreaterThan(0);
    expect(payload.sourceRecords.length).toBeGreaterThan(5);
    expect(payload.sourceRecords.some((record) => record.id === 'src-ti-2025-production')).toBe(true);
    expect(payload.sourceRecords.some((record) => record.id === 'src-sherman-planning-zoning-portal')).toBe(true);
    expect(payload.sourceRecords.some((record) => record.id === 'src-sherman-pz-commission')).toBe(true);
    expect(payload.sourceRecords.some((record) => record.id === 'src-fema-flood-maps')).toBe(true);
    expect(payload.sourceRecords.some((record) => record.id === 'src-grayson-cad-property-search')).toBe(true);
    expect(payload.sourceRecords.some((record) => record.id === 'src-ground-analyst-note-ti-watch-rationale')).toBe(true);
    expect(payload.project.memos[0]?.id).toBe('memo-ti-sherman-analyst-watch-note');
  });

  it('returns globalwafers detail with explicit sourced-rationale note', async () => {
    const app = createApp(new MemoryGroundStore());
    const response = await app.request('/api/v1/projects/project-globalwafers-sherman');
    const payload = (await response.json()) as ProjectResponse;

    expect(response.status).toBe(200);
    expect(payload.sourceRecords.some((record) => record.id === 'src-ground-analyst-note-globalwafers-coverage-rationale')).toBe(true);
    expect(payload.project.memos[0]?.title).toBe('Why GlobalWafers stays sourced');
    expect(payload.project.watchState.decision).toBe('none');
  });

  it('updates watch state', async () => {
    const app = createApp(new MemoryGroundStore());
    const response = await app.request('/api/v1/projects/project-ti-sherman/watch-state', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        decision: 'advance',
        reason: 'Infrastructure posture and production start justify moving this pilot dossier into an advance state.',
      }),
    });
    const payload = (await response.json()) as WatchStateResponse;

    expect(response.status).toBe(201);
    expect(payload.watchState.decision).toBe('advance');
    expect(payload.project.status).toBe('advancing');
  });

  it('creates a new manual project and lists it in coverage', async () => {
    const app = createApp(new MemoryGroundStore());
    const createResponse = await app.request('/api/v1/projects', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Sherman Supplier Campus',
        marketKey: 'texas_ercot_corridor',
        thesis: 'Track adjacent industrial supplier activity around the Sherman manufacturing corridor.',
      }),
    });
    const created = (await createResponse.json()) as ProjectCreateResponse;

    expect(createResponse.status).toBe(201);
    expect(created.project.name).toBe('Sherman Supplier Campus');
    expect(created.project.status).toBe('sourced');
    expect(created.project.watchState.decision).toBe('none');

    const listResponse = await app.request('/api/v1/projects');
    const listPayload = (await listResponse.json()) as ProjectsResponse;

    expect(listResponse.status).toBe(200);
    expect(listPayload.projects).toHaveLength(3);
    expect(listPayload.projects[0].id).toBe(created.project.id);
    expect(listPayload.projects[0].watchDecision).toBe('none');
  });

  it('creates a memo and returns the updated dossier memo trail', async () => {
    const app = createApp(new MemoryGroundStore());
    const response = await app.request('/api/v1/projects/project-ti-sherman/memos', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        memoType: 'diligence',
        title: 'Infrastructure follow-up',
        bodyMarkdown: 'Check the timing and scope of water and wastewater delivery against site-adjacent expansion assumptions.',
        author: 'Ground smoke test',
        sourceRecordIds: ['src-sherman-infrastructure-program', 'src-ti-2025-production'],
      }),
    });
    const payload = (await response.json()) as MemoResponse;

    expect(response.status).toBe(201);
    expect(payload.memo.memoType).toBe('diligence');
    expect(payload.memo.sourceRecordIds).toEqual(['src-sherman-infrastructure-program', 'src-ti-2025-production']);
    expect(payload.project.memos[0]?.id).toBe(payload.memo.id);
    expect(payload.project.memos[0]?.title).toBe('Infrastructure follow-up');
  });

  it('rejects a memo without cited sources', async () => {
    const app = createApp(new MemoryGroundStore());
    const response = await app.request('/api/v1/projects/project-ti-sherman/memos', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        memoType: 'screen',
        title: 'Uncited memo',
        bodyMarkdown: 'This should not save because it has no cited source record.',
        author: 'Ground smoke test',
        sourceRecordIds: [],
      }),
    });

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toContain('at least one cited sourceRecordId');
  });

  it('creates an analyst note and returns the updated dossier source trail', async () => {
    const app = createApp(new MemoryGroundStore());
    const response = await app.request('/api/v1/projects/project-globalwafers-sherman/analyst-notes', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Ground analyst note: sourced cluster read still matters',
        summary:
          'Keep GlobalWafers sourced because it preserves the Sherman cluster story, but do not treat this as watch-level conviction until direct execution timing and site control are clearer.',
        author: 'Ground smoke test',
      }),
    });
    const payload = (await response.json()) as AnalystNoteResponse;

    expect(response.status).toBe(201);
    expect(payload.sourceRecord.recordType).toBe('manual_note');
    expect(payload.sourceRecord.sourceClass).toBe('manual');
    expect(payload.sourceRecord.publisher).toBe('Ground smoke test');
    expect(payload.project.sourceRecordIds).toContain(payload.sourceRecord.id);
  });

  it('creates a public source record and returns the updated dossier source trail', async () => {
    const app = createApp(new MemoryGroundStore());
    const response = await app.request('/api/v1/projects/project-ti-sherman/source-records', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Sherman infrastructure program detail',
        publisher: 'City of Sherman',
        sourceUrl: 'https://cityofsherman.com/1247/Major-Infrastructure-Improvements-Progra',
        recordType: 'infrastructure_record',
        summary: 'Adds one more public infrastructure record to the dossier source trail.',
        publishedAt: '2026-03-26',
      }),
    });
    const payload = (await response.json()) as SourceRecordResponse;

    expect(response.status).toBe(201);
    expect(payload.sourceRecord.recordType).toBe('infrastructure_record');
    expect(payload.sourceRecord.sourceClass).toBe('official_public');
    expect(payload.sourceRecord.publisher).toBe('City of Sherman');
    expect(payload.sourceRecord.sourceUrl).toBe('https://cityofsherman.com/1247/Major-Infrastructure-Improvements-Progra');
    expect(payload.project.sourceRecordIds).toContain(payload.sourceRecord.id);
  });

  it('previews bootstrap state and resets back to the seeded coverage set', async () => {
    const app = createApp(new MemoryGroundStore());

    const createResponse = await app.request('/api/v1/projects', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Sherman Utility Support Parcel',
        marketKey: 'texas_ercot_corridor',
        thesis: 'Track utility-adjacent industrial support activity around the Sherman cluster.',
      }),
    });
    const created = (await createResponse.json()) as ProjectCreateResponse;

    const previewResponse = await app.request('/api/v1/local/bootstrap');
    const preview = (await previewResponse.json()) as BootstrapStateResponse;

    expect(previewResponse.status).toBe(200);
    expect(preview.seedProjects).toHaveLength(2);
    expect(preview.currentProjectCount).toBe(3);
    expect(preview.extraProjectIds).toContain(created.project.id);
    expect(preview.missingSeedProjectIds).toEqual([]);

    const resetResponse = await app.request('/api/v1/local/bootstrap/reset', {
      method: 'POST',
    });
    const reset = (await resetResponse.json()) as BootstrapResetResponse;

    expect(resetResponse.status).toBe(200);
    expect(reset.before.currentProjectCount).toBe(3);
    expect(reset.before.extraProjectIds).toContain(created.project.id);
    expect(reset.after.currentProjectCount).toBe(2);
    expect(reset.after.extraProjectIds).toEqual([]);
    expect(reset.after.currentProjects.map((project) => project.id)).toEqual([
      'project-ti-sherman',
      'project-globalwafers-sherman',
    ]);
  });
});

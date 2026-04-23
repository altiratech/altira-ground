#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { buildGroundApiModule } from './lib/build_api_bundle.mjs';
import { LocalD1Database } from './lib/local_d1_database.mjs';

const [rootDir, sqlitePath] = process.argv.slice(2);

if (!rootDir || !sqlitePath) {
  throw new Error('Usage: verify_d1_write_paths_inprocess.mjs <repo-root> <sqlite-path>');
}

const tmpDir = path.join(rootDir, '.tmp');
const createFile = path.join(tmpDir, 'ground-create-project-inprocess.json');
const sourceRecordFile = path.join(tmpDir, 'ground-create-source-record-inprocess.json');
const analystNoteFile = path.join(tmpDir, 'ground-create-analyst-note-inprocess.json');
const memoFile = path.join(tmpDir, 'ground-create-memo-inprocess.json');
const listFile = path.join(tmpDir, 'ground-project-list-inprocess.json');
const detailFile = path.join(tmpDir, 'ground-project-detail-inprocess-after-restart.json');
const bundleEntryFile = path.join(tmpDir, 'ground-inprocess-api-entry.ts');
const bundleFile = path.join(tmpDir, 'ground-inprocess-api-bundle.mjs');

mkdirSync(tmpDir, { recursive: true });

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function buildStamp(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  const seconds = `${date.getSeconds()}`.padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

async function requestJson(app, input, init) {
  const response = await app.request(input, init);
  const payload = await response.json();

  return { response, payload };
}

const stamp = buildStamp();
const projectName = `Ground In-Process Intake ${stamp}`;
const projectThesis =
  'Track a manually seeded ERCOT corridor project shell and verify that Ground persists dossier-adjacent write paths through the in-process D1 route path.';
const sourceRecordTitle = `Ground review source packet ${stamp}`;
const sourceRecordSummary =
  'Verification source record for the in-process D1-backed API surface. This should remain attached as a public source after the app is re-instantiated.';
const analystNoteTitle = `Ground analyst note: in-process route check ${stamp}`;
const analystNoteSummary =
  'Verification note for the in-process D1-backed API surface. This should remain attached as a manual analyst source after the app is re-instantiated.';
const memoTitle = `In-process D1 write-path memo ${stamp}`;
const memoBody =
  'Verification memo for the in-process D1-backed API surface. This note should still be attached to the created project after the app is re-instantiated.';

const { createApp, D1GroundStore } = await buildGroundApiModule({
  bundleFile,
  entryFile: bundleEntryFile,
  rootDir,
});

const app = createApp(new D1GroundStore(new LocalD1Database(sqlitePath)));
const { response: createResponse, payload: created } = await requestJson(app, '/api/v1/projects', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    name: projectName,
    marketKey: 'texas_ercot_corridor',
    thesis: projectThesis,
  }),
});

writeFileSync(createFile, JSON.stringify(created, null, 2));
assert(createResponse.status === 201, `Expected project creation to return 201, got ${createResponse.status}.`);
assert(created?.project?.id, 'Created project response did not include a project id.');

const projectId = created.project.id;
const { response: sourceRecordResponse, payload: createdSourceRecordPayload } = await requestJson(
  app,
  `/api/v1/projects/${projectId}/source-records`,
  {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      title: sourceRecordTitle,
      publisher: 'Ground D1 in-process verification',
      sourceUrl: 'https://ground.local/review-source',
      recordType: 'permit_record',
      summary: sourceRecordSummary,
      publishedAt: '2026-03-26',
    }),
  },
);

writeFileSync(sourceRecordFile, JSON.stringify(createdSourceRecordPayload, null, 2));
assert(sourceRecordResponse.status === 201, `Expected source record creation to return 201, got ${sourceRecordResponse.status}.`);

const createdSourceRecord = createdSourceRecordPayload.sourceRecord;
assert(createdSourceRecord?.id, 'Created source record response did not include a source record id.');

const { response: analystNoteResponse, payload: createdAnalystNotePayload } = await requestJson(
  app,
  `/api/v1/projects/${projectId}/analyst-notes`,
  {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      title: analystNoteTitle,
      summary: analystNoteSummary,
      author: 'Ground D1 in-process verification',
    }),
  },
);

writeFileSync(analystNoteFile, JSON.stringify(createdAnalystNotePayload, null, 2));
assert(analystNoteResponse.status === 201, `Expected analyst note creation to return 201, got ${analystNoteResponse.status}.`);

const createdAnalystNote = createdAnalystNotePayload.sourceRecord;
assert(createdAnalystNote?.id, 'Created analyst note response did not include a source record id.');

const { response: memoResponse, payload: createdMemoPayload } = await requestJson(app, `/api/v1/projects/${projectId}/memos`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    memoType: 'screen',
    title: memoTitle,
    bodyMarkdown: memoBody,
    author: 'Ground D1 in-process verification',
    sourceRecordIds: [createdSourceRecord.id, createdAnalystNote.id],
  }),
});

writeFileSync(memoFile, JSON.stringify(createdMemoPayload, null, 2));
assert(memoResponse.status === 201, `Expected memo creation to return 201, got ${memoResponse.status}.`);

const { response: listResponse, payload: projectList } = await requestJson(app, '/api/v1/projects');
writeFileSync(listFile, JSON.stringify(projectList, null, 2));
assert(listResponse.status === 200, `Expected project list to return 200, got ${listResponse.status}.`);

const appAfterRestart = createApp(new D1GroundStore(new LocalD1Database(sqlitePath)));
const { response: detailResponse, payload: detail } = await requestJson(appAfterRestart, `/api/v1/projects/${projectId}`);
writeFileSync(detailFile, JSON.stringify(detail, null, 2));
assert(detailResponse.status === 200, `Expected project detail to return 200 after restart, got ${detailResponse.status}.`);

const createdProject = created.project;
const createdMemo = createdMemoPayload.memo;
const persistedAnalystNote = detail.sourceRecords.find((record) => record.id === createdAnalystNote.id);
const persistedSourceRecord = detail.sourceRecords.find((record) => record.id === createdSourceRecord.id);
const persistedProject = detail.project;
const persistedMemo = persistedProject.memos.find((memo) => memo.id === createdMemo.id);
const coverageEntry = projectList.projects.find((project) => project.id === createdProject.id);

assert(createdProject.status === 'sourced', 'Created project should start in sourced status.');
assert(createdProject.watchState.decision === 'none', 'Created project should start with watch decision none.');
assert(createdSourceRecordPayload.project.sourceRecordIds.includes(createdSourceRecord.id), 'Created public source record should be attached to the project immediately.');
assert(createdAnalystNotePayload.project.sourceRecordIds.includes(createdAnalystNote.id), 'Created analyst note should be attached to the project immediately.');
assert(createdMemoPayload.project.id === createdProject.id, 'Created memo should be attached to the created project.');
assert(createdMemoPayload.project.memos[0]?.id === createdMemo.id, 'Created memo should appear at the top of the immediate memo trail.');
assert(createdMemo.sourceRecordIds.includes(createdSourceRecord.id), 'Created memo should cite the created public source record.');
assert(createdMemo.sourceRecordIds.includes(createdAnalystNote.id), 'Created memo should cite the created analyst note.');
assert(Boolean(coverageEntry), 'Created project should appear in the coverage list.');
assert(projectList.projects[0]?.id === createdProject.id, 'Created project should sort to the top of coverage after creation.');
assert(projectList.projects[0]?.watchDecision === 'none', 'Created project coverage row should show watchDecision none.');
assert(persistedProject.id === createdProject.id, 'Created project should still be available after app restart.');
assert(persistedProject.name === createdProject.name, 'Created project name should persist through D1.');
assert(persistedProject.watchState.decision === 'none', 'Created project watch decision should remain none after restart.');
assert(Boolean(persistedSourceRecord), 'Created public source record should still be attached after app restart.');
assert(persistedProject.sourceRecordIds.includes(createdSourceRecord.id), 'Created project should still cite the public source record after restart.');
assert(Boolean(persistedAnalystNote), 'Created analyst note should still be attached after app restart.');
assert(persistedProject.sourceRecordIds.includes(createdAnalystNote.id), 'Created project should still cite the analyst note after restart.');
assert(Boolean(persistedMemo), 'Created memo should still be attached to the project after app restart.');
assert(persistedMemo.title === createdMemo.title, 'Created memo title should persist through D1.');
assert(persistedMemo.sourceRecordIds.includes(createdSourceRecord.id), 'Persisted memo should still cite the public source record after restart.');
assert(persistedMemo.sourceRecordIds.includes(createdAnalystNote.id), 'Persisted memo should still cite the analyst note after restart.');

console.log(
  JSON.stringify(
    {
      ok: true,
      verificationMode: 'inprocess_d1_route_smoke',
      sqlitePath,
      projectId: createdProject.id,
      projectName: createdProject.name,
      persistedSourceRecordId: createdSourceRecord.id,
      persistedAnalystNoteId: createdAnalystNote.id,
      coverageCount: projectList.projects.length,
      persistedMemoId: createdMemo.id,
      persistedMemoTitle: createdMemo.title,
      persistedWatchDecision: persistedProject.watchState.decision,
    },
    null,
    2,
  ),
);

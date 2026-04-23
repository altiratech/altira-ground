export type GroundLens = 'industrial_development';

export type TruthType = 'observed' | 'inferred' | 'hypothetical';

export type SourceClass = 'official_public' | 'vendor' | 'licensed' | 'manual';

export type RightsStatus = 'approved' | 'evaluate' | 'restricted' | 'blocked';

export type ProjectStatus = 'sourced' | 'reviewing' | 'watching' | 'advancing' | 'archived';

export type WatchDecision = 'none' | 'watch' | 'advance';

export interface SourceRecord {
  id: string;
  title: string;
  sourceClass: SourceClass;
  rightsStatus: RightsStatus;
  publisher: string;
  sourceUrl: string | null;
  jurisdictionId: string | null;
  recordType:
    | 'parcel_record'
    | 'zoning_record'
    | 'agenda_item'
    | 'permit_record'
    | 'hazard_layer'
    | 'infrastructure_record'
    | 'imagery_layer'
    | 'manual_note';
  publishedAt: string | null;
  retrievedAt: string;
  updateCadence: 'one_time' | 'daily' | 'weekly' | 'monthly' | 'unknown';
  summary: string;
}

export interface EvidenceClaim {
  id: string;
  label: string;
  valueText: string;
  truthType: TruthType;
  confidence: number | null;
  materiality: 'core' | 'supporting';
  sourceRecordIds: string[];
  analystReviewRequired: boolean;
  lastReviewedAt: string | null;
}

export interface SiteParcel {
  id: string;
  name: string;
  county: string;
  state: string;
  acreage: number | null;
  ownershipStatus: 'unknown' | 'single_owner' | 'multi_owner' | 'under_option' | 'controlled';
  currentUse: string | null;
  geometryRef: string | null;
  sourceRecordIds: string[];
}

export interface Jurisdiction {
  id: string;
  name: string;
  state: string;
  marketKey: 'texas_ercot_corridor';
  governmentBodies: string[];
  planningPortalUrl: string | null;
  notes: string | null;
}

export interface Event {
  id: string;
  projectId: string;
  eventType:
    | 'agenda'
    | 'permit'
    | 'zoning'
    | 'deed'
    | 'mortgage'
    | 'utility'
    | 'hazard'
    | 'imagery'
    | 'manual';
  title: string;
  happenedAt: string;
  sourceRecordIds: string[];
  truthType: TruthType;
  confidence: number | null;
  whyItMatters: string;
}

export interface Memo {
  id: string;
  projectId: string;
  memoType: 'screen' | 'diligence' | 'investment_committee';
  title: string;
  bodyMarkdown: string;
  sourceRecordIds: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface WatchState {
  projectId: string;
  decision: WatchDecision;
  reason: string;
  decidedAt: string;
  decidedBy: string;
}

export interface Project {
  id: string;
  name: string;
  lens: GroundLens;
  status: ProjectStatus;
  marketKey: 'texas_ercot_corridor';
  thesis: string;
  nextUseOptions: string[];
  blockers: EvidenceClaim[];
  unlocks: EvidenceClaim[];
  sites: SiteParcel[];
  jurisdiction: Jurisdiction;
  keyClaims: EvidenceClaim[];
  timeline: Event[];
  memos: Memo[];
  watchState: WatchState;
  alertIds: string[];
  sourceRecordIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  lens: GroundLens;
  status: ProjectStatus;
  marketKey: 'texas_ercot_corridor';
  thesis: string;
  latestEventAt: string | null;
  watchDecision: WatchDecision;
}

export interface BootstrapSeedProject {
  id: string;
  name: string;
  marketKey: Project['marketKey'];
  status: ProjectStatus;
  jurisdictionName: string;
  sourceRecordCount: number;
  eventCount: number;
  memoCount: number;
}

export interface ProjectsResponse {
  projects: ProjectSummary[];
}

export interface ProjectCreateInput {
  name: string;
  marketKey: Project['marketKey'];
  thesis: string;
}

export interface ProjectCreateResponse {
  project: Project;
}

export interface ProjectResponse {
  project: Project;
  sourceRecords: SourceRecord[];
}

export interface FeedResponse {
  events: Event[];
  sourceRecords: SourceRecord[];
}

export interface BootstrapStateResponse {
  mode: 'memory' | 'd1';
  seedVersion: string;
  seedProjects: BootstrapSeedProject[];
  currentProjects: ProjectSummary[];
  currentProjectCount: number;
  missingSeedProjectIds: string[];
  extraProjectIds: string[];
  canResetToSeed: boolean;
}

export interface HealthResponse {
  ok: true;
  app: string;
  stage: string;
}

export interface WatchStateInput {
  decision: Exclude<WatchDecision, 'none'>;
  reason: string;
  decidedBy?: string;
}

export interface WatchStateResponse {
  project: Project;
  watchState: WatchState;
}

export interface MemoInput {
  memoType: Memo['memoType'];
  title: string;
  bodyMarkdown: string;
  author?: string;
  sourceRecordIds: string[];
}

export interface MemoResponse {
  memo: Memo;
  project: Project;
}

export interface AnalystNoteInput {
  title: string;
  summary: string;
  author?: string;
}

export interface AnalystNoteResponse {
  sourceRecord: SourceRecord;
  project: Project;
}

export interface SourceRecordInput {
  title: string;
  publisher: string;
  sourceUrl: string;
  recordType: Exclude<SourceRecord['recordType'], 'manual_note'>;
  summary: string;
  publishedAt?: string;
}

export interface SourceRecordResponse {
  sourceRecord: SourceRecord;
  project: Project;
}

export interface BootstrapResetResponse {
  before: BootstrapStateResponse;
  after: BootstrapStateResponse;
  resetAppliedAt: string;
}

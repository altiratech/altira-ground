import type {
  BootstrapSeedProject,
  Event,
  EvidenceClaim,
  Jurisdiction,
  Memo,
  Project,
  SiteParcel,
  SourceRecord,
  WatchState,
} from '@ground/shared';

export const GROUND_BOOTSTRAP_SEED_VERSION = '2026-03-21-cluster-analyst-notes-v1';

const shermanJurisdiction: Jurisdiction = {
  id: 'jurisdiction-sherman-tx',
  name: 'Sherman',
  state: 'TX',
  marketKey: 'texas_ercot_corridor',
  governmentBodies: ['City of Sherman Development Services', 'Planning & Zoning', 'City Council'],
  planningPortalUrl: 'https://cityofsherman.com/3320/Planning-Zoning',
  notes:
    'Sherman is a North Texas industrial growth market inside the ERCOT footprint, with city-managed planning, zoning, and infrastructure programs relevant to large industrial buildouts.',
};

const sourceRecords: SourceRecord[] = [
  {
    id: 'src-ti-2021-sherman-announcement',
    title: 'Texas Instruments to begin construction next year on new 300-mm semiconductor wafer fabrication plants',
    sourceClass: 'official_public',
    rightsStatus: 'approved',
    publisher: 'Texas Instruments',
    sourceUrl:
      'https://www.ti.com/about-ti/newsroom/news-releases/2021/2021-11-17-texas-instruments-to-begin-construction-next-year-on-new-300-mm-semiconductor-wafer-fabrication-plants.html',
    jurisdictionId: shermanJurisdiction.id,
    recordType: 'infrastructure_record',
    publishedAt: '2021-11-17T00:00:00.000Z',
    retrievedAt: '2026-03-20T00:00:00.000Z',
    updateCadence: 'one_time',
    summary:
      'TI said construction of the first two Sherman fabs would begin in 2022, with production from the first fab expected as early as 2025.',
  },
  {
    id: 'src-ti-2022-groundbreaking',
    title: 'Texas Instruments breaks ground on new 300-mm semiconductor wafer fabrication plants in Sherman, Texas',
    sourceClass: 'official_public',
    rightsStatus: 'approved',
    publisher: 'Texas Instruments Investor Relations',
    sourceUrl:
      'https://investor.ti.com/news-releases/news-release-details/texas-instruments-breaks-ground-new-300-mm-semiconductor-wafer',
    jurisdictionId: shermanJurisdiction.id,
    recordType: 'infrastructure_record',
    publishedAt: '2022-05-18T00:00:00.000Z',
    retrievedAt: '2026-03-20T00:00:00.000Z',
    updateCadence: 'one_time',
    summary:
      'TI broke ground in Sherman and said the site could support up to four fabs and as many as 3,000 direct jobs over time.',
  },
  {
    id: 'src-sherman-infrastructure-program',
    title: 'Major Infrastructure Improvements Program',
    sourceClass: 'official_public',
    rightsStatus: 'approved',
    publisher: 'City of Sherman',
    sourceUrl: 'https://cityofsherman.com/1247/Major-Infrastructure-Improvements-Progra',
    jurisdictionId: shermanJurisdiction.id,
    recordType: 'infrastructure_record',
    publishedAt: null,
    retrievedAt: '2026-03-20T00:00:00.000Z',
    updateCadence: 'unknown',
    summary:
      'Sherman says it is delivering major roadway, drainage, water, and wastewater improvements to support growth and the TI and GlobalWafers manufacturing projects.',
  },
  {
    id: 'src-sherman-planning-zoning-portal',
    title: 'Planning & Zoning - New Permitting Software (Effective 3/31/2025)',
    sourceClass: 'official_public',
    rightsStatus: 'approved',
    publisher: 'City of Sherman',
    sourceUrl: 'https://cityofsherman.com/3320/Planning-Zoning',
    jurisdictionId: shermanJurisdiction.id,
    recordType: 'permit_record',
    publishedAt: '2025-03-31T00:00:00.000Z',
    retrievedAt: '2026-03-20T00:00:00.000Z',
    updateCadence: 'unknown',
    summary:
      'Sherman launched a Self Service Portal for building, engineering, and planning/zoning submissions effective March 31, 2025.',
  },
  {
    id: 'src-sherman-pz-commission',
    title: 'Planning & Zoning Commission',
    sourceClass: 'official_public',
    rightsStatus: 'approved',
    publisher: 'City of Sherman',
    sourceUrl: 'https://cityofsherman.com/97/Planning-Zoning-Commission',
    jurisdictionId: shermanJurisdiction.id,
    recordType: 'agenda_item',
    publishedAt: null,
    retrievedAt: '2026-03-20T00:00:00.000Z',
    updateCadence: 'monthly',
    summary:
      'Sherman says Planning & Zoning Commission agendas and minutes are available on the city Agenda Center and publishes public notifications for upcoming commission meetings.',
  },
  {
    id: 'src-fema-flood-maps',
    title: 'Flood Maps',
    sourceClass: 'official_public',
    rightsStatus: 'approved',
    publisher: 'FEMA',
    sourceUrl: 'https://www.fema.gov/flood-maps',
    jurisdictionId: shermanJurisdiction.id,
    recordType: 'hazard_layer',
    publishedAt: null,
    retrievedAt: '2026-03-21T00:00:00.000Z',
    updateCadence: 'unknown',
    summary:
      'FEMA says the Flood Map Service Center is the official online location to find flood hazard mapping products created under the National Flood Insurance Program.',
  },
  {
    id: 'src-grayson-cad-property-search',
    title: 'Property Search',
    sourceClass: 'official_public',
    rightsStatus: 'approved',
    publisher: 'Grayson Central Appraisal District',
    sourceUrl: 'https://esearch.graysonappraisal.org/',
    jurisdictionId: shermanJurisdiction.id,
    recordType: 'parcel_record',
    publishedAt: null,
    retrievedAt: '2026-03-21T00:00:00.000Z',
    updateCadence: 'unknown',
    summary:
      'Grayson CAD provides public property search by owner, address, ID, and geographic ID and says legal descriptions and acreage amounts should be verified before legal use.',
  },
  {
    id: 'src-sherman-gis',
    title: 'Geographic Information System',
    sourceClass: 'official_public',
    rightsStatus: 'approved',
    publisher: 'City of Sherman',
    sourceUrl: 'https://cityofsherman.com/613/GIS',
    jurisdictionId: shermanJurisdiction.id,
    recordType: 'zoning_record',
    publishedAt: null,
    retrievedAt: '2026-03-20T00:00:00.000Z',
    updateCadence: 'unknown',
    summary:
      'Sherman publishes a GIS map with zoning information, city limits, ETJ, and floodplain context for public review.',
  },
  {
    id: 'src-ti-2025-investment-update',
    title: 'Texas Instruments plans to invest more than $60 billion to manufacture billions of foundational semiconductors in the U.S.',
    sourceClass: 'official_public',
    rightsStatus: 'approved',
    publisher: 'Texas Instruments',
    sourceUrl:
      'https://www.ti.com/about-ti/newsroom/news-releases/2025/texas-instruments-plans-to-invest-more-than--60-billion-to-manufacture-billions-of-foundational-semiconductors-in-the-us.html',
    jurisdictionId: shermanJurisdiction.id,
    recordType: 'infrastructure_record',
    publishedAt: '2025-06-18T00:00:00.000Z',
    retrievedAt: '2026-03-20T00:00:00.000Z',
    updateCadence: 'one_time',
    summary:
      'TI said its Sherman mega-site could represent up to $40 billion of its broader $60 billion U.S. manufacturing plan, with SM1 and SM2 underway and two additional fabs planned for future demand.',
  },
  {
    id: 'src-ti-2025-production',
    title: 'Texas Instruments begins production at its newest 300mm semiconductor manufacturing facility in Sherman, Texas',
    sourceClass: 'official_public',
    rightsStatus: 'approved',
    publisher: 'Texas Instruments',
    sourceUrl:
      'https://www.ti.com/about-ti/newsroom/news-releases/2025/texas-instruments-begins-production-at-its-newest-300mm-semiconductor-manufacturing-facility-in-sherman-texas.html',
    jurisdictionId: shermanJurisdiction.id,
    recordType: 'infrastructure_record',
    publishedAt: '2025-12-17T00:00:00.000Z',
    retrievedAt: '2026-03-20T00:00:00.000Z',
    updateCadence: 'one_time',
    summary:
      'TI said SM1 had entered production in Sherman and reiterated that the site could include up to four connected fabs over time.',
  },
  {
    id: 'src-ground-analyst-note-ti-watch-rationale',
    title: 'Ground analyst note: why Sherman stays on watch',
    sourceClass: 'manual',
    rightsStatus: 'approved',
    publisher: 'Ground analyst',
    sourceUrl: null,
    jurisdictionId: shermanJurisdiction.id,
    recordType: 'manual_note',
    publishedAt: null,
    retrievedAt: '2026-03-21T00:00:00.000Z',
    updateCadence: 'one_time',
    summary:
      'Ground analyst note: treat Sherman as a corridor watch node, not a finished diligence call. The useful signal is the combination of live production, city-led infrastructure delivery, and public permitting/process visibility in one place, while parcel control, utility timing, and approval friction still need explicit analyst confirmation.',
  },
  {
    id: 'src-sherman-fy2025-budget',
    title: 'City of Sherman Annual Operating Budget FY 2025',
    sourceClass: 'official_public',
    rightsStatus: 'approved',
    publisher: 'City of Sherman',
    sourceUrl: 'https://cityofsherman.com/DocumentCenter/View/12757',
    jurisdictionId: shermanJurisdiction.id,
    recordType: 'infrastructure_record',
    publishedAt: '2024-09-30T00:00:00.000Z',
    retrievedAt: '2026-03-20T00:00:00.000Z',
    updateCadence: 'one_time',
    summary:
      'Sherman says Globitech announced in June 2022 that it intended to construct a $5 billion silicon plant in Sherman expected to employ 1,500 people, with an anticipated 2025 start.',
  },
  {
    id: 'src-ground-analyst-note-globalwafers-coverage-rationale',
    title: 'Ground analyst note: why GlobalWafers stays sourced',
    sourceClass: 'manual',
    rightsStatus: 'approved',
    publisher: 'Ground analyst',
    sourceUrl: null,
    jurisdictionId: shermanJurisdiction.id,
    recordType: 'manual_note',
    publishedAt: null,
    retrievedAt: '2026-03-21T00:00:00.000Z',
    updateCadence: 'one_time',
    summary:
      'Ground analyst note: keep GlobalWafers in coverage because it preserves the Sherman cluster read, but do not treat city-budget language alone as proof of current execution certainty. The useful signal is that Sherman is still planning around a second major semiconductor node, while direct company progress, site control, and timing are still thinner than the TI file.',
  },
];

const tiSite: SiteParcel = {
  id: 'site-ti-sherman',
  name: 'TI Sherman manufacturing site',
  county: 'Grayson County',
  state: 'TX',
  acreage: null,
  ownershipStatus: 'controlled',
  currentUse: 'Phased semiconductor manufacturing campus',
  geometryRef: null,
  sourceRecordIds: [
    'src-ti-2022-groundbreaking',
    'src-ti-2025-production',
    'src-sherman-gis',
    'src-fema-flood-maps',
    'src-grayson-cad-property-search',
  ],
};

const tiBlockers: EvidenceClaim[] = [
  {
    id: 'claim-blocker-infrastructure-critical-path',
    label: 'Infrastructure delivery remains schedule-critical',
    valueText:
      'Sherman is still delivering roadway, drainage, water, and wastewater improvements to support major manufacturing growth, which suggests infrastructure timing remains a gating dependency for adjacent industrial expansion and related site-readiness decisions.',
    truthType: 'inferred',
    confidence: 0.78,
    materiality: 'core',
    sourceRecordIds: ['src-sherman-infrastructure-program', 'src-ti-2025-production'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-20T00:00:00.000Z',
  },
  {
    id: 'claim-blocker-permitting-visibility-not-approval',
    label: 'Digital permitting improves visibility more than certainty',
    valueText:
      'Sherman now offers a digital self-service planning, zoning, and engineering portal, which should improve tracking and submission visibility, but it should not be treated as evidence that industrial approvals are low-friction by default.',
    truthType: 'inferred',
    confidence: 0.69,
    materiality: 'supporting',
    sourceRecordIds: ['src-sherman-planning-zoning-portal'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-20T00:00:00.000Z',
  },
];

const tiUnlocks: EvidenceClaim[] = [
  {
    id: 'claim-unlock-site-scale',
    label: 'Large-scale industrial intent is explicit',
    valueText:
      'TI has publicly framed the Sherman location as a manufacturing mega-site with potential for up to four connected fabs, which supports a long-duration industrial buildout thesis rather than a one-off facility story.',
    truthType: 'observed',
    confidence: null,
    materiality: 'core',
    sourceRecordIds: ['src-ti-2021-sherman-announcement', 'src-ti-2025-production'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-20T00:00:00.000Z',
  },
  {
    id: 'claim-unlock-city-support',
    label: 'City infrastructure posture is visibly growth-oriented',
    valueText:
      'Sherman says it is financing and delivering major infrastructure improvements to support the scale of manufacturing growth now underway, which is a stronger signal than a generic economic-development claim alone.',
    truthType: 'observed',
    confidence: null,
    materiality: 'core',
    sourceRecordIds: ['src-sherman-infrastructure-program'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-20T00:00:00.000Z',
  },
];

const tiKeyClaims: EvidenceClaim[] = [
  {
    id: 'claim-key-ti-production',
    label: 'First Sherman fab is in production',
    valueText: 'TI said SM1 entered production in Sherman on December 17, 2025.',
    truthType: 'observed',
    confidence: null,
    materiality: 'core',
    sourceRecordIds: ['src-ti-2025-production'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-20T00:00:00.000Z',
  },
  {
    id: 'claim-key-permitting-portal',
    label: 'Sherman has a digital planning and permitting portal',
    valueText:
      'Sherman launched a Self Service Portal effective March 31, 2025 for planning, zoning, building, and engineering submissions.',
    truthType: 'observed',
    confidence: null,
    materiality: 'supporting',
    sourceRecordIds: ['src-sherman-planning-zoning-portal'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-20T00:00:00.000Z',
  },
  {
    id: 'claim-key-pz-public-notice',
    label: 'Sherman exposes Planning & Zoning meeting notices and agenda access',
    valueText:
      'Sherman says Planning & Zoning Commission agendas and minutes are available on the city Agenda Center and publishes public notifications for upcoming commission meetings.',
    truthType: 'observed',
    confidence: null,
    materiality: 'supporting',
    sourceRecordIds: ['src-sherman-pz-commission'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-20T00:00:00.000Z',
  },
  {
    id: 'claim-key-flood-context',
    label: 'Flood hazard review is publicly available through FEMA',
    valueText:
      'FEMA says the Flood Map Service Center is the official online location to find flood hazard mapping products under the National Flood Insurance Program, which means flood context can be reviewed during dossier work even when parcel-level interpretation still needs analyst judgment.',
    truthType: 'observed',
    confidence: null,
    materiality: 'supporting',
    sourceRecordIds: ['src-fema-flood-maps'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-21T00:00:00.000Z',
  },
  {
    id: 'claim-key-parcel-posture',
    label: 'Parcel records are publicly searchable through Grayson CAD',
    valueText:
      'Grayson CAD provides public property search for Grayson County and says legal descriptions and acreage amounts should be verified before legal use, which gives Ground a parcel-posture starting point while keeping analyst verification explicit.',
    truthType: 'observed',
    confidence: null,
    materiality: 'supporting',
    sourceRecordIds: ['src-grayson-cad-property-search'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-21T00:00:00.000Z',
  },
];

const tiWatchState: WatchState = {
  projectId: 'project-ti-sherman',
  decision: 'watch',
  reason:
    'The project is already real and highly visible, which makes it a useful pilot dossier for monitoring infrastructure delivery, planning visibility, and jurisdiction/process signals rather than a pure greenfield sourcing case.',
  decidedAt: '2026-03-20T00:00:00.000Z',
  decidedBy: 'Ground pilot seed',
};

const tiMemos: Memo[] = [
  {
    id: 'memo-ti-sherman-analyst-watch-note',
    projectId: 'project-ti-sherman',
    memoType: 'diligence',
    title: 'Why Sherman stays on watch',
    bodyMarkdown:
      'Sherman stays on watch because one dossier now compresses three useful signals: a live anchor facility, city-visible infrastructure delivery, and a public planning/permitting trail. That makes Sherman the cleanest pilot node for tracking adjacent industrial expansion in the corridor. This is still a watch posture, not an advance call: the dossier does not yet prove parcel control, fully de-risked utility timing, or low-friction approvals for adjacent sites.',
    sourceRecordIds: [
      'src-ground-analyst-note-ti-watch-rationale',
      'src-ti-2025-production',
      'src-sherman-infrastructure-program',
      'src-sherman-planning-zoning-portal',
    ],
    createdAt: '2026-03-21T00:00:00.000Z',
    updatedAt: '2026-03-21T00:00:00.000Z',
    author: 'Ground analyst',
  },
  {
    id: 'memo-ti-sherman-screen',
    projectId: 'project-ti-sherman',
    memoType: 'screen',
    title: 'Pilot screen memo',
    bodyMarkdown:
      'Ground pilot read: Sherman is a strong seeded example because it shows how one dossier can combine project scale, city infrastructure posture, permitting visibility, and a time-based change log. The immediate value here is not hidden discovery; it is decision compression and monitoring clarity.',
    sourceRecordIds: [
      'src-ti-2022-groundbreaking',
      'src-sherman-infrastructure-program',
      'src-sherman-planning-zoning-portal',
      'src-ti-2025-production',
    ],
    createdAt: '2026-03-20T00:00:00.000Z',
    updatedAt: '2026-03-20T00:00:00.000Z',
    author: 'Ground pilot seed',
  },
];

const tiTimeline: Event[] = [
  {
    id: 'event-ti-2021-announcement',
    projectId: 'project-ti-sherman',
    eventType: 'manual',
    title: 'TI announced construction plans for new Sherman fabs',
    happenedAt: '2021-11-17T00:00:00.000Z',
    sourceRecordIds: ['src-ti-2021-sherman-announcement'],
    truthType: 'observed',
    confidence: null,
    whyItMatters:
      'This is the first visible signal that Sherman should be evaluated as a long-duration industrial buildout rather than a one-off site event.',
  },
  {
    id: 'event-ti-2022-groundbreaking',
    projectId: 'project-ti-sherman',
    eventType: 'manual',
    title: 'TI broke ground in Sherman',
    happenedAt: '2022-05-18T00:00:00.000Z',
    sourceRecordIds: ['src-ti-2022-groundbreaking'],
    truthType: 'observed',
    confidence: null,
    whyItMatters:
      'Groundbreaking converts abstract industrial intent into an active project with delivery and infrastructure implications.',
  },
  {
    id: 'event-sherman-2025-permitting',
    projectId: 'project-ti-sherman',
    eventType: 'permit',
    title: 'Sherman launched digital permitting and planning portal',
    happenedAt: '2025-03-31T00:00:00.000Z',
    sourceRecordIds: ['src-sherman-planning-zoning-portal'],
    truthType: 'observed',
    confidence: null,
    whyItMatters:
      'This improves workflow visibility for planning and engineering submissions, which matters for monitoring even when it does not eliminate approval risk.',
  },
  {
    id: 'event-ti-2025-investment-update',
    projectId: 'project-ti-sherman',
    eventType: 'manual',
    title: 'TI updated U.S. manufacturing investment posture and Sherman scale',
    happenedAt: '2025-06-18T00:00:00.000Z',
    sourceRecordIds: ['src-ti-2025-investment-update'],
    truthType: 'observed',
    confidence: null,
    whyItMatters:
      'The Sherman site remained central to TI’s broader manufacturing narrative in 2025, reinforcing that the project should be monitored as a long-cycle industrial platform rather than a finished announcement.',
  },
  {
    id: 'event-ti-2025-production-start',
    projectId: 'project-ti-sherman',
    eventType: 'manual',
    title: 'SM1 entered production',
    happenedAt: '2025-12-17T00:00:00.000Z',
    sourceRecordIds: ['src-ti-2025-production'],
    truthType: 'observed',
    confidence: null,
    whyItMatters:
      'Production start marks a major maturity step while leaving future site buildout and adjacent infrastructure implications still worth monitoring.',
  },
];

const globalwafersSite: SiteParcel = {
  id: 'site-globalwafers-sherman',
  name: 'GlobalWafers Sherman silicon wafer campus',
  county: 'Grayson County',
  state: 'TX',
  acreage: null,
  ownershipStatus: 'controlled',
  currentUse: 'Silicon wafer manufacturing campus',
  geometryRef: null,
  sourceRecordIds: [
    'src-sherman-fy2025-budget',
    'src-sherman-infrastructure-program',
    'src-sherman-gis',
    'src-fema-flood-maps',
    'src-grayson-cad-property-search',
  ],
};

const globalwafersBlockers: EvidenceClaim[] = [
  {
    id: 'claim-globalwafers-blocker-infrastructure-sequencing',
    label: 'Municipal infrastructure sequencing is still a live dependency',
    valueText:
      'Sherman is still delivering roadway, drainage, water, and wastewater improvements to support both TI and GlobalWafers growth, which means adjacent opportunity timing still depends on how city infrastructure sequencing resolves in practice.',
    truthType: 'inferred',
    confidence: 0.74,
    materiality: 'core',
    sourceRecordIds: ['src-sherman-infrastructure-program', 'src-sherman-fy2025-budget'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-20T00:00:00.000Z',
  },
  {
    id: 'claim-globalwafers-blocker-permit-friction',
    label: 'Process visibility still is not approval certainty',
    valueText:
      'The new Self Service Portal should make permitting and planning submissions easier to track, but it should not be read as evidence that semiconductor-materials expansion will move through review without local process friction.',
    truthType: 'inferred',
    confidence: 0.68,
    materiality: 'supporting',
    sourceRecordIds: ['src-sherman-planning-zoning-portal'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-20T00:00:00.000Z',
  },
];

const globalwafersUnlocks: EvidenceClaim[] = [
  {
    id: 'claim-globalwafers-unlock-city-documented-scale',
    label: 'Sherman has documented the project as a large strategic employer',
    valueText:
      'Sherman says the Globitech project was framed as a $5 billion silicon plant expected to employ 1,500 people, which is materially stronger than a generic industrial prospect mention.',
    truthType: 'observed',
    confidence: null,
    materiality: 'core',
    sourceRecordIds: ['src-sherman-fy2025-budget'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-20T00:00:00.000Z',
  },
  {
    id: 'claim-globalwafers-unlock-city-support',
    label: 'The city names GlobalWafers alongside TI in its infrastructure posture',
    valueText:
      'Sherman explicitly ties its major infrastructure improvements program to the TI and GlobalWafers manufacturing projects, which suggests the city is planning around a multi-project semiconductor growth cluster instead of a single anchor site.',
    truthType: 'observed',
    confidence: null,
    materiality: 'core',
    sourceRecordIds: ['src-sherman-infrastructure-program'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-20T00:00:00.000Z',
  },
];

const globalwafersKeyClaims: EvidenceClaim[] = [
  {
    id: 'claim-globalwafers-key-budget',
    label: 'Sherman budget still points to a major silicon plant buildout',
    valueText:
      'Sherman says Globitech announced in June 2022 that it intended to construct a $5 billion silicon plant in Sherman with 1,500 jobs and an anticipated 2025 start.',
    truthType: 'observed',
    confidence: null,
    materiality: 'core',
    sourceRecordIds: ['src-sherman-fy2025-budget'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-20T00:00:00.000Z',
  },
  {
    id: 'claim-globalwafers-key-portal',
    label: 'Sherman permitting is now digitally trackable',
    valueText:
      'Sherman launched a Self Service Portal effective March 31, 2025 for planning, zoning, building, and engineering submissions.',
    truthType: 'observed',
    confidence: null,
    materiality: 'supporting',
    sourceRecordIds: ['src-sherman-planning-zoning-portal'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-20T00:00:00.000Z',
  },
  {
    id: 'claim-globalwafers-key-pz-public-notice',
    label: 'Sherman keeps Planning & Zoning review surfaces public',
    valueText:
      'Sherman says Planning & Zoning Commission agendas and minutes are available on the city Agenda Center and publishes public notifications for upcoming commission meetings.',
    truthType: 'observed',
    confidence: null,
    materiality: 'supporting',
    sourceRecordIds: ['src-sherman-pz-commission'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-20T00:00:00.000Z',
  },
  {
    id: 'claim-globalwafers-key-flood-context',
    label: 'Flood hazard review is publicly available through FEMA',
    valueText:
      'FEMA says the Flood Map Service Center is the official online location to find flood hazard mapping products under the National Flood Insurance Program, which gives Ground a public flood-context starting point for the Sherman dossier even before parcel-level interpretation is complete.',
    truthType: 'observed',
    confidence: null,
    materiality: 'supporting',
    sourceRecordIds: ['src-fema-flood-maps'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-21T00:00:00.000Z',
  },
  {
    id: 'claim-globalwafers-key-parcel-posture',
    label: 'Parcel records are publicly searchable through Grayson CAD',
    valueText:
      'Grayson CAD provides public property search for Grayson County and says legal descriptions and acreage amounts should be verified before legal use, which gives Ground a parcel-level starting point for the Sherman silicon-campus dossier without overstating title or control certainty.',
    truthType: 'observed',
    confidence: null,
    materiality: 'supporting',
    sourceRecordIds: ['src-grayson-cad-property-search'],
    analystReviewRequired: true,
    lastReviewedAt: '2026-03-21T00:00:00.000Z',
  },
];

const globalwafersWatchState: WatchState = {
  projectId: 'project-globalwafers-sherman',
  decision: 'none',
  reason:
    'Keep this dossier sourced because it adds Sherman cluster context, but the direct execution signal is still materially thinner than the TI file.',
  decidedAt: '2026-03-20T00:00:00.000Z',
  decidedBy: 'Ground pilot seed',
};

const globalwafersMemos: Memo[] = [
  {
    id: 'memo-globalwafers-sherman-screen',
    projectId: 'project-globalwafers-sherman',
    memoType: 'screen',
    title: 'Why GlobalWafers stays sourced',
    bodyMarkdown:
      'GlobalWafers stays sourced because it keeps Sherman from collapsing into a one-company TI story. The useful signal here is cluster context: city budget and infrastructure materials still point to a second major semiconductor node tied into the same local buildout. This remains a sourced dossier, not a watch or advance call, because direct company-level progress, current operating timing, and site-specific execution visibility are still materially thinner than the TI case.',
    sourceRecordIds: [
      'src-ground-analyst-note-globalwafers-coverage-rationale',
      'src-sherman-fy2025-budget',
      'src-sherman-infrastructure-program',
      'src-sherman-planning-zoning-portal',
    ],
    createdAt: '2026-03-20T00:00:00.000Z',
    updatedAt: '2026-03-21T00:00:00.000Z',
    author: 'Ground analyst',
  },
];

const globalwafersTimeline: Event[] = [
  {
    id: 'event-globalwafers-2024-budget-reference',
    projectId: 'project-globalwafers-sherman',
    eventType: 'manual',
    title: 'Sherman FY2025 budget reiterated the Globitech plant buildout',
    happenedAt: '2024-09-30T00:00:00.000Z',
    sourceRecordIds: ['src-sherman-fy2025-budget'],
    truthType: 'observed',
    confidence: null,
    whyItMatters:
      'The city was still planning around a large semiconductor-materials project in Sherman, which keeps the dossier relevant as a live local industrial cluster signal.',
  },
  {
    id: 'event-globalwafers-2025-permitting',
    projectId: 'project-globalwafers-sherman',
    eventType: 'permit',
    title: 'Sherman launched digital permitting and planning portal',
    happenedAt: '2025-03-31T00:00:00.000Z',
    sourceRecordIds: ['src-sherman-planning-zoning-portal'],
    truthType: 'observed',
    confidence: null,
    whyItMatters:
      'The new portal improves tracking and document flow visibility for any Sherman industrial project that needs planning, zoning, or engineering coordination.',
  },
];

export const seedProjects: Project[] = [
  {
    id: 'project-ti-sherman',
    name: 'TI Sherman Manufacturing Mega-Site',
    lens: 'industrial_development',
    status: 'watching',
    marketKey: 'texas_ercot_corridor',
    thesis:
      'Use Sherman as the first Ground dossier because it concentrates an industrial buildout, city-backed infrastructure delivery, and a visible planning/process surface inside one Texas/ERCOT project context.',
    nextUseOptions: [
      'Phased advanced-manufacturing campus expansion',
      'Adjacent industrial support and supplier ecosystem development',
    ],
    blockers: tiBlockers,
    unlocks: tiUnlocks,
    sites: [tiSite],
    jurisdiction: shermanJurisdiction,
    keyClaims: tiKeyClaims,
    timeline: tiTimeline,
    memos: tiMemos,
    watchState: tiWatchState,
    alertIds: [],
    sourceRecordIds: sourceRecords
      .filter((record) =>
        [
          'src-ti-2021-sherman-announcement',
          'src-ti-2022-groundbreaking',
          'src-sherman-infrastructure-program',
          'src-sherman-planning-zoning-portal',
          'src-sherman-pz-commission',
          'src-fema-flood-maps',
          'src-grayson-cad-property-search',
          'src-sherman-gis',
          'src-ti-2025-investment-update',
          'src-ti-2025-production',
          'src-ground-analyst-note-ti-watch-rationale',
        ].includes(record.id),
      )
      .map((record) => record.id),
    createdAt: '2026-03-20T00:00:00.000Z',
    updatedAt: '2026-03-21T00:00:02.000Z',
  },
  {
    id: 'project-globalwafers-sherman',
    name: 'GlobalWafers Sherman Silicon Wafer Campus',
    lens: 'industrial_development',
    status: 'sourced',
    marketKey: 'texas_ercot_corridor',
    thesis:
      'Track Sherman as a multi-project semiconductor cluster, not only a TI story, by carrying a second dossier tied to the city-documented GlobalWafers or Globitech silicon plant buildout and the same infrastructure and process surface.',
    nextUseOptions: [
      'Cluster-level supplier and utility-readiness monitoring',
      'Follow-on industrial development around semiconductor materials and manufacturing demand',
    ],
    blockers: globalwafersBlockers,
    unlocks: globalwafersUnlocks,
    sites: [globalwafersSite],
    jurisdiction: shermanJurisdiction,
    keyClaims: globalwafersKeyClaims,
    timeline: globalwafersTimeline,
    memos: globalwafersMemos,
    watchState: globalwafersWatchState,
    alertIds: [],
    sourceRecordIds: sourceRecords
      .filter((record) =>
        [
          'src-sherman-infrastructure-program',
          'src-sherman-planning-zoning-portal',
          'src-sherman-pz-commission',
          'src-fema-flood-maps',
          'src-grayson-cad-property-search',
          'src-sherman-gis',
          'src-sherman-fy2025-budget',
          'src-ground-analyst-note-globalwafers-coverage-rationale',
        ].includes(record.id),
      )
      .map((record) => record.id),
    createdAt: '2026-03-20T00:00:00.000Z',
    updatedAt: '2026-03-21T00:00:01.000Z',
  },
];

export function getBootstrapSeedProjects(): BootstrapSeedProject[] {
  return seedProjects.map((project) => ({
    id: project.id,
    name: project.name,
    marketKey: project.marketKey,
    status: project.status,
    jurisdictionName: project.jurisdiction.name,
    sourceRecordCount: project.sourceRecordIds.length,
    eventCount: project.timeline.length,
    memoCount: project.memos.length,
  }));
}

export function buildSeedState() {
  return {
    projects: seedProjects,
    sourceRecords,
  };
}

PRAGMA foreign_keys = ON;
BEGIN;

DELETE FROM memo_source_records;
DELETE FROM memos;
DELETE FROM event_source_records;
DELETE FROM events;
DELETE FROM evidence_claim_source_records;
DELETE FROM evidence_claims;
DELETE FROM site_parcel_source_records;
DELETE FROM site_parcels;
DELETE FROM project_source_records;
DELETE FROM watch_states;
DELETE FROM projects;
DELETE FROM source_records;
DELETE FROM jurisdictions;

INSERT INTO jurisdictions
  (id, name, state, market_key, government_bodies_json, planning_portal_url, notes)
VALUES
  (
    'jurisdiction-sherman-tx',
    'Sherman',
    'TX',
    'texas_ercot_corridor',
    '["City of Sherman Development Services","Planning & Zoning","City Council"]',
    'https://cityofsherman.com/3320/Planning-Zoning',
    'Sherman is a North Texas industrial growth market inside the ERCOT footprint, with city-managed planning, zoning, and infrastructure programs relevant to large industrial buildouts.'
  );

INSERT INTO source_records
  (id, title, source_class, rights_status, publisher, source_url, jurisdiction_id, record_type, published_at, retrieved_at, update_cadence, summary)
VALUES
  (
    'src-ti-2021-sherman-announcement',
    'Texas Instruments to begin construction next year on new 300-mm semiconductor wafer fabrication plants',
    'official_public',
    'approved',
    'Texas Instruments',
    'https://www.ti.com/about-ti/newsroom/news-releases/2021/2021-11-17-texas-instruments-to-begin-construction-next-year-on-new-300-mm-semiconductor-wafer-fabrication-plants.html',
    'jurisdiction-sherman-tx',
    'infrastructure_record',
    '2021-11-17T00:00:00.000Z',
    '2026-03-20T00:00:00.000Z',
    'one_time',
    'TI said construction of the first two Sherman fabs would begin in 2022, with production from the first fab expected as early as 2025.'
  ),
  (
    'src-ti-2022-groundbreaking',
    'Texas Instruments breaks ground on new 300-mm semiconductor wafer fabrication plants in Sherman, Texas',
    'official_public',
    'approved',
    'Texas Instruments Investor Relations',
    'https://investor.ti.com/news-releases/news-release-details/texas-instruments-breaks-ground-new-300-mm-semiconductor-wafer',
    'jurisdiction-sherman-tx',
    'infrastructure_record',
    '2022-05-18T00:00:00.000Z',
    '2026-03-20T00:00:00.000Z',
    'one_time',
    'TI broke ground in Sherman and said the site could support up to four fabs and as many as 3,000 direct jobs over time.'
  ),
  (
    'src-sherman-infrastructure-program',
    'Major Infrastructure Improvements Program',
    'official_public',
    'approved',
    'City of Sherman',
    'https://cityofsherman.com/1247/Major-Infrastructure-Improvements-Progra',
    'jurisdiction-sherman-tx',
    'infrastructure_record',
    NULL,
    '2026-03-20T00:00:00.000Z',
    'unknown',
    'Sherman says it is delivering major roadway, drainage, water, and wastewater improvements to support growth and the TI and GlobalWafers manufacturing projects.'
  ),
  (
    'src-sherman-planning-zoning-portal',
    'Planning & Zoning - New Permitting Software (Effective 3/31/2025)',
    'official_public',
    'approved',
    'City of Sherman',
    'https://cityofsherman.com/3320/Planning-Zoning',
    'jurisdiction-sherman-tx',
    'permit_record',
    '2025-03-31T00:00:00.000Z',
    '2026-03-20T00:00:00.000Z',
    'unknown',
    'Sherman launched a Self Service Portal for building, engineering, and planning/zoning submissions effective March 31, 2025.'
  ),
  (
    'src-sherman-pz-commission',
    'Planning & Zoning Commission',
    'official_public',
    'approved',
    'City of Sherman',
    'https://cityofsherman.com/97/Planning-Zoning-Commission',
    'jurisdiction-sherman-tx',
    'agenda_item',
    NULL,
    '2026-03-20T00:00:00.000Z',
    'monthly',
    'Sherman says Planning & Zoning Commission agendas and minutes are available on the city Agenda Center and publishes public notifications for upcoming commission meetings.'
  ),
  (
    'src-fema-flood-maps',
    'Flood Maps',
    'official_public',
    'approved',
    'FEMA',
    'https://www.fema.gov/flood-maps',
    'jurisdiction-sherman-tx',
    'hazard_layer',
    NULL,
    '2026-03-21T00:00:00.000Z',
    'unknown',
    'FEMA says the Flood Map Service Center is the official online location to find flood hazard mapping products created under the National Flood Insurance Program.'
  ),
  (
    'src-grayson-cad-property-search',
    'Property Search',
    'official_public',
    'approved',
    'Grayson Central Appraisal District',
    'https://esearch.graysonappraisal.org/',
    'jurisdiction-sherman-tx',
    'parcel_record',
    NULL,
    '2026-03-21T00:00:00.000Z',
    'unknown',
    'Grayson CAD provides public property search by owner, address, ID, and geographic ID and says legal descriptions and acreage amounts should be verified before legal use.'
  ),
  (
    'src-sherman-gis',
    'Geographic Information System',
    'official_public',
    'approved',
    'City of Sherman',
    'https://cityofsherman.com/613/GIS',
    'jurisdiction-sherman-tx',
    'zoning_record',
    NULL,
    '2026-03-20T00:00:00.000Z',
    'unknown',
    'Sherman publishes a GIS map with zoning information, city limits, ETJ, and floodplain context for public review.'
  ),
  (
    'src-ti-2025-investment-update',
    'Texas Instruments plans to invest more than $60 billion to manufacture billions of foundational semiconductors in the U.S.',
    'official_public',
    'approved',
    'Texas Instruments',
    'https://www.ti.com/about-ti/newsroom/news-releases/2025/texas-instruments-plans-to-invest-more-than--60-billion-to-manufacture-billions-of-foundational-semiconductors-in-the-us.html',
    'jurisdiction-sherman-tx',
    'infrastructure_record',
    '2025-06-18T00:00:00.000Z',
    '2026-03-20T00:00:00.000Z',
    'one_time',
    'TI said its Sherman mega-site could represent up to $40 billion of its broader $60 billion U.S. manufacturing plan, with SM1 and SM2 underway and two additional fabs planned for future demand.'
  ),
  (
    'src-ti-2025-production',
    'Texas Instruments begins production at its newest 300mm semiconductor manufacturing facility in Sherman, Texas',
    'official_public',
    'approved',
    'Texas Instruments',
    'https://www.ti.com/about-ti/newsroom/news-releases/2025/texas-instruments-begins-production-at-its-newest-300mm-semiconductor-manufacturing-facility-in-sherman-texas.html',
    'jurisdiction-sherman-tx',
    'infrastructure_record',
    '2025-12-17T00:00:00.000Z',
    '2026-03-20T00:00:00.000Z',
    'one_time',
    'TI said SM1 had entered production in Sherman and reiterated that the site could include up to four connected fabs over time.'
  ),
  (
    'src-ground-analyst-note-ti-watch-rationale',
    'Ground analyst note: why Sherman stays on watch',
    'manual',
    'approved',
    'Ground analyst',
    NULL,
    'jurisdiction-sherman-tx',
    'manual_note',
    NULL,
    '2026-03-21T00:00:00.000Z',
    'one_time',
    'Ground analyst note: treat Sherman as a corridor watch node, not a finished diligence call. The useful signal is the combination of live production, city-led infrastructure delivery, and public permitting/process visibility in one place, while parcel control, utility timing, and approval friction still need explicit analyst confirmation.'
  ),
  (
    'src-sherman-fy2025-budget',
    'City of Sherman Annual Operating Budget FY 2025',
    'official_public',
    'approved',
    'City of Sherman',
    'https://cityofsherman.com/DocumentCenter/View/12757',
    'jurisdiction-sherman-tx',
    'infrastructure_record',
    '2024-09-30T00:00:00.000Z',
    '2026-03-20T00:00:00.000Z',
    'one_time',
    'Sherman says Globitech announced in June 2022 that it intended to construct a $5 billion silicon plant in Sherman expected to employ 1,500 people, with an anticipated 2025 start.'
  ),
  (
    'src-ground-analyst-note-globalwafers-coverage-rationale',
    'Ground analyst note: why GlobalWafers stays sourced',
    'manual',
    'approved',
    'Ground analyst',
    NULL,
    'jurisdiction-sherman-tx',
    'manual_note',
    NULL,
    '2026-03-21T00:00:00.000Z',
    'one_time',
    'Ground analyst note: keep GlobalWafers in coverage because it preserves the Sherman cluster read, but do not treat city-budget language alone as proof of current execution certainty. The useful signal is that Sherman is still planning around a second major semiconductor node, while direct company progress, site control, and timing are still thinner than the TI file.'
  );

INSERT INTO projects
  (id, name, lens, status, market_key, thesis, jurisdiction_id, next_use_options_json, alert_ids_json, created_at, updated_at)
VALUES
  (
    'project-ti-sherman',
    'TI Sherman Manufacturing Mega-Site',
    'industrial_development',
    'watching',
    'texas_ercot_corridor',
    'Use Sherman as the first Ground dossier because it concentrates an industrial buildout, city-backed infrastructure delivery, and a visible planning/process surface inside one Texas/ERCOT project context.',
    'jurisdiction-sherman-tx',
    '["Phased advanced-manufacturing campus expansion","Adjacent industrial support and supplier ecosystem development"]',
    '[]',
    '2026-03-20T00:00:00.000Z',
    '2026-03-21T00:00:02.000Z'
  ),
  (
    'project-globalwafers-sherman',
    'GlobalWafers Sherman Silicon Wafer Campus',
    'industrial_development',
    'sourced',
    'texas_ercot_corridor',
    'Track Sherman as a multi-project semiconductor cluster, not only a TI story, by carrying a second dossier tied to the city-documented GlobalWafers or Globitech silicon plant buildout and the same infrastructure and process surface.',
    'jurisdiction-sherman-tx',
    '["Cluster-level supplier and utility-readiness monitoring","Follow-on industrial development around semiconductor materials and manufacturing demand"]',
    '[]',
    '2026-03-20T00:00:00.000Z',
    '2026-03-21T00:00:01.000Z'
  );

INSERT INTO watch_states
  (project_id, decision, reason, decided_at, decided_by)
VALUES
  (
    'project-ti-sherman',
    'watch',
    'The project is already real and highly visible, which makes it a useful pilot dossier for monitoring infrastructure delivery, planning visibility, and jurisdiction/process signals rather than a pure greenfield sourcing case.',
    '2026-03-20T00:00:00.000Z',
    'Ground pilot seed'
  ),
  (
    'project-globalwafers-sherman',
    'none',
    'Keep this dossier sourced because it adds Sherman cluster context, but the direct execution signal is still materially thinner than the TI file.',
    '2026-03-20T00:00:00.000Z',
    'Ground pilot seed'
  );

INSERT INTO project_source_records
  (project_id, source_record_id, position)
VALUES
  ('project-ti-sherman', 'src-ti-2021-sherman-announcement', 0),
  ('project-ti-sherman', 'src-ti-2022-groundbreaking', 1),
  ('project-ti-sherman', 'src-sherman-infrastructure-program', 2),
  ('project-ti-sherman', 'src-sherman-planning-zoning-portal', 3),
  ('project-ti-sherman', 'src-sherman-pz-commission', 4),
  ('project-ti-sherman', 'src-fema-flood-maps', 5),
  ('project-ti-sherman', 'src-sherman-gis', 6),
  ('project-ti-sherman', 'src-ti-2025-investment-update', 7),
  ('project-ti-sherman', 'src-ti-2025-production', 8),
  ('project-ti-sherman', 'src-grayson-cad-property-search', 9),
  ('project-ti-sherman', 'src-ground-analyst-note-ti-watch-rationale', 10),
  ('project-globalwafers-sherman', 'src-sherman-infrastructure-program', 0),
  ('project-globalwafers-sherman', 'src-sherman-planning-zoning-portal', 1),
  ('project-globalwafers-sherman', 'src-sherman-pz-commission', 2),
  ('project-globalwafers-sherman', 'src-fema-flood-maps', 3),
  ('project-globalwafers-sherman', 'src-sherman-gis', 4),
  ('project-globalwafers-sherman', 'src-sherman-fy2025-budget', 5),
  ('project-globalwafers-sherman', 'src-grayson-cad-property-search', 6),
  ('project-globalwafers-sherman', 'src-ground-analyst-note-globalwafers-coverage-rationale', 7);

INSERT INTO site_parcels
  (id, project_id, name, county, state, acreage, ownership_status, current_use, geometry_ref)
VALUES
  (
    'site-ti-sherman',
    'project-ti-sherman',
    'TI Sherman manufacturing site',
    'Grayson County',
    'TX',
    NULL,
    'controlled',
    'Phased semiconductor manufacturing campus',
    NULL
  ),
  (
    'site-globalwafers-sherman',
    'project-globalwafers-sherman',
    'GlobalWafers Sherman silicon wafer campus',
    'Grayson County',
    'TX',
    NULL,
    'controlled',
    'Silicon wafer manufacturing campus',
    NULL
  );

INSERT INTO site_parcel_source_records
  (site_parcel_id, source_record_id, position)
VALUES
  ('site-ti-sherman', 'src-ti-2022-groundbreaking', 0),
  ('site-ti-sherman', 'src-ti-2025-production', 1),
  ('site-ti-sherman', 'src-sherman-gis', 2),
  ('site-ti-sherman', 'src-fema-flood-maps', 3),
  ('site-ti-sherman', 'src-grayson-cad-property-search', 4),
  ('site-globalwafers-sherman', 'src-sherman-fy2025-budget', 0),
  ('site-globalwafers-sherman', 'src-sherman-infrastructure-program', 1),
  ('site-globalwafers-sherman', 'src-sherman-gis', 2),
  ('site-globalwafers-sherman', 'src-fema-flood-maps', 3),
  ('site-globalwafers-sherman', 'src-grayson-cad-property-search', 4);

INSERT INTO evidence_claims
  (id, project_id, claim_bucket, label, value_text, truth_type, confidence, materiality, analyst_review_required, last_reviewed_at)
VALUES
  (
    'claim-blocker-infrastructure-critical-path',
    'project-ti-sherman',
    'blocker',
    'Infrastructure delivery remains schedule-critical',
    'Sherman is still delivering roadway, drainage, water, and wastewater improvements to support major manufacturing growth, which suggests infrastructure timing remains a gating dependency for adjacent industrial expansion and related site-readiness decisions.',
    'inferred',
    0.78,
    'core',
    1,
    '2026-03-20T00:00:00.000Z'
  ),
  (
    'claim-blocker-permitting-visibility-not-approval',
    'project-ti-sherman',
    'blocker',
    'Digital permitting improves visibility more than certainty',
    'Sherman now offers a digital self-service planning, zoning, and engineering portal, which should improve tracking and submission visibility, but it should not be treated as evidence that industrial approvals are low-friction by default.',
    'inferred',
    0.69,
    'supporting',
    1,
    '2026-03-20T00:00:00.000Z'
  ),
  (
    'claim-unlock-site-scale',
    'project-ti-sherman',
    'unlock',
    'Large-scale industrial intent is explicit',
    'TI has publicly framed the Sherman location as a manufacturing mega-site with potential for up to four connected fabs, which supports a long-duration industrial buildout thesis rather than a one-off facility story.',
    'observed',
    NULL,
    'core',
    1,
    '2026-03-20T00:00:00.000Z'
  ),
  (
    'claim-unlock-city-support',
    'project-ti-sherman',
    'unlock',
    'City infrastructure posture is visibly growth-oriented',
    'Sherman says it is financing and delivering major infrastructure improvements to support the scale of manufacturing growth now underway, which is a stronger signal than a generic economic-development claim alone.',
    'observed',
    NULL,
    'core',
    1,
    '2026-03-20T00:00:00.000Z'
  ),
  (
    'claim-key-ti-production',
    'project-ti-sherman',
    'key_claim',
    'First Sherman fab is in production',
    'TI said SM1 entered production in Sherman on December 17, 2025.',
    'observed',
    NULL,
    'core',
    1,
    '2026-03-20T00:00:00.000Z'
  ),
  (
    'claim-key-permitting-portal',
    'project-ti-sherman',
    'key_claim',
    'Sherman has a digital planning and permitting portal',
    'Sherman launched a Self Service Portal effective March 31, 2025 for planning, zoning, building, and engineering submissions.',
    'observed',
    NULL,
    'supporting',
    1,
    '2026-03-20T00:00:00.000Z'
  ),
  (
    'claim-key-pz-public-notice',
    'project-ti-sherman',
    'key_claim',
    'Sherman exposes Planning & Zoning meeting notices and agenda access',
    'Sherman says Planning & Zoning Commission agendas and minutes are available on the city Agenda Center and publishes public notifications for upcoming commission meetings.',
    'observed',
    NULL,
    'supporting',
    1,
    '2026-03-20T00:00:00.000Z'
  ),
  (
    'claim-key-flood-context',
    'project-ti-sherman',
    'key_claim',
    'Flood hazard review is publicly available through FEMA',
    'FEMA says the Flood Map Service Center is the official online location to find flood hazard mapping products under the National Flood Insurance Program, which means flood context can be reviewed during dossier work even when parcel-level interpretation still needs analyst judgment.',
    'observed',
    NULL,
    'supporting',
    1,
    '2026-03-21T00:00:00.000Z'
  ),
  (
    'claim-key-parcel-posture',
    'project-ti-sherman',
    'key_claim',
    'Parcel records are publicly searchable through Grayson CAD',
    'Grayson CAD provides public property search for Grayson County and says legal descriptions and acreage amounts should be verified before legal use, which gives Ground a parcel-posture starting point while keeping analyst verification explicit.',
    'observed',
    NULL,
    'supporting',
    1,
    '2026-03-21T00:00:00.000Z'
  ),
  (
    'claim-globalwafers-blocker-infrastructure-sequencing',
    'project-globalwafers-sherman',
    'blocker',
    'Municipal infrastructure sequencing is still a live dependency',
    'Sherman is still delivering roadway, drainage, water, and wastewater improvements to support both TI and GlobalWafers growth, which means adjacent opportunity timing still depends on how city infrastructure sequencing resolves in practice.',
    'inferred',
    0.74,
    'core',
    1,
    '2026-03-20T00:00:00.000Z'
  ),
  (
    'claim-globalwafers-blocker-permit-friction',
    'project-globalwafers-sherman',
    'blocker',
    'Process visibility still is not approval certainty',
    'The new Self Service Portal should make permitting and planning submissions easier to track, but it should not be read as evidence that semiconductor-materials expansion will move through review without local process friction.',
    'inferred',
    0.68,
    'supporting',
    1,
    '2026-03-20T00:00:00.000Z'
  ),
  (
    'claim-globalwafers-unlock-city-documented-scale',
    'project-globalwafers-sherman',
    'unlock',
    'Sherman has documented the project as a large strategic employer',
    'Sherman says the Globitech project was framed as a $5 billion silicon plant expected to employ 1,500 people, which is materially stronger than a generic industrial prospect mention.',
    'observed',
    NULL,
    'core',
    1,
    '2026-03-20T00:00:00.000Z'
  ),
  (
    'claim-globalwafers-unlock-city-support',
    'project-globalwafers-sherman',
    'unlock',
    'The city names GlobalWafers alongside TI in its infrastructure posture',
    'Sherman explicitly ties its major infrastructure improvements program to the TI and GlobalWafers manufacturing projects, which suggests the city is planning around a multi-project semiconductor growth cluster instead of a single anchor site.',
    'observed',
    NULL,
    'core',
    1,
    '2026-03-20T00:00:00.000Z'
  ),
  (
    'claim-globalwafers-key-budget',
    'project-globalwafers-sherman',
    'key_claim',
    'Sherman budget still points to a major silicon plant buildout',
    'Sherman says Globitech announced in June 2022 that it intended to construct a $5 billion silicon plant in Sherman with 1,500 jobs and an anticipated 2025 start.',
    'observed',
    NULL,
    'core',
    1,
    '2026-03-20T00:00:00.000Z'
  ),
  (
    'claim-globalwafers-key-portal',
    'project-globalwafers-sherman',
    'key_claim',
    'Sherman permitting is now digitally trackable',
    'Sherman launched a Self Service Portal effective March 31, 2025 for planning, zoning, building, and engineering submissions.',
    'observed',
    NULL,
    'supporting',
    1,
    '2026-03-20T00:00:00.000Z'
  ),
  (
    'claim-globalwafers-key-pz-public-notice',
    'project-globalwafers-sherman',
    'key_claim',
    'Sherman keeps Planning & Zoning review surfaces public',
    'Sherman says Planning & Zoning Commission agendas and minutes are available on the city Agenda Center and publishes public notifications for upcoming commission meetings.',
    'observed',
    NULL,
    'supporting',
    1,
    '2026-03-20T00:00:00.000Z'
  ),
  (
    'claim-globalwafers-key-flood-context',
    'project-globalwafers-sherman',
    'key_claim',
    'Flood hazard review is publicly available through FEMA',
    'FEMA says the Flood Map Service Center is the official online location to find flood hazard mapping products under the National Flood Insurance Program, which gives Ground a public flood-context starting point for the Sherman dossier even before parcel-level interpretation is complete.',
    'observed',
    NULL,
    'supporting',
    1,
    '2026-03-21T00:00:00.000Z'
  ),
  (
    'claim-globalwafers-key-parcel-posture',
    'project-globalwafers-sherman',
    'key_claim',
    'Parcel records are publicly searchable through Grayson CAD',
    'Grayson CAD provides public property search for Grayson County and says legal descriptions and acreage amounts should be verified before legal use, which gives Ground a parcel-level starting point for the Sherman silicon-campus dossier without overstating title or control certainty.',
    'observed',
    NULL,
    'supporting',
    1,
    '2026-03-21T00:00:00.000Z'
  );

INSERT INTO evidence_claim_source_records
  (evidence_claim_id, source_record_id, position)
VALUES
  ('claim-blocker-infrastructure-critical-path', 'src-sherman-infrastructure-program', 0),
  ('claim-blocker-infrastructure-critical-path', 'src-ti-2025-production', 1),
  ('claim-blocker-permitting-visibility-not-approval', 'src-sherman-planning-zoning-portal', 0),
  ('claim-unlock-site-scale', 'src-ti-2021-sherman-announcement', 0),
  ('claim-unlock-site-scale', 'src-ti-2025-production', 1),
  ('claim-unlock-city-support', 'src-sherman-infrastructure-program', 0),
  ('claim-key-ti-production', 'src-ti-2025-production', 0),
  ('claim-key-permitting-portal', 'src-sherman-planning-zoning-portal', 0),
  ('claim-key-pz-public-notice', 'src-sherman-pz-commission', 0),
  ('claim-key-flood-context', 'src-fema-flood-maps', 0),
  ('claim-key-parcel-posture', 'src-grayson-cad-property-search', 0),
  ('claim-globalwafers-blocker-infrastructure-sequencing', 'src-sherman-infrastructure-program', 0),
  ('claim-globalwafers-blocker-infrastructure-sequencing', 'src-sherman-fy2025-budget', 1),
  ('claim-globalwafers-blocker-permit-friction', 'src-sherman-planning-zoning-portal', 0),
  ('claim-globalwafers-unlock-city-documented-scale', 'src-sherman-fy2025-budget', 0),
  ('claim-globalwafers-unlock-city-support', 'src-sherman-infrastructure-program', 0),
  ('claim-globalwafers-key-budget', 'src-sherman-fy2025-budget', 0),
  ('claim-globalwafers-key-portal', 'src-sherman-planning-zoning-portal', 0),
  ('claim-globalwafers-key-pz-public-notice', 'src-sherman-pz-commission', 0),
  ('claim-globalwafers-key-flood-context', 'src-fema-flood-maps', 0),
  ('claim-globalwafers-key-parcel-posture', 'src-grayson-cad-property-search', 0);

INSERT INTO events
  (id, project_id, event_type, title, happened_at, truth_type, confidence, why_it_matters)
VALUES
  (
    'event-ti-2021-announcement',
    'project-ti-sherman',
    'manual',
    'TI announced construction plans for new Sherman fabs',
    '2021-11-17T00:00:00.000Z',
    'observed',
    NULL,
    'This is the first visible signal that Sherman should be evaluated as a long-duration industrial buildout rather than a one-off site event.'
  ),
  (
    'event-ti-2022-groundbreaking',
    'project-ti-sherman',
    'manual',
    'TI broke ground in Sherman',
    '2022-05-18T00:00:00.000Z',
    'observed',
    NULL,
    'Groundbreaking converts abstract industrial intent into an active project with delivery and infrastructure implications.'
  ),
  (
    'event-sherman-2025-permitting',
    'project-ti-sherman',
    'permit',
    'Sherman launched digital permitting and planning portal',
    '2025-03-31T00:00:00.000Z',
    'observed',
    NULL,
    'This improves workflow visibility for planning and engineering submissions, which matters for monitoring even when it does not eliminate approval risk.'
  ),
  (
    'event-ti-2025-investment-update',
    'project-ti-sherman',
    'manual',
    'TI updated U.S. manufacturing investment posture and Sherman scale',
    '2025-06-18T00:00:00.000Z',
    'observed',
    NULL,
    'The Sherman site remained central to TI’s broader manufacturing narrative in 2025, reinforcing that the project should be monitored as a long-cycle industrial platform rather than a finished announcement.'
  ),
  (
    'event-ti-2025-production-start',
    'project-ti-sherman',
    'manual',
    'SM1 entered production',
    '2025-12-17T00:00:00.000Z',
    'observed',
    NULL,
    'Production start marks a major maturity step while leaving future site buildout and adjacent infrastructure implications still worth monitoring.'
  ),
  (
    'event-globalwafers-2024-budget-reference',
    'project-globalwafers-sherman',
    'manual',
    'Sherman FY2025 budget reiterated the Globitech plant buildout',
    '2024-09-30T00:00:00.000Z',
    'observed',
    NULL,
    'The city was still planning around a large semiconductor-materials project in Sherman, which keeps the dossier relevant as a live local industrial cluster signal.'
  ),
  (
    'event-globalwafers-2025-permitting',
    'project-globalwafers-sherman',
    'permit',
    'Sherman launched digital permitting and planning portal',
    '2025-03-31T00:00:00.000Z',
    'observed',
    NULL,
    'The new portal improves tracking and document flow visibility for any Sherman industrial project that needs planning, zoning, or engineering coordination.'
  );

INSERT INTO event_source_records
  (event_id, source_record_id, position)
VALUES
  ('event-ti-2021-announcement', 'src-ti-2021-sherman-announcement', 0),
  ('event-ti-2022-groundbreaking', 'src-ti-2022-groundbreaking', 0),
  ('event-sherman-2025-permitting', 'src-sherman-planning-zoning-portal', 0),
  ('event-ti-2025-investment-update', 'src-ti-2025-investment-update', 0),
  ('event-ti-2025-production-start', 'src-ti-2025-production', 0),
  ('event-globalwafers-2024-budget-reference', 'src-sherman-fy2025-budget', 0),
  ('event-globalwafers-2025-permitting', 'src-sherman-planning-zoning-portal', 0);

INSERT INTO memos
  (id, project_id, memo_type, title, body_markdown, created_at, updated_at, author)
VALUES
  (
    'memo-ti-sherman-analyst-watch-note',
    'project-ti-sherman',
    'diligence',
    'Why Sherman stays on watch',
    'Sherman stays on watch because one dossier now compresses three useful signals: a live anchor facility, city-visible infrastructure delivery, and a public planning/permitting trail. That makes Sherman the cleanest pilot node for tracking adjacent industrial expansion in the corridor. This is still a watch posture, not an advance call: the dossier does not yet prove parcel control, fully de-risked utility timing, or low-friction approvals for adjacent sites.',
    '2026-03-21T00:00:00.000Z',
    '2026-03-21T00:00:00.000Z',
    'Ground analyst'
  ),
  (
    'memo-ti-sherman-screen',
    'project-ti-sherman',
    'screen',
    'Pilot screen memo',
    'Ground pilot read: Sherman is a strong seeded example because it shows how one dossier can combine project scale, city infrastructure posture, permitting visibility, and a time-based change log. The immediate value here is not hidden discovery; it is decision compression and monitoring clarity.',
    '2026-03-20T00:00:00.000Z',
    '2026-03-20T00:00:00.000Z',
    'Ground pilot seed'
  ),
  (
    'memo-globalwafers-sherman-screen',
    'project-globalwafers-sherman',
    'screen',
    'Why GlobalWafers stays sourced',
    'GlobalWafers stays sourced because it keeps Sherman from collapsing into a one-company TI story. The useful signal here is cluster context: city budget and infrastructure materials still point to a second major semiconductor node tied into the same local buildout. This remains a sourced dossier, not a watch or advance call, because direct company-level progress, current operating timing, and site-specific execution visibility are still materially thinner than the TI case.',
    '2026-03-20T00:00:00.000Z',
    '2026-03-21T00:00:00.000Z',
    'Ground analyst'
  );

INSERT INTO memo_source_records
  (memo_id, source_record_id, position)
VALUES
  ('memo-ti-sherman-analyst-watch-note', 'src-ground-analyst-note-ti-watch-rationale', 0),
  ('memo-ti-sherman-analyst-watch-note', 'src-ti-2025-production', 1),
  ('memo-ti-sherman-analyst-watch-note', 'src-sherman-infrastructure-program', 2),
  ('memo-ti-sherman-analyst-watch-note', 'src-sherman-planning-zoning-portal', 3),
  ('memo-ti-sherman-screen', 'src-ti-2022-groundbreaking', 0),
  ('memo-ti-sherman-screen', 'src-sherman-infrastructure-program', 1),
  ('memo-ti-sherman-screen', 'src-sherman-planning-zoning-portal', 2),
  ('memo-ti-sherman-screen', 'src-ti-2025-production', 3),
  ('memo-globalwafers-sherman-screen', 'src-ground-analyst-note-globalwafers-coverage-rationale', 0),
  ('memo-globalwafers-sherman-screen', 'src-sherman-fy2025-budget', 1),
  ('memo-globalwafers-sherman-screen', 'src-sherman-infrastructure-program', 2),
  ('memo-globalwafers-sherman-screen', 'src-sherman-planning-zoning-portal', 3);

COMMIT;

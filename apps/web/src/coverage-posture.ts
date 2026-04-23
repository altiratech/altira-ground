import type { Project, SourceRecord } from '@ground/shared';

export type CoverageFocusSummary = {
  key:
    | 'parcel_posture'
    | 'zoning_land_use'
    | 'permitting_flow'
    | 'civic_agenda'
    | 'hazard_context'
    | 'infrastructure_grid'
    | 'analyst_notes';
  label: string;
  status: 'covered' | 'missing';
  supportingSourceCount: number;
  note: string;
};

export type CoveragePosture = {
  sourceRecordCount: number;
  observedCoreClaimCount: number;
  inferredClaimCount: number;
  hypotheticalClaimCount: number;
  analystReviewRequiredCount: number;
  eventCount: number;
  memoCount: number;
  coveredFocusCount: number;
  missingFocusCount: number;
  focuses: CoverageFocusSummary[];
};

const focusDefinitions: Array<{
  key: CoverageFocusSummary['key'];
  label: string;
  recordTypes: SourceRecord['recordType'][];
  coveredNote: string;
  missingNote: string;
}> = [
  {
    key: 'parcel_posture',
    label: 'Parcel posture',
    recordTypes: ['parcel_record'],
    coveredNote: 'Ground has parcel-specific records in the dossier.',
    missingNote: 'Add parcel or appraisal records before treating site control as clear.',
  },
  {
    key: 'zoning_land_use',
    label: 'Zoning / land use',
    recordTypes: ['zoning_record'],
    coveredNote: 'Ground has zoning or map-layer evidence attached.',
    missingNote: 'Add zoning or future-land-use records before assuming land-use fit.',
  },
  {
    key: 'permitting_flow',
    label: 'Permitting flow',
    recordTypes: ['permit_record'],
    coveredNote: 'Ground has permitting-process visibility in the dossier.',
    missingNote: 'Add permit or portal evidence before assuming process visibility.',
  },
  {
    key: 'civic_agenda',
    label: 'Civic agenda trail',
    recordTypes: ['agenda_item'],
    coveredNote: 'Ground has public-meeting or agenda evidence attached.',
    missingNote: 'Add agenda or minutes evidence before treating civic process as covered.',
  },
  {
    key: 'hazard_context',
    label: 'Hazard context',
    recordTypes: ['hazard_layer'],
    coveredNote: 'Ground has hazard or flood context attached.',
    missingNote: 'Add flood or hazard context before treating physical risk as reviewed.',
  },
  {
    key: 'infrastructure_grid',
    label: 'Infrastructure / grid',
    recordTypes: ['infrastructure_record'],
    coveredNote: 'Ground has infrastructure or utility posture in the dossier.',
    missingNote: 'Add infrastructure or grid context before treating delivery risk as well-covered.',
  },
  {
    key: 'analyst_notes',
    label: 'Analyst notes',
    recordTypes: ['manual_note'],
    coveredNote: 'Ground has manual analyst context attached.',
    missingNote: 'Add one analyst note or budget-level manual source to show why this project matters.',
  },
];

export function buildCoveragePosture(project: Project, sourceRecords: SourceRecord[]): CoveragePosture {
  const claims = [...project.blockers, ...project.unlocks, ...project.keyClaims];
  const recordTypeCounts = new Map<SourceRecord['recordType'], number>();

  sourceRecords.forEach((record) => {
    recordTypeCounts.set(record.recordType, (recordTypeCounts.get(record.recordType) ?? 0) + 1);
  });

  const focuses = focusDefinitions.map((definition) => {
    const supportingSourceCount = definition.recordTypes.reduce(
      (count, recordType) => count + (recordTypeCounts.get(recordType) ?? 0),
      0,
    );

    return {
      key: definition.key,
      label: definition.label,
      status: supportingSourceCount > 0 ? 'covered' : 'missing',
      supportingSourceCount,
      note: supportingSourceCount > 0 ? definition.coveredNote : definition.missingNote,
    } satisfies CoverageFocusSummary;
  });

  return {
    sourceRecordCount: sourceRecords.length,
    observedCoreClaimCount: claims.filter((claim) => claim.truthType === 'observed' && claim.materiality === 'core').length,
    inferredClaimCount: claims.filter((claim) => claim.truthType === 'inferred').length,
    hypotheticalClaimCount: claims.filter((claim) => claim.truthType === 'hypothetical').length,
    analystReviewRequiredCount: claims.filter((claim) => claim.analystReviewRequired).length,
    eventCount: project.timeline.length,
    memoCount: project.memos.length,
    coveredFocusCount: focuses.filter((focus) => focus.status === 'covered').length,
    missingFocusCount: focuses.filter((focus) => focus.status === 'missing').length,
    focuses,
  };
}

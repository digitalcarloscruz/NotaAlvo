type ExistingQuestion = { provenance?: { validationMethod?: string }; correct_option: number | null; options: string[] };
type ArchiveItem = { metadata?: { parserVersion?: number }; extraction_status: string; correct_option: number | null; options: string[] };
export function canRepairStatement(existing: ExistingQuestion | undefined, item: ArchiveItem): boolean;

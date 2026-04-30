import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const typesPath = path.resolve(root, 'src/generated/types.gen.ts');

let source = readFileSync(typesPath, 'utf8');
let fixCount = 0;

// Fix 1: Replace PascalCase type-name strings used as discriminant values.
// The codegen emits schema $ref names as literal values for discriminant
// fields (pubType, type, projectType, processType, status). Replace each
// with the correct enum type based on the field name.
const fieldToType = {
	pubType: 'PubType',
	type: 'PubType',
	projectType: 'PubProjectType',
	processType: 'PubProcessType',
	status: 'PubDraftStatus',
};

const discriminantRe =
	/(?<=\b(pubType|type|projectType|processType|status)\??: )'[A-Z][A-Za-z]+'/g;

source = source.replaceAll(discriminantRe, (match, field) => {
	fixCount++;
	return fieldToType[field];
});

// Fix 2: Advance_notice discriminator types (issue #30).
// Each reuses member types whose `type` literal conflicts with the parent
// union's `type: 'advance_notice'`, producing `never`. Strip `type` via Omit.
const advanceNoticeReplacements = [
	[
		`export type PublicationAdvanceNoticeDetailDiscriminator = ({
    projectType: 'competition';
} & PublicationCompetitionDetail) | ({
    projectType: 'study_contract';
} & PublicationStudyContractDetail) | ({
    projectType: 'tender';
} & PublicationTenderDetail);`,
		`export type PublicationAdvanceNoticeDetailDiscriminator = ({
    projectType: 'competition';
} & Omit<PublicationCompetitionDetail, 'type'>) | ({
    projectType: 'study_contract';
} & Omit<PublicationStudyContractDetail, 'type'>) | ({
    projectType: 'tender';
} & Omit<PublicationTenderDetail, 'type'>);`,
	],
	[
		`export type PublicationAdvanceNoticeDiscriminator = ({
    projectType: 'competition';
} & PublicationCompetitionBase) | ({
    projectType: 'study_contract';
} & PublicationStudyContractBase) | ({
    projectType: 'tender';
} & PublicationTenderBase);`,
		`export type PublicationAdvanceNoticeDiscriminator = ({
    projectType: 'competition';
} & Omit<PublicationCompetitionBase, 'type'>) | ({
    projectType: 'study_contract';
} & Omit<PublicationStudyContractBase, 'type'>) | ({
    projectType: 'tender';
} & Omit<PublicationTenderBase, 'type'>);`,
	],
	[
		`export type PubDraftAdvanceNoticeDiscriminator = ({
    projectType: 'competition';
} & PubDraftCompetitionBase) | ({
    projectType: 'study_contract';
} & PubDraftStudyContractBase) | ({
    projectType: 'tender';
} & PubDraftTenderBase);`,
		`export type PubDraftAdvanceNoticeDiscriminator = ({
    projectType: 'competition';
} & Omit<PubDraftCompetitionBase, 'type'>) | ({
    projectType: 'study_contract';
} & Omit<PubDraftStudyContractBase, 'type'>) | ({
    projectType: 'tender';
} & Omit<PubDraftTenderBase, 'type'>);`,
	],
	[
		`export type PubDraftAdvanceNoticeDetailDiscriminator = ({
    projectType: 'competition';
} & PubDraftCompetitionDetail) | ({
    projectType: 'study_contract';
} & PubDraftStudyContractDetail) | ({
    projectType: 'tender';
} & PubDraftTenderDetail);`,
		`export type PubDraftAdvanceNoticeDetailDiscriminator = ({
    projectType: 'competition';
} & Omit<PubDraftCompetitionDetail, 'type'>) | ({
    projectType: 'study_contract';
} & Omit<PubDraftStudyContractDetail, 'type'>) | ({
    projectType: 'tender';
} & Omit<PubDraftTenderDetail, 'type'>);`,
	],
];

const missingAdvanceNotice = advanceNoticeReplacements.filter(
	([before]) => !source.includes(before),
);
if (missingAdvanceNotice.length > 0) {
	console.error(
		'postprocess-types: advance_notice discriminator patterns not found:',
	);
	for (const [before] of missingAdvanceNotice) {
		console.error(`  - ${before.split('\n')[0]}`);
	}

	process.exit(1);
}

for (const [before, after] of advanceNoticeReplacements) {
	source = source.replace(before, after);
	fixCount++;
}

writeFileSync(typesPath, source);
console.log(`postprocess-types: ${fixCount} type fixes applied`);

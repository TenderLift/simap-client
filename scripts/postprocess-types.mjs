import {readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const typesPath = path.resolve(root, 'src/generated/types.gen.ts');

const replacements = [
	["'ProcOfficeProjectHeaderDatesPublishedAdditionalInterface'", 'PubType'],
	[
		"'ProcOfficeProjectHeaderDatesPublishedAdditionalSelectiveInterface'",
		'PubProcessType',
	],
	["'ProcOfficeProjectHeaderDatesPublishedInterface'", 'PubDraftStatus'],
	["'PublicationAwardDetailInterface'", 'PubType'],
	["'PublicationAwardBaseInterface'", 'PubType'],
	["'PublicProjectHeaderDatesAdditionalInterface'", 'PubType'],
	[
		"'PublicProjectHeaderDatesAdditionalSelectiveInterface'",
		'PubProcessType',
	],
	["'PubDraftAwardBaseInterface'", 'PubType'],
	["'PubDraftCallForBidsBaseInterface'", 'PubType'],
	["'PubDraftAwardDetailInterface'", 'PubType'],
	["'PubDraftDirectAwardTenderProcurementInterface'", 'PubProjectType'],
	["'PubDraftAwardTenderProcurementInterface'", 'PubProjectType'],
];

let source = readFileSync(typesPath, 'utf8');

const missing = replacements.filter(([before]) => !source.includes(before));
if (missing.length > 0) {
	console.error(
		'postprocess-types: expected patterns not found (spec or codegen output changed):',
	);
	for (const [before] of missing) {
		console.error(`  - ${before}`);
	}

	process.exit(1);
}

let count = 0;
for (const [before, after] of replacements) {
	source = source.replace(before, after);
	count++;
}

writeFileSync(typesPath, source);
console.log(
	`postprocess-types: ${count}/${replacements.length} discriminant literals fixed`,
);

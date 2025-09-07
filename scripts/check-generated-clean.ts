import {execSync} from 'node:child_process';

try {
	// The `|| true` is a trick to ensure the command exits with 0 if there's no diff,
	// but still captures the output. `git diff --quiet` would exit with 1 on diff.
	const output = execSync('git diff --name-only -- src/generated')
		.toString()
		.trim();
	if (output) {
		console.error(
			'🔴 Generated sources are not up-to-date. Found changes in:',
		);
		console.error(output);
		console.error('Please run `pnpm gen` and commit the changes.');
		process.exit(1);
	}

	console.log('✅ Generated sources are up-to-date.');
} catch (error) {
	console.error('🔴 Failed to check for clean generated sources.');
	console.error(error);
	process.exit(1);
}

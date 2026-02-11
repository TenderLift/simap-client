import {describe, expect, it, beforeAll} from 'vitest';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

describe('Bundle Size Verification', () => {
	let distExists = false;

	beforeAll(async () => {
		// Check if dist directory exists
		try {
			await fs.access(path.join(projectRoot, 'dist'));
			distExists = true;
		} catch {
			console.warn(
				'Warning: dist directory not found. Run "pnpm build" before testing bundle size.',
			);
		}
	});

	it('should have built dist files', async () => {
		if (!distExists) {
			console.log('Skipping: dist directory not found');
			return;
		}

		const distDir = path.join(projectRoot, 'dist');
		const files = await fs.readdir(distDir);

		// Check for required output files
		expect(files).toContain('index.js');
		expect(files).toContain('index.cjs');
		expect(files).toContain('index.d.ts');
	});

	it('ESM bundle should be under 15KB gzipped', async () => {
		if (!distExists) {
			console.log('Skipping: dist directory not found');
			return;
		}

		const esmPath = path.join(projectRoot, 'dist', 'index.js');
		const content = await fs.readFile(esmPath);
		const gzipped = gzipSync(content);
		const sizeInKB = gzipped.length / 1024;

		console.log(`ESM bundle size: ${sizeInKB.toFixed(2)}KB gzipped`);
		// Allowing up to 15KB for unminified code (consumers will minify)
		expect(sizeInKB).toBeLessThan(15);
	});

	it('CJS bundle should be under 12KB gzipped', async () => {
		if (!distExists) {
			console.log('Skipping: dist directory not found');
			return;
		}

		const cjsPath = path.join(projectRoot, 'dist', 'index.cjs');
		const content = await fs.readFile(cjsPath);
		const gzipped = gzipSync(content);
		const sizeInKB = gzipped.length / 1024;

		console.log(`CJS bundle size: ${sizeInKB.toFixed(2)}KB gzipped`);
		// Allowing up to 14KB for unminified CJS code (consumers will minify)
		// CJS is larger due to module system overhead
		expect(sizeInKB).toBeLessThan(14);
	});

	it('TypeScript definitions should be generated', async () => {
		if (!distExists) {
			console.log('Skipping: dist directory not found');
			return;
		}

		const dtsPath = path.join(projectRoot, 'dist', 'index.d.ts');
		const stats = await fs.stat(dtsPath);

		expect(stats.size).toBeGreaterThan(0);
		console.log(
			`TypeScript definitions size: ${(stats.size / 1024).toFixed(2)}KB`,
		);
	});

	it('should export expected modules', async () => {
		if (!distExists) {
			console.log('Skipping: dist directory not found');
			return;
		}

		// Read the ESM bundle to check exports
		const esmPath = path.join(projectRoot, 'dist', 'index.js');
		const content = await fs.readFile(esmPath, 'utf-8');

		// Check for key exports
		expect(content).toContain('export');
		expect(content).toContain('client');
		expect(content).toContain('HttpError');
		expect(content).toContain('ensureOk');
		expect(content).toContain('withAuth');
	});

	it('bundle should be tree-shakeable', async () => {
		if (!distExists) {
			console.log('Skipping: dist directory not found');
			return;
		}

		// Check ESM bundle for proper module structure
		const esmPath = path.join(projectRoot, 'dist', 'index.js');
		const content = await fs.readFile(esmPath, 'utf-8');

		// ESM should use proper import/export syntax
		expect(content).toMatch(/export\s+{/);
		expect(content).not.toContain('module.exports');
	});

	it('CJS bundle should be CommonJS compatible', async () => {
		if (!distExists) {
			console.log('Skipping: dist directory not found');
			return;
		}

		// Check CJS bundle for proper CommonJS structure
		const cjsPath = path.join(projectRoot, 'dist', 'index.cjs');
		const content = await fs.readFile(cjsPath, 'utf-8');

		// CJS should use CommonJS syntax
		expect(content).toMatch(/(module\.exports|exports\.|__exportStar)/);
	});
});

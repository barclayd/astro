import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { generateCspDigest } from '../../../dist/core/encryption.js';

describe('generateCspDigest', () => {
	it('produces the same hash for LF and CRLF input', async () => {
		const lf = '.pulse { animation: pulser 2s infinite }\n.inner { animation-delay: 0.5s }\n';
		const crlf = lf.replace(/\n/g, '\r\n');

		const lfHash = await generateCspDigest(lf, 'SHA-256');
		const crlfHash = await generateCspDigest(crlf, 'SHA-256');

		assert.equal(crlfHash, lfHash, 'CRLF input should produce the same hash as LF input');
	});

	it('normalizes lone CR to LF before hashing', async () => {
		const lf = 'body { color: red }\n';
		const cr = lf.replace(/\n/g, '\r');

		const lfHash = await generateCspDigest(lf, 'SHA-256');
		const crHash = await generateCspDigest(cr, 'SHA-256');

		assert.equal(crHash, lfHash, 'lone CR input should produce the same hash as LF input');
	});

	it('does not alter LF-only input', async () => {
		const content = '.square { fill: red }\n';
		const hash = await generateCspDigest(content, 'SHA-256');

		assert.ok(hash.startsWith('sha256-'), 'hash should have the sha256- prefix');
		// Re-hash to confirm determinism
		const hash2 = await generateCspDigest(content, 'SHA-256');
		assert.equal(hash, hash2);
	});
});

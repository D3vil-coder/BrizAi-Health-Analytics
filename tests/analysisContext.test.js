import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeAnalysisData } from '../src/services/analysisContext.js';

test('analysis keeps health fields while excluding credentials and provider settings', () => {
    const profile = {
        name: 'Test user', age: '24', gender: 'other', height: '170', weight: '65',
        dietaryPreferences: 'vegetarian', geminiKey: 'test-secret-key',
        googleFitClientId: 'test-client-id', googleFitToken: 'test-access-token',
        ollamaUrl: 'https://example.invalid/generate', nested: { token: 'nested-secret' },
    };
    const log = { profile, steps: 1200, workouts: ['walk'] };
    const safe = sanitizeAnalysisData(log);
    assert.deepEqual(safe, {
        steps: 1200, workouts: ['walk'],
        profile: { name: 'Test user', age: '24', gender: 'other', height: '170', weight: '65', dietaryPreferences: 'vegetarian' },
    });
    const serialized = JSON.stringify(safe);
    for (const secret of ['test-secret-key', 'test-client-id', 'test-access-token', 'nested-secret', 'example.invalid']) {
        assert.equal(serialized.includes(secret), false);
    }
    assert.equal(log.profile.geminiKey, 'test-secret-key');
});

test('missing or non-object profiles produce no credential data', () => {
    assert.deepEqual(sanitizeAnalysisData({ profile: null, total: 1 }), { profile: {}, total: 1 });
    assert.deepEqual(sanitizeAnalysisData({ profile: { name: { token: 'hidden' } } }), { profile: {} });
    const withoutProfile = { steps: 42 };
    assert.equal(sanitizeAnalysisData(withoutProfile), withoutProfile);
});


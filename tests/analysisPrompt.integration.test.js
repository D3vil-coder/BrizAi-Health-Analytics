import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('fitness, sleep, nutrition and water prompts exclude profile credentials for both providers', async () => {
    const captured = [];
    class FakeGoogleGenerativeAI {
        getGenerativeModel() {
            return { generateContent: async prompt => {
                captured.push(prompt);
                return { response: { text: () => 'mock response' } };
            } };
        }
    }
    const fakeFetch = async (_url, options) => {
        captured.push(JSON.parse(options.body).prompt);
        return { ok: true, json: async () => ({ response: 'mock response' }) };
    };
    const context = vm.createContext({
        console: { log() {}, error() {} }, setTimeout, clearTimeout, AbortController, fetch: fakeFetch,
    });
    const sdk = new vm.SyntheticModule(['GoogleGenerativeAI'], function () {
        this.setExport('GoogleGenerativeAI', FakeGoogleGenerativeAI);
    }, { context });
    const safe = new vm.SourceTextModule(await readFile(new URL('../src/services/analysisContext.js', import.meta.url), 'utf8'), { context });
    const service = new vm.SourceTextModule(await readFile(new URL('../src/services/aiService.js', import.meta.url), 'utf8'), { context });
    await service.link(specifier => {
        if (specifier === '@google/generative-ai') return sdk;
        if (specifier === './analysisContext.js') return safe;
        throw new Error(`Unexpected import: ${specifier}`);
    });
    await service.evaluate();

    const profile = { name: 'Test user', age: '24', weight: '65', geminiKey: 'dummy-private-key',
        googleFitClientId: 'dummy-client-id', googleFitToken: 'dummy-access-token', ollamaUrl: 'https://private.example/api' };
    for (const section of ['Fitness', 'Sleep', 'Nutrition', 'Water Intake']) {
        for (const config of [
            { aiModel: 'gemini', geminiKey: 'dummy-private-key' },
            { aiModel: 'ollama', ollamaUrl: 'http://localhost:11434/api/generate', ollamaModel: 'example' },
        ]) {
            assert.equal(await service.namespace.analyzeSection(section, { profile, steps: 1234 }, config), 'mock response');
        }
    }
    assert.equal(captured.length, 8);
    for (const prompt of captured) {
        assert.match(prompt, /Test user/);
        assert.match(prompt, /1234/);
        for (const secret of ['dummy-private-key', 'dummy-client-id', 'dummy-access-token', 'private.example']) {
            assert.equal(prompt.includes(secret), false);
        }
    }
});

test('sync paths do not log the access-token prefix or raw health records', async () => {
    const dashboard = await readFile(new URL('../src/components/Dashboard/Dashboard.jsx', import.meta.url), 'utf8');
    const fitService = await readFile(new URL('../src/services/googleFitService.js', import.meta.url), 'utf8');
    assert.doesNotMatch(dashboard, /googleFitToken\?\.substring/);
    assert.doesNotMatch(dashboard, /console\.log\([^\n]*JSON\.stringify\(data/);
    assert.doesNotMatch(dashboard, /console\.log\([^\n]*mappedData/);
    assert.doesNotMatch(fitService, /console\.log\([^\n]*data\.bucket/);
});


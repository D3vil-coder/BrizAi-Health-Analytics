import { GoogleGenerativeAI } from "@google/generative-ai";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// Sleep utility for retry delays
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Error types that should not be retried
const NON_RETRYABLE_ERRORS = [
    'API Key',
    'API_KEY',
    'INVALID_API_KEY',
    'authentication',
    'unauthorized',
    'forbidden'
];

const isRetryableError = (error) => {
    const errorMessage = error.message?.toLowerCase() || '';
    return !NON_RETRYABLE_ERRORS.some(keyword =>
        errorMessage.includes(keyword.toLowerCase())
    );
};

export const generateAIResponse = async (prompt, context, config, retries = MAX_RETRIES) => {
    console.log('[AI] Config received:', { aiModel: config?.aiModel, hasKey: !!config?.geminiKey, geminiModel: config?.geminiModel });
    const { aiModel, geminiKey, geminiModel, ollamaUrl, ollamaModel } = config || {};

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            if (aiModel === 'gemini') {
                if (!geminiKey) {
                    throw new Error("Please add your Gemini API Key in Settings → AI Configuration");
                }

                const genAI = new GoogleGenerativeAI(geminiKey);
                const selectedModel = geminiModel || "gemini-2.0-flash-lite";
                const model = genAI.getGenerativeModel({ model: selectedModel });

                const fullPrompt = `${context ? `Context: ${context}\n` : ''}Prompt: ${prompt}`;
                const result = await model.generateContent(fullPrompt);
                const response = await result.response;
                return response.text();
            }
            else if (aiModel === 'ollama') {
                if (!ollamaUrl) {
                    throw new Error("Please configure Ollama URL in Settings → AI Configuration");
                }

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

                try {
                    const response = await fetch(ollamaUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: ollamaModel || "llama3",
                            prompt: `${context ? `Context: ${context}\n` : ''}Prompt: ${prompt}`,
                            stream: false
                        }),
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (!response.ok) {
                        const errorText = await response.text().catch(() => 'Unknown error');
                        throw new Error(`Ollama request failed (${response.status}): ${errorText}`);
                    }

                    const data = await response.json();
                    return data.response;
                } catch (fetchError) {
                    clearTimeout(timeoutId);
                    if (fetchError.name === 'AbortError') {
                        throw new Error('Request timed out. Please check if Ollama is running.');
                    }
                    throw fetchError;
                }
            } else {
                throw new Error("No AI model configured. Please select an AI provider in Settings.");
            }
        } catch (error) {
            console.error(`AI Error (attempt ${attempt + 1}/${retries}):`, error);

            // Don't retry non-retryable errors
            if (!isRetryableError(error)) {
                throw new Error(getUserFriendlyError(error));
            }

            // If this was the last attempt, throw with user-friendly message
            if (attempt === retries - 1) {
                throw new Error(
                    `Failed to get AI response after ${retries} attempts. ` +
                    `Please check your internet connection and API settings. ` +
                    `Error: ${error.message}`
                );
            }

            // Exponential backoff: 1s, 2s, 4s
            const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
            console.log(`Retrying in ${delay}ms...`);
            await sleep(delay);
        }
    }
};

// Convert technical errors to user-friendly messages
const getUserFriendlyError = (error) => {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('api key') || message.includes('api_key')) {
        return 'Invalid API key. Please check your Gemini API key in Settings.';
    }
    if (message.includes('quota') || message.includes('rate limit')) {
        return 'API rate limit reached. Please wait a moment and try again.';
    }
    if (message.includes('network') || message.includes('fetch')) {
        return 'Network error. Please check your internet connection.';
    }
    if (message.includes('timeout')) {
        return 'Request timed out. The AI service may be overloaded. Please try again.';
    }
    if (message.includes('model')) {
        return 'The selected AI model is unavailable. Try switching to a different model in Settings.';
    }

    return error.message || 'An unexpected error occurred. Please try again.';
};

export const aggregateFullContext = (appData) => {
    const { userProfile, dailyLogs, tasks } = appData;
    const today = new Date().toISOString().split('T')[0];
    const todayLog = dailyLogs[today] || {};

    let context = `User Profile:
- Name: ${userProfile.name}
- Age: ${userProfile.age}
- Weight: ${userProfile.weight}kg
- Height: ${userProfile.height}cm
- Preferences: ${userProfile.dietaryPreferences}\n\n`;

    context += `Today's Health Activity:
- Steps: ${todayLog.fitness?.steps || 0}
- Sleep: ${JSON.stringify(todayLog.sleep || 'Not logged')}
- Water: ${JSON.stringify(todayLog.water || 'Not logged')}\n\n`;

    context += `Nutrition (Log):
${JSON.stringify(todayLog.nutrition?.meals || 'No meals logged today')}\n\n`;

    context += `Calendar & Tasks:
${JSON.stringify(tasks.filter(t => t.isTodo || t.date === today))}\n\n`;

    // Add historical context if needed (e.g., last 3 days)
    const dates = Object.keys(dailyLogs).sort().reverse().slice(1, 4);
    if (dates.length > 0) {
        context += `Recent History (Last 3 days):\n`;
        dates.forEach(date => {
            const log = dailyLogs[date];
            context += `- ${date}: Steps: ${log.fitness?.steps || 0}, Sleep Quality: ${log.sleep?.quality || 'N/A'}\n`;
        });
    }

    return context;
};

export const getCoachingResponse = async (userPrompt, appData) => {
    const { userProfile } = appData;
    const context = aggregateFullContext(appData);

    const prompt = `
    You are the user's elite AI Personal Coach, inspired by top sports scientists and nutritional researchers.
    Your goal is to provide deep, actionable insights by correlating different data points (e.g., how yesterday's bad sleep affected today's workout).

    Current Question/Need: "${userPrompt}"

    Guidelines:
    1. Be highly data-driven. Cite the specific numbers from the context.
    2. Use the "Why?" approach: If someone feels tired, explain the likely physiological reason based on their logged caffeine, sleep, and activity.
    3. Stay professional, encouraging, and peak-performance oriented.
    4. If data is missing for a critical insight, gently suggest what the user should track next time.
    5. Always provide 3 distinct, high-impact "Action Items."

    Response limit: 500 words.
    `;

    return generateAIResponse(prompt, context, userProfile);
};

export const analyzeSection = async (section, data, config) => {
    const prompt = `
    Analyze the following ${section} data and provide extensive, scientifically-backed health insights and suggestions based on current medical and nutritional research.
    
    Data: ${JSON.stringify(data)}
    
    Requirements:
    1. Use a professional, encouraging, yet scientifically accurate tone.
    2. For Nutrition: Explicitly list estimated Vitamins, Minerals, and Roughage/Fiber content based on the meals provided. Identify any deficiencies.
    3. For Fitness: Validate the calorie/step counts using METs or biomechanical standards where possible. Suggest recovery or intensity adjustments.
    4. For Water/Sleep: Cite general medical guidelines (e.g., hydration based on weight, sleep cycles) to contextualize the user's data.
    5. Provide actionable, research-based recommendations.
    6. Keep the response concise but comprehensive (max 400 words).
    `;
    return generateAIResponse(prompt, "You are an advanced personal health assistant with access to extensive medical and nutritional databases.", config);
};

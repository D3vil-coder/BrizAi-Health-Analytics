/**
 * Google Fit Integration Service
 * Handles OAuth2 flow and fetching of health data from Google Fit REST API.
 */

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_FIT_SCOPES = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.sleep.read'
];

export const googleFitService = {
    /**
     * Initiates the OAuth2 flow
     */
    authorize: (clientId) => {
        const redirectUri = window.location.origin;
        const scope = GOOGLE_FIT_SCOPES.join(' ');
        const responseType = 'token'; // Simplified implicit flow for client-side only apps

        const authUrl = `${GOOGLE_AUTH_URL}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=${responseType}&include_granted_scopes=true`;

        window.location.href = authUrl;
    },

    /**
     * Parses the access token from the URL fragment after redirection
     */
    getTokenFromUrl: () => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        return params.get('access_token');
    },

    /**
     * Unified fetcher for Google Fit data
     */
    fetchData: async (accessToken, startTimeMillis, endTimeMillis) => {
        // Use dataTypeName instead of dataSourceId - more reliable across devices
        const dataTypes = [
            { name: 'com.google.step_count.delta', type: 'steps' },
            { name: 'com.google.calories.expended', type: 'calories' },
            { name: 'com.google.weight', type: 'weight' }
        ];

        try {
            const results = {};

            for (const dataType of dataTypes) {
                const response = await fetch('/api/fitness/v1/users/me/dataset:aggregate', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        aggregateBy: [{ dataTypeName: dataType.name }],
                        bucketByTime: { durationMillis: 86400000 },
                        startTimeMillis,
                        endTimeMillis
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    results[dataType.type] = data.bucket;
                    console.log(`[Fit] ${dataType.type}:`, data.bucket);
                } else {
                    console.warn(`Failed to fetch ${dataType.type}:`, response.status, await response.text());
                }
            }

            // Fetch Sleep
            const sleepResponse = await fetch(`/api/fitness/v1/users/me/sessions?startTime=${new Date(startTimeMillis).toISOString()}&endTime=${new Date(endTimeMillis).toISOString()}`, {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (sleepResponse.ok) {
                const sleepData = await sleepResponse.json();
                results.sleep = sleepData.session;
            }

            return results;
        } catch (error) {
            console.error('Error fetching Google Fit data:', error);
            throw error;
        }
    }
};

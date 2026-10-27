// Keep model prompts limited to profile fields needed for health summaries.
const PROFILE_FIELDS = ['name', 'age', 'gender', 'height', 'weight', 'dietaryPreferences'];

export function sanitizeAnalysisData(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data) ||
        !Object.prototype.hasOwnProperty.call(data, 'profile')) return data;

    const profile = data.profile;
    const safeProfile = {};
    if (profile && typeof profile === 'object' && !Array.isArray(profile)) {
        for (const field of PROFILE_FIELDS) {
            const value = profile[field];
            if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
                safeProfile[field] = value;
            }
        }
    }
    return { ...data, profile: safeProfile };
}


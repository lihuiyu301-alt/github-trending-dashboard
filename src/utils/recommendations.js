import { getDateFilter, searchRepos, buildHeaders } from './githubApi.js';

export const RECOMMENDATION_CONFIG = {
  weekly: { days: 7, perPage: 5 },
  hallOfFame: { minStars: 10000, perPage: 5 },
  active: { days: 7, minStars: 5000, perPage: 10, limit: 5 },
};

export const RECOMMENDATION_KEYS = ['weekly', 'hallOfFame', 'active'];

export function buildRecommendationQuery(type, language = '') {
  const languageQuery = language ? ` language:${language}` : '';

  if (type === 'weekly') {
    return `created:>${getDateFilter('week')}${languageQuery}`;
  }

  if (type === 'hallOfFame') {
    return `stars:>${RECOMMENDATION_CONFIG.hallOfFame.minStars}${languageQuery}`;
  }

  if (type === 'active') {
    return `pushed:>${getDateFilter('week')} stars:>${RECOMMENDATION_CONFIG.active.minStars} archived:false${languageQuery}`;
  }

  throw new Error(`Unknown recommendation type: ${type}`);
}

async function fetchRecommendationList(type, language, { token, signal } = {}) {
  const perPage = type === 'active'
    ? RECOMMENDATION_CONFIG.active.perPage
    : RECOMMENDATION_CONFIG[type].perPage;

  const data = await searchRepos({
    q: buildRecommendationQuery(type, language),
    sort: 'stars',
    perPage,
    headers: buildHeaders(token),
    signal,
  });

  return data.items || [];
}

export async function fetchRecommendationLists({ language = '', token, signal } = {}) {
  const results = await Promise.allSettled([
    fetchRecommendationList('weekly', language, { token, signal }),
    fetchRecommendationList('hallOfFame', language, { token, signal }),
    fetchRecommendationList('active', language, { token, signal }),
  ]);

  const aborted = Boolean(signal?.aborted) || results.some(
    (result) => result.status === 'rejected' && result.reason?.name === 'AbortError'
  );

  if (aborted) {
    return {
      weekly: [],
      hallOfFame: [],
      active: [],
      errors: {},
      allFailed: false,
      aborted: true,
    };
  }

  const errors = {};
  RECOMMENDATION_KEYS.forEach((key, index) => {
    if (results[index].status === 'rejected') {
      errors[key] = results[index].reason;
    }
  });

  const weekly = results[0].status === 'fulfilled' ? results[0].value : [];
  const hallOfFame = results[1].status === 'fulfilled' ? results[1].value : [];
  const rawActive = results[2].status === 'fulfilled' ? results[2].value : [];
  const hallIds = new Set(hallOfFame.map((repo) => repo.id));
  const active = rawActive
    .filter((repo) => !hallIds.has(repo.id))
    .slice(0, RECOMMENDATION_CONFIG.active.limit);

  return {
    weekly,
    hallOfFame,
    active,
    errors,
    allFailed: Object.keys(errors).length === RECOMMENDATION_KEYS.length,
    aborted: false,
  };
}

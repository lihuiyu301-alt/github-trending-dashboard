import { getDateFilter, searchRepos, buildHeaders } from './githubApi.js';
import { getAiCategory } from '../config/aiCategories.js';
import { rankAiRepos } from './aiRanking.js';

export const RECOMMENDATION_CONFIG = {
  weekly: { days: 7, perPage: 10, limit: 5 },
  hallOfFame: { minStars: 10000, perPage: 10, limit: 5 },
  active: { days: 7, minStars: 1000, perPage: 15, limit: 5 },
};

export const RECOMMENDATION_KEYS = ['weekly', 'hallOfFame', 'active'];

export function buildRecommendationQuery(type, language = '', category = 'all') {
  const aiTopic = getAiCategory(category).queries[0];
  const languageQuery = language ? ` language:${language}` : '';

  if (type === 'weekly') {
    return `${aiTopic} created:>${getDateFilter('week')}${languageQuery}`;
  }

  if (type === 'hallOfFame') {
    return `${aiTopic} stars:>${RECOMMENDATION_CONFIG.hallOfFame.minStars}${languageQuery}`;
  }

  if (type === 'active') {
    return `${aiTopic} pushed:>${getDateFilter('week')} stars:>${RECOMMENDATION_CONFIG.active.minStars} archived:false${languageQuery}`;
  }

  throw new Error(`Unknown recommendation type: ${type}`);
}

async function fetchRecommendationList(type, language, category, { token, signal, hideCollections = true } = {}) {
  const config = RECOMMENDATION_CONFIG[type];
  const data = await searchRepos({
    q: buildRecommendationQuery(type, language, category),
    sort: 'stars',
    perPage: config.perPage,
    headers: buildHeaders(token),
    signal,
  });

  const sortMode = type === 'active' ? 'trending' : 'stars';
  return rankAiRepos(data.items || [], { hideCollections, sort: sortMode });
}

export async function fetchRecommendationLists({
  language = '',
  category = 'all',
  hideCollections = true,
  token,
  signal,
} = {}) {
  const results = await Promise.allSettled([
    fetchRecommendationList('weekly', language, category, { token, signal, hideCollections }),
    fetchRecommendationList('hallOfFame', language, category, { token, signal, hideCollections }),
    fetchRecommendationList('active', language, category, { token, signal, hideCollections }),
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

  const weekly = results[0].status === 'fulfilled'
    ? results[0].value.slice(0, RECOMMENDATION_CONFIG.weekly.limit)
    : [];
  const hallOfFame = results[1].status === 'fulfilled'
    ? results[1].value.slice(0, RECOMMENDATION_CONFIG.hallOfFame.limit)
    : [];
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

const COLLECTION_NAME_RE = /^(awesome[-_]|.*[-_]awesome$|llm[-_]course|ai[-_]roadmap)/i;
const COLLECTION_DESC_RE = /\b(curated list|awesome list|interview questions|study guide|roadmap|collection of)\b/i;

const AI_KEYWORDS_RE = /\b(ai|llm|gpt|claude|gemini|openai|anthropic|agent|agents|mcp|rag|langchain|langgraph|llamaindex|ollama|vllm|transformer|transformers|diffusion|stable-diffusion|comfyui|multimodal|embedding|embeddings|vector|inference|fine-tuning|finetune|mlops|neural|deep-learning|machine-learning|pytorch|tensorflow|huggingface|deepseek|qwen|copilot|chatbot|tts|asr|whisper|ocr|vision)\b/i;

/**
 * 计算仓库创建至今的天数（至少 1 天）
 * @param {Object} repo
 * @returns {number}
 */
export function getRepoAgeDays(repo) {
  if (!repo?.created_at) return 1;
  const ageMs = Date.now() - new Date(repo.created_at).getTime();
  return Math.max(1, ageMs / (1000 * 60 * 60 * 24));
}

/**
 * 计算日均 Star 增速
 * @param {Object} repo
 * @returns {number}
 */
export function getStarsPerDay(repo) {
  const stars = Number(repo?.stargazers_count || 0);
  return stars / getRepoAgeDays(repo);
}

/**
 * 计算距离最近一次 push 的天数
 * @param {Object} repo
 * @returns {number}
 */
export function getDaysSincePush(repo) {
  if (!repo?.pushed_at) return 30;
  const diffMs = Date.now() - new Date(repo.pushed_at).getTime();
  return Math.max(0, diffMs / (1000 * 60 * 60 * 24));
}

/**
 * 计算综合热度评分（用于“活跃飙升榜”重排）
 * 综合考虑日均 Star 增速、总 Star 对数规模与最近活跃度衰减
 * @param {Object} repo
 * @returns {number}
 */
export function computeTrendingScore(repo) {
  const stars = Number(repo?.stargazers_count || 0);
  const forks = Number(repo?.forks_count || 0);
  const starsPerDay = getStarsPerDay(repo);
  const daysSincePush = getDaysSincePush(repo);

  const recencyWeight = 1 / (1 + daysSincePush * 0.12);
  const scaleWeight = Math.log10(stars + 10);
  const velocityScore = Math.sqrt(starsPerDay) * 12;
  const forkBonus = Math.log10(forks + 1) * 1.5;

  return (velocityScore + scaleWeight * 4 + forkBonus) * recencyWeight;
}

/**
 * 判断是否为纯资料合集 / 清单类仓库（如 awesome-*）
 * @param {Object} repo
 * @returns {boolean}
 */
export function isCollectionRepo(repo) {
  const name = repo?.name || '';
  const desc = repo?.description || '';
  return COLLECTION_NAME_RE.test(name) || COLLECTION_DESC_RE.test(desc);
}

/**
 * 判断仓库是否具有明显 AI 相关性（用于二次过滤或打标）
 * @param {Object} repo
 * @returns {boolean}
 */
export function isAiRelevantRepo(repo) {
  const text = `${repo?.name || ''} ${repo?.description || ''} ${(repo?.topics || []).join(' ')}`;
  return AI_KEYWORDS_RE.test(text);
}

/**
 * 去重仓库列表（按 id 以及同名同描述的刷屏克隆）
 * @param {Array} repos
 * @returns {Array}
 */
export function dedupeRepos(repos) {
  const byId = new Map();
  const bySignature = new Map();

  for (const repo of repos) {
    if (!repo || !repo.id) continue;
    if (byId.has(repo.id)) continue;

    const sig = `${(repo.name || '').toLowerCase()}::${(repo.description || '').trim().toLowerCase()}`;
    const existing = bySignature.get(sig);
    if (existing) {
      if ((repo.stargazers_count || 0) > (existing.stargazers_count || 0)) {
        byId.delete(existing.id);
        byId.set(repo.id, repo);
        bySignature.set(sig, repo);
      }
      continue;
    }

    byId.set(repo.id, repo);
    bySignature.set(sig, repo);
  }

  return Array.from(byId.values());
}

/**
 * 对候选 AI 仓库进行过滤、去重和热度重排
 * @param {Array} repos
 * @param {Object} [options]
 * @param {boolean} [options.hideCollections=true] - 是否过滤 awesome-* 等合集仓库
 * @param {'trending'|'stars'|'forks'|'updated'} [options.sort='trending'] - 排序方式
 * @returns {Array}
 */
export function rankAiRepos(repos, { hideCollections = true, sort = 'trending' } = {}) {
  let list = dedupeRepos(repos);

  if (hideCollections) {
    list = list.filter((repo) => !isCollectionRepo(repo));
  }

  const enriched = list.map((repo) => ({
    ...repo,
    _starsPerDay: getStarsPerDay(repo),
    _trendingScore: computeTrendingScore(repo),
  }));

  if (sort === 'trending') {
    enriched.sort((a, b) => b._trendingScore - a._trendingScore);
  } else if (sort === 'stars') {
    enriched.sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));
  } else if (sort === 'forks') {
    enriched.sort((a, b) => (b.forks_count || 0) - (a.forks_count || 0));
  } else if (sort === 'updated') {
    enriched.sort((a, b) => new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0));
  }

  return enriched;
}

/**
 * AI 细分赛道配置
 * 每条 topic 均使用独立的 GitHub Search 限定符，避免触发 GitHub Search API 422 布尔操作符限制
 */
export const AI_CATEGORIES = [
  {
    value: 'all',
    label: '全部 AI',
    queries: ['topic:ai', 'topic:llm'],
    description: '综合人工智能、大模型与热门开源 AI 项目',
  },
  {
    value: 'llm',
    label: 'LLM 大模型',
    queries: ['topic:llm', 'topic:generative-ai'],
    description: '大语言模型、微调、推理与对话应用',
  },
  {
    value: 'agent',
    label: 'AI Agent',
    queries: ['topic:ai-agent', 'topic:mcp'],
    description: '智能体、自动化工作流与 MCP 工具生态',
  },
  {
    value: 'rag',
    label: 'RAG / 知识库',
    queries: ['topic:rag', 'topic:vector-database'],
    description: '检索增强生成、向量数据库与知识图谱',
  },
  {
    value: 'multimodal',
    label: '多模态',
    queries: ['topic:multimodal', 'topic:diffusion'],
    description: '图像生成、视频、语音合成与视觉理解',
  },
  {
    value: 'ml',
    label: '机器学习 / Infra',
    queries: ['topic:machine-learning', 'topic:deep-learning'],
    description: '深度学习框架、训练推理基础设施与 MLOps',
  },
];

export const AI_MODES = [
  { value: 'trending', label: '活跃飙升榜' },
  { value: 'new', label: '新晋黑马榜' },
];

export function getAiCategory(value) {
  return AI_CATEGORIES.find((cat) => cat.value === value) || AI_CATEGORIES[0];
}

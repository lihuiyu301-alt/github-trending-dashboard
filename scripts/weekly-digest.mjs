import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import nodemailer from 'nodemailer';
import { AI_CATEGORIES } from '../src/config/aiCategories.js';
import { fetchAiRepos, formatNumber, formatStarsPerDay } from '../src/utils/githubApi.js';

const PREVIEW_FILE = resolve(process.cwd(), 'digest-preview.html');
const isDryRun = !process.argv.includes('--send');

/**
 * 本地运行自动加载 .env / .env.local（不覆盖已有环境变量）
 */
function loadLocalEnv() {
  for (const filename of ['.env', '.env.local']) {
    const filePath = resolve(process.cwd(), filename);
    if (!existsSync(filePath)) continue;

    const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIndex = line.indexOf('=');
      if (eqIndex <= 0) continue;
      const key = line.slice(0, eqIndex).trim();
      let value = line.slice(eqIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

loadLocalEnv();
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || process.env.VITE_GITHUB_TOKEN || '';

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function truncate(value, maxLength) {
  const text = String(value || '').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getWeekRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 7);
  return `${formatDate(start)} - ${formatDate(end)}`;
}

function renderRepoRow(repo, index) {
  const owner = repo.owner?.login || '—';
  const name = repo.name || '—';
  const fullName = repo.full_name || `${owner}/${name}`;
  const url = repo.html_url || `https://github.com/${fullName}`;
  const description = truncate(repo.description, 120);
  const rankColor = index < 3 ? '#9a6700' : '#8b949e';
  const velocity = repo._starsPerDay > 0 ? ` &middot; <span style="color:#1a7f37;">+${escapeHtml(formatStarsPerDay(repo._starsPerDay))}</span>` : '';
  const topics = (repo.topics || []).slice(0, 3).map((tp) => `#${escapeHtml(tp)}`).join(' ');

  return `
    <tr>
      <td width="28" valign="top" style="padding:8px 0;font-family:'JetBrains Mono',Consolas,monospace;font-size:12px;font-weight:700;color:${rankColor};">#${index + 1}</td>
      <td valign="top" style="padding:8px 0;">
        <div>
          <a href="${escapeHtml(url)}" style="color:#0969da;font-size:13px;font-weight:600;text-decoration:none;font-family:'JetBrains Mono',Consolas,monospace;">${escapeHtml(fullName)}</a>
        </div>
        ${description ? `<div style="margin-top:2px;font-size:12px;line-height:18px;color:#656d76;">${escapeHtml(description)}</div>` : ''}
        <div style="margin-top:3px;font-size:11px;color:#8b949e;">
          &#9733; ${escapeHtml(formatNumber(repo.stargazers_count))}${velocity}${repo.language ? ` &middot; ${escapeHtml(repo.language)}` : ''}${topics ? ` &middot; ${topics}` : ''}
        </div>
      </td>
    </tr>`;
}

function renderSection(section) {
  const rows = section.failed
    ? '<tr><td style="padding:8px 0;font-size:12px;color:#cf222e;">获取失败，请稍后重试</td></tr>'
    : section.items.length > 0
      ? section.items.map(renderRepoRow).join('')
      : '<tr><td style="padding:8px 0;font-size:12px;color:#8b949e;">暂无数据</td></tr>';

  return `
    <div style="padding:20px 0 8px;border-bottom:1px solid #d0d7de;">
      <div style="font-size:16px;font-weight:700;color:#1f2328;">${escapeHtml(section.title)}</div>
      <div style="margin:3px 0 6px;font-size:12px;color:#656d76;">${escapeHtml(section.description)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
    </div>`;
}

function renderDigestHtml(sections) {
  const subjectDate = formatDate(new Date());
  const content = sections.map(renderSection).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GitHub AI 热门项目速递 · ${escapeHtml(subjectDate)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;color:#1f2328;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:720px;">
          <tr>
            <td style="background-color:#0d1117;padding:24px;border-radius:8px 8px 0 0;">
              <div style="font-size:11px;letter-spacing:1.5px;color:#58a6ff;">GITHUB AI TRENDING DIGEST</div>
              <div style="margin-top:6px;font-size:22px;font-weight:700;color:#e6edf3;">AI 开源热门项目速递</div>
              <div style="margin-top:6px;font-size:13px;color:#7d8590;">${escapeHtml(subjectDate)} · 统计区间 ${escapeHtml(getWeekRange())}</div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;padding:8px 24px 24px;border:1px solid #d0d7de;border-top:0;border-radius:0 0 8px 8px;">
              <p style="margin:16px 0 0;font-size:13px;line-height:20px;color:#656d76;">
                本期已自动过滤纯合集类仓库，按综合热度与增速汇总 GitHub AI 领域最火的开源项目（含活跃飙升榜、新晋黑马榜与细分赛道精选）。
              </p>
              ${content}
              <div style="margin-top:24px;padding-top:16px;border-top:1px solid #d0d7de;font-size:11px;line-height:18px;color:#8b949e;">
                数据来源 GitHub Search API，由 GitHub Actions 自动生成并发送。<br />
                若需调整收件邮箱或发送频率，请修改仓库的 Actions Secrets 与 .github/workflows/weekly-digest.yml。
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function fetchSectionWithRetry(label, fetcher, limit) {
  try {
    const res = await fetcher();
    const items = (res.items || []).slice(0, limit);
    console.log(`${label}: 获取 ${items.length} 条`);
    return { items, failed: false };
  } catch (err) {
    console.warn(`${label} 首次请求失败 (${err?.message || err})，2 秒后重试...`);
    await sleep(2000);
    try {
      const res = await fetcher();
      const items = (res.items || []).slice(0, limit);
      console.log(`${label} 重试成功: 获取 ${items.length} 条`);
      return { items, failed: false };
    } catch (retryErr) {
      console.error(`${label} 重试仍失败: ${retryErr?.message || retryErr}`);
      return { items: [], failed: true };
    }
  }
}

async function collectDigest() {
  if (!token) {
    console.warn('未检测到 GITHUB_TOKEN，匿名请求可能触发 GitHub Search API 限流（10次/分钟）。');
  }

  const sections = [];

  const trendingRes = await fetchSectionWithRetry(
    'AI 本周活跃飙升 Top 10',
    () => fetchAiRepos({
      category: 'all',
      dateRange: 'week',
      mode: 'trending',
      sort: 'trending',
      hideCollections: true,
      token,
    }),
    10
  );
  sections.push({
    title: 'AI 本周活跃飙升榜 Top 10',
    description: '近 7 天持续更新且综合热度（日均增速 + 关注度）最高的 AI 项目',
    ...trendingRes,
  });
  await sleep(1200);

  const newRes = await fetchSectionWithRetry(
    'AI 本周新晋黑马 Top 10',
    () => fetchAiRepos({
      category: 'all',
      dateRange: 'week',
      mode: 'new',
      sort: 'stars',
      hideCollections: true,
      token,
    }),
    10
  );
  sections.push({
    title: 'AI 本周新晋黑马榜 Top 10',
    description: '近 7 天全新发布、Star 增长最快的 AI 新项目',
    ...newRes,
  });
  await sleep(1200);

  const subCategories = AI_CATEGORIES.filter((cat) => ['llm', 'agent', 'rag', 'multimodal'].includes(cat.value));
  for (const cat of subCategories) {
    const catRes = await fetchSectionWithRetry(
      `${cat.label} Top 5`,
      () => fetchAiRepos({
        category: cat.value,
        dateRange: 'week',
        mode: 'trending',
        sort: 'trending',
        hideCollections: true,
        token,
      }),
      5
    );
    sections.push({
      title: `${cat.label} · 本周热门 Top 5`,
      description: cat.description,
      ...catRes,
    });
    await sleep(1200);
  }

  return sections;
}

function getSmtpConfig() {
  const required = ['MAIL_HOST', 'MAIL_USER', 'MAIL_PASS', 'MAIL_TO'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`缺少邮件环境变量: ${missing.join(', ')}`);
  }

  return {
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 465),
    secure: String(process.env.MAIL_SECURE || 'true').toLowerCase() !== 'false',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    from: process.env.MAIL_FROM || process.env.MAIL_USER,
    to: process.env.MAIL_TO,
  };
}

async function main() {
  const sections = await collectDigest();
  const allFailed = sections.every((section) => section.failed);
  const html = renderDigestHtml(sections);

  writeFileSync(PREVIEW_FILE, html, 'utf8');
  console.log(`已生成 AI 热门邮件预览: ${PREVIEW_FILE}`);

  if (allFailed) {
    throw new Error('所有 AI 榜单的 GitHub 请求均失败，已跳过发送邮件');
  }

  if (isDryRun) {
    console.log('当前为 dry-run 模式，未发送邮件。使用 --send 参数实际发送。');
    return;
  }

  const smtp = getSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: smtp.auth,
  });

  const subjectDate = formatDate(new Date());
  const info = await transporter.sendMail({
    from: smtp.from,
    to: smtp.to,
    subject: `AI 开源热门项目速递 · ${subjectDate}`,
    html,
  });

  console.log(`邮件发送成功: ${info.messageId}`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});

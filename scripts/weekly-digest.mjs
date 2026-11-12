import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import nodemailer from 'nodemailer';
import { LANGUAGES } from '../src/config/languages.js';
import { fetchRecommendationLists } from '../src/utils/recommendations.js';
import { formatNumber } from '../src/utils/githubApi.js';

const PREVIEW_FILE = resolve(process.cwd(), 'digest-preview.html');
const isDryRun = !process.argv.includes('--send');
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

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

  return `
    <tr>
      <td width="24" valign="top" style="padding:7px 0;font-family:'JetBrains Mono',Consolas,monospace;font-size:12px;color:${rankColor};">${index + 1}</td>
      <td valign="top" style="padding:7px 0;">
        <div>
          <a href="${escapeHtml(url)}" style="color:#0969da;font-size:13px;font-weight:600;text-decoration:none;font-family:'JetBrains Mono',Consolas,monospace;">${escapeHtml(fullName)}</a>
        </div>
        ${description ? `<div style="margin-top:2px;font-size:12px;line-height:18px;color:#656d76;">${escapeHtml(description)}</div>` : ''}
        <div style="margin-top:2px;font-size:11px;color:#8b949e;">
          Star ${escapeHtml(formatNumber(repo.stargazers_count))}${repo.language ? ` &middot; ${escapeHtml(repo.language)}` : ''}
        </div>
      </td>
    </tr>`;
}

function renderList(title, description, items, failed) {
  const rows = failed
    ? '<tr><td style="padding:8px 0;font-size:12px;color:#cf222e;">获取失败，请稍后重试</td></tr>'
    : items.length > 0
      ? items.slice(0, 5).map(renderRepoRow).join('')
      : '<tr><td style="padding:8px 0;font-size:12px;color:#8b949e;">暂无数据</td></tr>';

  return `
    <div style="margin-top:16px;">
      <div style="font-size:13px;font-weight:700;color:#1f2328;">${title}</div>
      <div style="margin:2px 0 4px;font-size:11px;color:#8b949e;">${description}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
    </div>`;
}

function renderLanguageSection(entry) {
  return `
    <div style="padding:22px 0 4px;border-bottom:2px solid #d0d7de;">
      <div style="font-size:17px;font-weight:700;color:#1f2328;">${escapeHtml(entry.language.label)}</div>
      ${renderList('本周新晋热门', '近 7 天新建、Star 最多', entry.weekly, Boolean(entry.errors.weekly))}
      ${renderList('殿堂级热门', '历史 Star 最高', entry.hallOfFame, Boolean(entry.errors.hallOfFame))}
      ${renderList('近期活跃热门', '近 7 天有更新、Star 较高', entry.active, Boolean(entry.errors.active))}
    </div>`;
}

function renderDigestHtml(entries) {
  const subjectDate = formatDate(new Date());
  const content = entries.map(renderLanguageSection).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GitHub 本周热门速递 · ${escapeHtml(subjectDate)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f8fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;color:#1f2328;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:720px;">
          <tr>
            <td style="background-color:#0d1117;padding:24px;border-radius:8px 8px 0 0;">
              <div style="font-size:11px;letter-spacing:1.5px;color:#8b949e;">GITHUB WEEKLY DIGEST</div>
              <div style="margin-top:6px;font-size:22px;font-weight:700;color:#e6edf3;">GitHub 本周热门速递</div>
              <div style="margin-top:6px;font-size:13px;color:#7d8590;">${escapeHtml(subjectDate)} · 本周区间 ${escapeHtml(getWeekRange())}</div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;padding:8px 24px 24px;border:1px solid #d0d7de;border-top:0;border-radius:0 0 8px 8px;">
              <p style="margin:16px 0 0;font-size:13px;line-height:20px;color:#656d76;">
                本期按语言汇总三类项目：本周新晋热门、殿堂级热门、近期活跃热门。点击仓库名可直接打开 GitHub 页面。
              </p>
              ${content}
              <div style="margin-top:24px;padding-top:16px;border-top:1px solid #d0d7de;font-size:11px;line-height:18px;color:#8b949e;">
                数据来源 GitHub Search API，由 GitHub Actions 自动生成并发送。<br />
                若需调整收件邮箱或发送时间，请修改仓库的 Actions Secrets 与工作流配置。
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

async function collectDigest() {
  if (!token) {
    console.warn('未检测到 GITHUB_TOKEN，匿名请求可能触发 GitHub Search API 限流。');
  }

  const entries = [];

  for (const language of LANGUAGES) {
    let result = await fetchRecommendationLists({ language: language.value, token });

    if (result.allFailed) {
      await sleep(2000);
      result = await fetchRecommendationLists({ language: language.value, token });
    }

    const errorTypes = Object.keys(result.errors);

    console.log(
      `${language.label}: weekly=${result.weekly.length}, hallOfFame=${result.hallOfFame.length}, active=${result.active.length}${errorTypes.length ? `, errors=${errorTypes.join(',')}` : ''}`
    );

    entries.push({
      language,
      weekly: result.weekly,
      hallOfFame: result.hallOfFame,
      active: result.active,
      errors: result.errors,
      allFailed: result.allFailed,
    });

    await sleep(1000);
  }

  return entries;
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
  const entries = await collectDigest();
  const allFailed = entries.every((entry) => entry.allFailed);
  const html = renderDigestHtml(entries);

  writeFileSync(PREVIEW_FILE, html, 'utf8');
  console.log(`已生成邮件预览: ${PREVIEW_FILE}`);

  if (allFailed) {
    throw new Error('所有语言的 GitHub 请求均失败，已跳过发送邮件');
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
    subject: `GitHub 本周热门速递 · ${subjectDate}`,
    html,
  });

  console.log(`邮件发送成功: ${info.messageId}`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});

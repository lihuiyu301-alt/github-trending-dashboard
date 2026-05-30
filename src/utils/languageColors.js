/**
 * GitHub 官方语言颜色映射表
 * @see https://github.com/github/linguistics/blob/master/lib/linguist/languages.yml
 */
export const LANGUAGE_COLORS = {
  JavaScript:  '#f1e05a',
  TypeScript:  '#3178c6',
  Python:      '#3572A5',
  Go:          '#00ADD8',
  Rust:        '#dea584',
  Java:        '#b07219',
  'C++':       '#f34b7d',
  'C#':        '#178600',
  C:           '#555555',
  Ruby:        '#701516',
  Swift:       '#F05138',
  Kotlin:      '#A97BFF',
  PHP:         '#4F5D95',
  Dart:        '#00B4AB',
  Scala:       '#c22d40',
  Shell:       '#89e051',
  HTML:        '#e34c26',
  CSS:         '#563d7c',
  Vue:         '#41b883',
  Elixir:      '#6e4a7e',
};

/**
 * 获取语言对应的颜色
 * @param {string} language - 编程语言名称
 * @returns {string} 十六进制颜色值，默认灰色
 */
export function getLanguageColor(language) {
  return LANGUAGE_COLORS[language] || '#8b8b8b';
}

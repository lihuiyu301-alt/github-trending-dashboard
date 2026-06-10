/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** GitHub Personal Access Token，提升 API 限额至 5000 次/小时 */
  readonly VITE_GITHUB_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

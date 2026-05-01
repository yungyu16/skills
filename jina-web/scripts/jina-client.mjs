#!/usr/bin/env node
/**
 * Jina OpenAPI 客户端 — 共享的基础库。
 * 封装 Jina Reader API (r.jina.ai) 和 Search API (svip.jina.ai) 的 HTTP 调用。
 * 零第三方依赖，使用 Node.js 内置 fetch。
 */

class JinaAPIError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JinaAPIError';
  }
}

import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const TOKEN_PATH = join(homedir(), '.config', 'jina-api', 'key');

function readPersistedToken() {
  if (!existsSync(TOKEN_PATH)) return null;
  try {
    return readFileSync(TOKEN_PATH, 'utf-8').trim();
  } catch {
    return null;
  }
}

function getApiKey() {
  const fileKey = readPersistedToken();
  if (fileKey) return fileKey;

  throw new JinaAPIError(
    'NO_API_KEY: 未配置 Jina API Key。' +
    '引导用户输入 token，然后运行 node scripts/auth.mjs set <token> 进行验证和保存。' +
    '获取 Key: https://jina.ai/api-dashboard/'
  );
}

async function requestJson(url, body, { apiKey = '', extraHeaders = {}, method = 'POST', timeout = 60000 } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }
  Object.assign(headers, extraHeaders);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new JinaAPIError(`HTTP ${res.status}: ${errBody}`);
    }

    const json = await res.json();
    return json;
  } catch (e) {
    if (e instanceof JinaAPIError) throw e;
    if (e.name === 'AbortError') {
      throw new JinaAPIError(`请求超时 (${timeout}ms)`);
    }
    throw new JinaAPIError(`网络错误: ${e.message}`);
  } finally {
    clearTimeout(timer);
  }
}

export { JinaAPIError, getApiKey, requestJson };

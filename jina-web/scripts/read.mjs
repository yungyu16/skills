#!/usr/bin/env node
/**
 * 调用 Jina Reader API 读取网页/PDF 内容，支持单个或多个 URL 并发读取。
 *
 * 用法:
 *   node read.mjs https://example.com
 *   node read.mjs https://a.com https://b.com https://c.com
 *   node read.mjs --with-links https://example.com
 *   node read.mjs --with-images https://example.com
 *   node read.mjs --max-workers 3 -o output.json https://a.com https://b.com
 */

import { getApiKey, requestJson, JinaAPIError } from './jina-client.mjs';

const READER_URL = 'https://r.jina.ai/';

function readOne(url, { withLinks = false, withImages = false, apiKey = '' } = {}) {
  // 简单 URL 校验
  try {
    const parsed = new URL(url);
    if (!parsed.protocol || !parsed.hostname) throw new Error();
  } catch {
    return Promise.resolve({
      url, title: '', content: '', links: [], images: [],
      error: `无效 URL: ${url}`
    });
  }

  const extraHeaders = { 'X-Md-Link-Style': 'discarded' };
  if (withLinks) extraHeaders['X-With-Links-Summary'] = 'all';
  if (withImages) extraHeaders['X-With-Images-Summary'] = 'true';
  else extraHeaders['X-Retain-Images'] = 'none';

  return requestJson(READER_URL, { url }, { apiKey, extraHeaders })
    .then(result => {
      const data = result?.data || {};
      return {
        url: data.url || url,
        title: data.title || '',
        content: data.content || '',
        links: withLinks ? (data.links || []) : [],
        images: withImages ? (data.images || []) : [],
      };
    })
    .catch(e => ({
      url, title: '', content: '', links: [], images: [],
      error: e instanceof JinaAPIError ? e.message : String(e)
    }));
}

function parseArgs(argv) {
  const args = { urls: [], withLinks: false, withImages: false, maxWorkers: 5, output: null };
  let i = 0;
  while (i < argv.length) {
    switch (argv[i]) {
      case '--with-links': args.withLinks = true; break;
      case '--with-images': args.withImages = true; break;
      case '--max-workers': args.maxWorkers = parseInt(argv[++i], 10) || 5; break;
      case '--output': case '-o': args.output = argv[++i]; break;
      default: args.urls.push(argv[i]); break;
    }
    i++;
  }
  return args;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error('用法: node read.mjs <url1> [url2] ... [--with-links] [--with-images] [--max-workers N] [-o file.json]');
    process.exit(1);
  }

  const args = parseArgs(argv);
  let apiKey;
  try {
    apiKey = getApiKey();
  } catch (e) {
    console.error(`错误: ${e.message}`);
    process.exit(1);
  }

  const options = { withLinks: args.withLinks, withImages: args.withImages, apiKey };

  // 分块并发，保持输入顺序
  const results = [];
  const maxWorkers = args.maxWorkers;
  for (let i = 0; i < args.urls.length; i += maxWorkers) {
    const chunk = args.urls.slice(i, i + maxWorkers);
    const chunkResults = await Promise.all(chunk.map(url => readOne(url, options)));
    results.push(...chunkResults);
  }

  const output = { count: results.length, results };
  const jsonStr = JSON.stringify(output, null, 2);

  if (args.output) {
    const fs = await import('fs');
    fs.writeFileSync(args.output, jsonStr, 'utf-8');
    console.log(`已保存到 ${args.output}`);
  } else {
    console.log(jsonStr);
  }
}

main();

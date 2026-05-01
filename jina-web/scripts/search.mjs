#!/usr/bin/env node
/**
 * 调用 Jina Search API 搜索网络，支持单个或多个关键词并发搜索。
 *
 * 用法:
 *   node search.mjs "Python 教程"
 *   node search.mjs "AI 新闻" --num 10 --tbs qdr:w
 *   node search.mjs "天气" --location Beijing --gl cn --hl zh-cn
 *   node search.mjs "Kubernetes" "Docker" "微服务"
 *   node search.mjs -o results.json "query1" "query2"
 */

import { getApiKey, requestJson, JinaAPIError } from './jina-client.mjs';

const SEARCH_URL = 'https://svip.jina.ai/';

function searchOne(query, { num = 30, tbs = '', location = '', gl = '', hl = '', apiKey = '' } = {}) {
  const body = { q: query, num };
  if (tbs) body.tbs = tbs;
  if (location) body.location = location;
  if (gl) body.gl = gl;
  if (hl) body.hl = hl;

  return requestJson(SEARCH_URL, body, { apiKey })
    .then(result => {
      const results = result?.results || [];
      return { query, count: results.length, results };
    })
    .catch(e => ({
      query, count: 0, results: [],
      error: e instanceof JinaAPIError ? e.message : String(e)
    }));
}

function parseArgs(argv) {
  const args = { queries: [], num: 30, tbs: '', location: '', gl: '', hl: '', maxWorkers: 5, output: null };
  let i = 0;
  while (i < argv.length) {
    switch (argv[i]) {
      case '--num': args.num = parseInt(argv[++i], 10) || 30; break;
      case '--tbs': args.tbs = argv[++i] || ''; break;
      case '--location': args.location = argv[++i] || ''; break;
      case '--gl': args.gl = argv[++i] || ''; break;
      case '--hl': args.hl = argv[++i] || ''; break;
      case '--max-workers': args.maxWorkers = parseInt(argv[++i], 10) || 5; break;
      case '--output': case '-o': args.output = argv[++i]; break;
      default: args.queries.push(argv[i]); break;
    }
    i++;
  }
  return args;
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error('用法: node search.mjs "query1" ["query2"] [--num N] [--tbs qdr:w] [--location X] [--gl cn] [--hl zh-cn] [-o file.json]');
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

  const options = { num: args.num, tbs: args.tbs, location: args.location, gl: args.gl, hl: args.hl, apiKey };

  // 分块并发，保持输入顺序
  const results = [];
  const maxWorkers = args.maxWorkers;
  for (let i = 0; i < args.queries.length; i += maxWorkers) {
    const chunk = args.queries.slice(i, i + maxWorkers);
    const chunkResults = await Promise.all(chunk.map(q => searchOne(q, options)));
    results.push(...chunkResults);
  }

  const output = { count: results.length, queries: results };
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

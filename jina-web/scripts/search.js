#!/usr/bin/env node
/**
 * 调用 Jina Search API 搜索网络，支持单个或多个关键词并发搜索。
 *
 * 用法:
 *   node scripts/search.js "Python 教程"
 *   node scripts/search.js "AI 新闻" --num 10 --tbs qdr:w
 *   node scripts/search.js "天气" --location Beijing --gl cn --hl zh-cn
 *   node scripts/search.js "Kubernetes" "Docker" "微服务"
 *   node scripts/search.js -o results.json "query1" "query2"
 */

'use strict';

var fs = require('fs');
var client = require('./client.js');
var getApiKey = client.getApiKey;
var requestJson = client.requestJson;

var SEARCH_URL = 'https://svip.jina.ai/';

function searchOne(query, options) {
  var num = (options && options.num) || 30;
  var tbs = (options && options.tbs) || '';
  var location = (options && options.location) || '';
  var gl = (options && options.gl) || '';
  var hl = (options && options.hl) || '';
  var apiKey = (options && options.apiKey) || '';

  var body = { q: query, num: num };
  if (tbs) body.tbs = tbs;
  if (location) body.location = location;
  if (gl) body.gl = gl;
  if (hl) body.hl = hl;

  return requestJson(SEARCH_URL, body, { apiKey: apiKey })
    .then(function (result) {
      var results = (result && result.results) || [];
      return { query: query, count: results.length, results: results };
    })
    .catch(function (e) {
      return {
        query: query, count: 0, results: [],
        error: e.isJinaAPIError ? e.message : String(e)
      };
    });
}

function parseArgs(argv) {
  var args = { queries: [], num: 30, tbs: '', location: '', gl: '', hl: '', maxWorkers: 5, output: null };
  var i = 0;
  while (i < argv.length) {
    switch (argv[i]) {
      case '--num': args.num = Math.min(Math.max(parseInt(argv[++i], 10) || 30, 1), 100); break;
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

function main() {
  var argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error('用法: node scripts/search.js "query1" ["query2"] [--num N] [--tbs qdr:w] [--location X] [--gl cn] [--hl zh-cn] [--max-workers N] [-o file.json]');
    process.exit(1);
  }

  var args = parseArgs(argv);

  if (args.queries.length === 0) {
    console.error('错误: 请提供至少一个搜索关键词');
    console.error('用法: node scripts/search.js "query1" ["query2"] [--num N] [--tbs qdr:w] [--location X] [--gl cn] [--hl zh-cn] [--max-workers N] [-o file.json]');
    process.exit(1);
  }

  var apiKey;
  try {
    apiKey = getApiKey();
  } catch (e) {
    console.error('错误: ' + e.message);
    process.exit(1);
  }

  var options = { num: args.num, tbs: args.tbs, location: args.location, gl: args.gl, hl: args.hl, apiKey: apiKey };
  var allResults = [];
  var maxWorkers = args.maxWorkers;
  var queries = args.queries;

  // 分块并发，保持输入顺序
  function processChunk(i) {
    if (i >= queries.length) {
      var output = { count: allResults.length, queries: allResults };
      var jsonStr = JSON.stringify(output, null, 2);
      if (args.output) {
        fs.writeFileSync(args.output, jsonStr, 'utf-8');
        console.log('已保存到 ' + args.output);
      } else {
        console.log(jsonStr);
      }
      return;
    }
    var chunk = queries.slice(i, i + maxWorkers);
    Promise.all(chunk.map(function (q) { return searchOne(q, options); }))
      .then(function (chunkResults) {
        allResults = allResults.concat(chunkResults);
        processChunk(i + maxWorkers);
      })
      .catch(function (e) {
        console.error('内部错误: ' + e.message);
        process.exit(1);
      });
  }

  processChunk(0);
}

main();

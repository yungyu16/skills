#!/usr/bin/env node
/**
 * 调用 Jina Reader API 读取网页/PDF 内容，支持单个或多个 URL 并发读取。
 *
 * 用法:
 *   node scripts/read.js https://example.com
 *   node scripts/read.js https://a.com https://b.com https://c.com
 *   node scripts/read.js --with-links https://example.com
 *   node scripts/read.js --with-images https://example.com
 *   node scripts/read.js --max-workers 3 -o output.json https://a.com https://b.com
 */

'use strict';

var fs = require('fs');
var client = require('./client.js');
var getApiKey = client.getApiKey;
var requestJson = client.requestJson;

var READER_URL = 'https://r.jina.ai/';

function readOne(url, options) {
  var withLinks = (options && options.withLinks) || false;
  var withImages = (options && options.withImages) || false;
  var apiKey = (options && options.apiKey) || '';

  try {
    var parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error();
  } catch (e) {
    return Promise.resolve({
      url: url, title: '', content: '', links: [], images: [],
      error: '无效 URL: ' + url
    });
  }

  var extraHeaders = { 'X-Md-Link-Style': 'discarded' };
  if (withLinks) extraHeaders['X-With-Links-Summary'] = 'all';
  if (withImages) extraHeaders['X-With-Images-Summary'] = 'true';
  else extraHeaders['X-Retain-Images'] = 'none';

  return requestJson(READER_URL, { url: url }, { apiKey: apiKey, extraHeaders: extraHeaders })
    .then(function (result) {
      var data = (result && result.data) || {};
      return {
        url: data.url || url,
        title: data.title || '',
        content: data.content || '',
        links: withLinks ? (data.links || []) : [],
        images: withImages ? (data.images || []) : [],
      };
    })
    .catch(function (e) {
      return {
        url: url, title: '', content: '', links: [], images: [],
        error: e.isJinaAPIError ? e.message : String(e)
      };
    });
}

function parseArgs(argv) {
  var args = { urls: [], withLinks: false, withImages: false, maxWorkers: 5, output: null };
  var i = 0;
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

function main() {
  var argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error('用法: node scripts/read.js <url1> [url2] ... [--with-links] [--with-images] [--max-workers N] [-o file.json]');
    process.exit(1);
  }

  var args = parseArgs(argv);

  if (args.urls.length === 0) {
    console.error('错误: 请提供至少一个 URL');
    console.error('用法: node scripts/read.js <url1> [url2] ... [--with-links] [--with-images] [--max-workers N] [-o file.json]');
    process.exit(1);
  }

  var apiKey;
  try {
    apiKey = getApiKey();
  } catch (e) {
    console.error('错误: ' + e.message);
    process.exit(1);
  }

  var options = { withLinks: args.withLinks, withImages: args.withImages, apiKey: apiKey };
  var allResults = [];
  var maxWorkers = args.maxWorkers;
  var urls = args.urls;

  // 分块并发，保持输入顺序
  function processChunk(i) {
    if (i >= urls.length) {
      var output = { count: allResults.length, results: allResults };
      var jsonStr = JSON.stringify(output, null, 2);
      if (args.output) {
        fs.writeFileSync(args.output, jsonStr, 'utf-8');
        console.log('已保存到 ' + args.output);
      } else {
        console.log(jsonStr);
      }
      return;
    }
    var chunk = urls.slice(i, i + maxWorkers);
    Promise.all(chunk.map(function (url) { return readOne(url, options); }))
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

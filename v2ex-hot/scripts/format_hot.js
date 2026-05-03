#!/usr/bin/env node
'use strict';
/**
 * Fetch and display V2EX hot topics by scraping the webpage.
 * 兼容 Node.js 12+（CommonJS + child_process）
 */

var childProcess = require('child_process');

var CURL_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// 简易 HTML 实体解码
function htmlUnescape(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, function (_, code) {
      return String.fromCharCode(code);
    })
    .replace(/&#x([0-9a-fA-F]+);/g, function (_, hex) {
      return String.fromCharCode(parseInt(hex, 16));
    })
    .replace(/&nbsp;/g, '\u00a0');
}

function decodeHtml(s) {
  return s ? htmlUnescape(s.trim()) : '';
}

function fetchHotTopics() {
  var url = 'https://www.v2ex.com/?tab=hot';

  var html;
  try {
    html = childProcess.execFileSync('curl', [
      '-s', '--connect-timeout', '10', '--max-time', '15',
      '-A', CURL_UA,
      url
    ], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  } catch (e) {
    html = (typeof e.stdout === 'string' ? e.stdout : '');
  }

  if (!html || html.indexOf('id="Tabs"') < 0) {
    console.log('获取 V2EX 热榜失败，请稍后重试。');
    console.log('也可直接访问：' + url);
    process.exit(1);
  }

  // 只解析主内容区（id="Tabs" 之后的话题列表）
  var afterTabs = html.slice(html.indexOf('id="Tabs"'));

  // 每个话题是一个顶层 <table>，包含 topic-link
  // 用栈匹配顶层 table，避免嵌套 </table> 提前截断
  var tables = [];
  var searchFrom = afterTabs.indexOf('<table');
  while (searchFrom !== -1) {
    var depth = 0;
    var i = searchFrom;
    var found = false;
    while (i < afterTabs.length) {
      if (afterTabs.slice(i, i + 6).toLowerCase() === '<table') {
        // 确认第7个字符是 >、空格、tab、换行或 /，排除 <table-custom> 等自定义标签
        var next = afterTabs[i + 6];
        if (next === '>' || next === ' ' || next === '/' || next === '\t' || next === '\n' || next === '\r') {
          depth++;
        }
        i += 6;
      } else if (afterTabs.slice(i, i + 8).toLowerCase() === '</table>') {
        if (depth > 0) depth--;
        i += 8;
        if (depth === 0) {
          tables.push(afterTabs.slice(searchFrom, i));
          searchFrom = afterTabs.indexOf('<table', i);
          found = true;
          break;
        }
      } else {
        i++;
      }
    }
    if (!found) break;
  }

  var topics = [];
  for (var t = 0; t < tables.length; t++) {
    var table = tables[t];
    if (table.indexOf('topic-link') < 0) continue;

    // 标题
    var titleMatch = table.match(/class="topic-link"[^>]*>([^<]+)<\/a>/);
    if (!titleMatch) continue;

    // URL
    var urlMatch = table.match(/href="(\/t\/\d+)/);
    var topicUrl = urlMatch ? 'https://www.v2ex.com' + urlMatch[1] : '';

    // 节点
    var nodeMatch = table.match(/class="node"[^>]*>([^<]+)<\/a>/);

    // 作者
    var authorMatch = table.match(/<strong><a href="\/member\/[^"]*">([^<]+)<\/a><\/strong>/);

    // 时间（title 属性值中含日期格式）
    // 时间（定位含日期格式的 title 属性，取 span 文本内容作为相对时间）
    var timeMatch = table.match(/<span title="\d{4}-\d{2}-\d{2}[^"]*">([^<]+)<\/span>/);

    // 回复数
    var replyMatch = table.match(/#reply(\d+)/);

    topics.push({
      title: decodeHtml(titleMatch[1]),
      node: decodeHtml(nodeMatch ? nodeMatch[1] : ''),
      author: decodeHtml(authorMatch ? authorMatch[1] : ''),
      time: decodeHtml(timeMatch ? timeMatch[1] : ''),
      replies: replyMatch ? replyMatch[1] : '0',
      url: topicUrl
    });
  }

  if (topics.length === 0) {
    console.log('未能解析到话题，可能页面结构已变更。');
    console.log('也可直接访问：' + url);
    process.exit(1);
  }

  var total = topics.length;
  console.log('V2EX 热榜（当前 ' + total + ' 条）');
  console.log();

  var maxShow = Math.min(total, 20);
  for (var i = 0; i < maxShow; i++) {
    var topic = topics[i];
    var metaParts = [];
    if (topic.author) metaParts.push('by ' + topic.author);
    metaParts.push(topic.replies + ' 条回复');
    if (topic.time) metaParts.push(topic.time);

    var meta = metaParts.join(' \u00b7 ');

    console.log((i + 1) + '. [' + topic.node + '] ' + topic.title);
    console.log('   ' + meta);
    console.log('   ' + topic.url);
    console.log();
  }

  if (total > 20) {
    console.log('还有 ' + (total - 20) + ' 条，未展示。');
  }
}

fetchHotTopics();
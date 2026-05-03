#!/usr/bin/env node
/**
 * Jina OpenAPI 客户端 — 共享的基础库。
 * 封装 Jina Reader API (r.jina.ai) 和 Search API (svip.jina.ai) 的 HTTP 调用。
 * 零第三方依赖，使用 Node.js 内置 fetch。
 */

'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');

var TOKEN_PATH = path.join(os.homedir(), '.config', 'jina-api', 'key');

function JinaAPIError(message) {
  this.name = 'JinaAPIError';
  this.message = message;
  this.isJinaAPIError = true;
  this.stack = (new Error(message)).stack;
}
JinaAPIError.prototype = Object.create(Error.prototype);
JinaAPIError.prototype.constructor = JinaAPIError;

function readPersistedToken() {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  try {
    return fs.readFileSync(TOKEN_PATH, 'utf-8').trim();
  } catch (e) {
    return null;
  }
}

function getApiKey() {
  if (process.env.JINA_API_KEY) return process.env.JINA_API_KEY;
  var fileKey = readPersistedToken();
  if (fileKey) return fileKey;

  throw new JinaAPIError(
    'NO_API_KEY: 未配置 Jina API Key。' +
    '引导用户输入 token，然后运行 node scripts/auth.js set <token> 进行验证和保存。' +
    '获取 Key: https://jina.ai/api-dashboard/'
  );
}

function requestJson(url, body, options) {
  var apiKey = (options && options.apiKey) || '';
  var extraHeaders = (options && options.extraHeaders) || {};
  var method = (options && options.method) || 'POST';
  var timeout = (options && options.timeout) || 60000;

  var headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = 'Bearer ' + apiKey;
  }
  Object.assign(headers, extraHeaders);

  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, timeout);

  return fetch(url, {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : null,
    signal: controller.signal,
  })
    .then(function (res) {
      if (!res.ok) {
        return res.text().then(function (errBody) {
          throw new JinaAPIError('HTTP ' + res.status + ': ' + errBody);
        });
      }
      return res.json();
    })
    .catch(function (e) {
      if (e.isJinaAPIError) throw e;
      if (e.name === 'AbortError') {
        throw new JinaAPIError('请求超时 (' + timeout + 'ms)');
      }
      throw new JinaAPIError('网络错误: ' + e.message);
    })
    .finally(function () {
      clearTimeout(timer);
    });
}

module.exports = { JinaAPIError: JinaAPIError, getApiKey: getApiKey, requestJson: requestJson };

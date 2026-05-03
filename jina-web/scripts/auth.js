#!/usr/bin/env node
/**
 * Jina API 认证管理脚本
 *
 * 功能：验证 API Token 并持久化保存到本地
 * 持久化位置：~/.config/jina-api/key
 *
 * 用法:
 *   node scripts/auth.js set jina_xxx          — 验证并保存 token
 *   node scripts/auth.js status                 — 检查认证状态
 *   node scripts/auth.js clear                  — 清除本地凭据
 */

'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');

var TOKEN_DIR = path.join(os.homedir(), '.config', 'jina-api');
var TOKEN_PATH = path.join(TOKEN_DIR, 'key');

function readToken() {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  try {
    return fs.readFileSync(TOKEN_PATH, 'utf-8').trim();
  } catch (e) {
    return null;
  }
}

function saveToken(token) {
  fs.mkdirSync(TOKEN_DIR, { recursive: true });
  fs.writeFileSync(TOKEN_PATH, token, 'utf-8');
}

function clearToken() {
  if (fs.existsSync(TOKEN_PATH)) {
    fs.unlinkSync(TOKEN_PATH);
  }
}

function validateToken(token) {
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, 30000);

  return fetch('https://r.jina.ai/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({ url: 'https://jina.ai' }),
    signal: controller.signal,
  })
    .then(function (response) {
      if (response.ok) {
        return { valid: true, message: 'Token 有效' };
      }
      if (response.status === 401) {
        return { valid: false, message: 'Token 无效（401）' };
      }
      if (response.status === 402) {
        return { valid: false, message: 'Token 配额已用完（402）' };
      }
      if (response.status === 429) {
        return { valid: true, message: 'Token 触发限流（429），认证有效但请稍后重试' };
      }
      return { valid: false, message: '验证失败: HTTP ' + response.status };
    })
    .catch(function (e) {
      if (e.name === 'AbortError') {
        return { valid: false, message: '验证超时（30s），请检查网络后重试' };
      }
      return { valid: false, message: '网络错误: ' + e.message };
    })
    .finally(function () {
      clearTimeout(timer);
    });
}

function getToken() {
  if (process.env.JINA_API_KEY) return process.env.JINA_API_KEY;
  return readToken();
}

// ---- CLI 入口 ----

function main() {
  var argv = process.argv.slice(2);
  var cmd = argv[0];
  var args = argv.slice(1);

  switch (cmd) {
    case 'set': {
      var token = args[0];
      if (!token) {
        console.error('用法: node scripts/auth.js set <token>');
        process.exit(1);
      }

      console.log('正在验证 token...');
      validateToken(token).then(function (result) {
        if (!result.valid) {
          console.error('[失败] ' + result.message);
          console.error('请检查 token 是否正确，或访问 https://jina.ai/api-dashboard/ 重新获取');
          process.exit(1);
        }

        saveToken(token);
        console.log('[成功] ' + result.message);
        console.log('Token 已保存到 ' + TOKEN_PATH);

        var masked = token.length > 9
          ? token.slice(0, 5) + '...' + token.slice(-4)
          : '***';
        console.log('当前 token: ' + masked);
      }).catch(function (e) {
        console.error('[失败] 验证出错: ' + e.message);
        process.exit(1);
      });
      break;
    }

    case 'status': {
      var envToken = process.env.JINA_API_KEY || null;
      var fileToken = readToken();
      var activeToken = envToken || fileToken;

      console.log('认证状态:');
      console.log('  环境变量 JINA_API_KEY: ' + (envToken ? '已设置（优先生效）' : '未设置'));
      console.log('  持久化文件 (' + TOKEN_PATH + '): ' + (fileToken ? '已设置' : '未设置'));

      if (activeToken) {
        console.log('\n正在验证当前生效的 token...');
        validateToken(activeToken).then(function (result) {
          console.log('  ' + (result.valid ? '[有效]' : '[无效]') + ' ' + result.message);
        }).catch(function (e) {
          console.error('  验证出错: ' + e.message);
        });
      } else {
        console.log('\n[警告] 未找到任何认证凭据');
        console.log('  请运行: node scripts/auth.js set <token>');
      }
      break;
    }

    case 'clear': {
      clearToken();
      console.log('已清除持久化凭据');
      console.log('如需使用认证，请重新运行: node scripts/auth.js set <token>');
      break;
    }

    case 'get': {
      // 内部使用：输出 token（给其他脚本调用）
      var t = getToken();
      if (t) {
        console.log(t);
      } else {
        process.exit(1);
      }
      break;
    }

    default: {
      console.log('Jina API 认证管理');
      console.log('');
      console.log('用法:');
      console.log('  node scripts/auth.js set <token>    验证并保存 token');
      console.log('  node scripts/auth.js status          检查认证状态');
      console.log('  node scripts/auth.js clear           清除本地凭据');
      console.log('');
      console.log('获取 API Key: https://jina.ai/api-dashboard/');
    }
  }
}

main();

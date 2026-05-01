#!/usr/bin/env node
/**
 * Jina API 认证管理脚本
 *
 * 功能：验证 API Token 并持久化保存到本地
 * 持久化位置：~/.config/jina-api/key
 *
 * 用法:
 *   node scripts/auth.mjs set jina_xxx          — 验证并保存 token
 *   node scripts/auth.mjs status                 — 检查认证状态
 *   node scripts/auth.mjs clear                  — 清除本地凭据
 */

import { readFileSync, writeFileSync, mkdirSync, unlinkSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const TOKEN_DIR = join(homedir(), '.config', 'jina-api');
const TOKEN_PATH = join(TOKEN_DIR, 'key');

/**
 * 读取持久化 token
 * @returns {string|null} token 或 null
 */
function readToken() {
  if (!existsSync(TOKEN_PATH)) return null;
  try {
    return readFileSync(TOKEN_PATH, 'utf-8').trim();
  } catch {
    return null;
  }
}

/**
 * 保存 token 到持久化位置
 * @param {string} token
 */
function saveToken(token) {
  mkdirSync(TOKEN_DIR, { recursive: true });
  writeFileSync(TOKEN_PATH, token, 'utf-8');
}

/**
 * 清除持久化 token
 */
function clearToken() {
  if (existsSync(TOKEN_PATH)) {
    unlinkSync(TOKEN_PATH);
  }
}

/**
 * 验证 token 是否有效
 * 通过调用 Reader API 读一个简单页面来验证
 * @param {string} token
 * @returns {Promise<{valid: boolean, message: string}>}
 */
async function validateToken(token) {
  try {
    const response = await fetch('https://r.jina.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ url: 'https://jina.ai' }),
    });

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
      return { valid: false, message: 'Token 触发限流（429），但认证配置成功' };
    }

    return { valid: false, message: `验证失败: HTTP ${response.status}` };
  } catch (e) {
    return { valid: false, message: `网络错误: ${e.message}` };
  }
}

/**
 * 获取 token：优先环境变量，其次持久化文件
 * @returns {string|null}
 */
function getToken() {
  if (process.env.JINA_API_KEY) return process.env.JINA_API_KEY;
  return readToken();
}

// ---- CLI 入口 ----

async function main() {
  const [cmd, ...args] = process.argv.slice(2);

  switch (cmd) {
    case 'set': {
      const token = args[0];
      if (!token) {
        console.error('用法: node scripts/auth.mjs set <token>');
        process.exit(1);
      }

      console.log('正在验证 token...');
      const result = await validateToken(token);

      if (!result.valid) {
        console.error(`[失败] ${result.message}`);
        console.error('请检查 token 是否正确，或访问 https://jina.ai/api-dashboard/ 重新获取');
        process.exit(1);
      }

      saveToken(token);
      console.log(`[成功] ${result.message}`);
      console.log(`Token 已保存到 ${TOKEN_PATH}`);

      const masked = token.slice(0, 5) + '...' + token.slice(-4);
      console.log(`当前 token: ${masked}`);
      break;
    }

    case 'status': {
      const fileToken = readToken();

      console.log('认证状态:');
      console.log(`  持久化文件 (${TOKEN_PATH}): ${fileToken ? '已设置' : '未设置'}`);

      if (fileToken) {
        console.log('\n正在验证当前生效的 token...');
        const result = await validateToken(fileToken);
        console.log(`  ${result.valid ? '[有效]' : '[无效]'} ${result.message}`);
      } else {
        console.log('\n[警告] 未找到任何认证凭据');
        console.log('  请运行: node scripts/auth.mjs set <token>');
      }
      break;
    }

    case 'clear': {
      clearToken();
      console.log('已清除持久化凭据');
      console.log('如需使用认证，请重新运行: node scripts/auth.mjs set <token>');
      break;
    }

    case 'get': {
      // 内部使用：输出 token（给其他脚本调用）
      const token = getToken();
      if (token) {
        console.log(token);
      } else {
        process.exit(1);
      }
      break;
    }

    default: {
      console.log('Jina API 认证管理');
      console.log('');
      console.log('用法:');
      console.log('  node scripts/auth.mjs set <token>    验证并保存 token');
      console.log('  node scripts/auth.mjs status          检查认证状态');
      console.log('  node scripts/auth.mjs clear           清除本地凭据');
      console.log('');
      console.log('获取 API Key: https://jina.ai/api-dashboard/');
    }
  }
}

main();
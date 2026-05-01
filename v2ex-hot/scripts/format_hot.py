#!/usr/bin/env python3
"""Fetch and display V2EX hot topics by scraping the webpage."""

import re
import subprocess
import sys
from html import unescape


def fetch_hot_topics():
    url = "https://www.v2ex.com/?tab=hot"
    result = subprocess.run(
        ["curl", "-s", "--connect-timeout", "10", "--max-time", "15", "-A",
         "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
         url],
        capture_output=True, text=True
    )
    if result.returncode != 0 or not result.stdout.strip():
        print("获取 V2EX 热榜失败，请稍后重试。")
        print("也可直接访问：https://www.v2ex.com/?tab=hot")
        sys.exit(1)

    html = result.stdout

    # 只解析主内容区（id="Tabs" 之后的话题列表）
    tabs_idx = html.find('id="Tabs"')
    if tabs_idx < 0:
        print("未能定位到话题区域，可能页面结构已变更。")
        print("也可直接访问：https://www.v2ex.com/?tab=hot")
        sys.exit(1)

    after_tabs = html[tabs_idx:]

    # 每个话题是一个 <table>...</table>，包含 topic-link
    tables = re.findall(r'<table[^>]*>.*?</table>', after_tabs, re.DOTALL)

    topics = []
    for table in tables:
        if 'topic-link' not in table:
            continue

        # 标题
        title_match = re.search(r'class="topic-link"[^>]*>([^<]+)</a>', table)
        if not title_match:
            continue
        title = unescape(title_match.group(1).strip())

        # URL
        url_match = re.search(r'href="(/t/\d+)', table)
        topic_url = "https://www.v2ex.com" + url_match.group(1) if url_match else ""

        # 节点
        node_match = re.search(r'class="node"[^>]*>([^<]+)</a>', table)
        node = unescape(node_match.group(1).strip()) if node_match else ""

        # 作者
        author_match = re.search(r'<strong><a href="/member/[^"]*">([^<]+)</a></strong>', table)
        author = unescape(author_match.group(1).strip()) if author_match else ""

        # 时间
        time_match = re.search(r'<span title="[^"]*">([^<]+)</span>', table)
        time_str = unescape(time_match.group(1).strip()) if time_match else ""

        # 回复数
        reply_match = re.search(r'#reply(\d+)', table)
        replies = reply_match.group(1) if reply_match else "0"

        topics.append({
            'title': title,
            'node': node,
            'author': author,
            'time': time_str,
            'replies': replies,
            'url': topic_url
        })

    if not topics:
        print("未能解析到话题，可能页面结构已变更。")
        print("也可直接访问：https://www.v2ex.com/?tab=hot")
        sys.exit(1)

    total = len(topics)
    print(f"V2EX 热榜（当前 {total} 条）")
    print("=" * 60)

    for i, topic in enumerate(topics[:20], 1):
        title = topic['title']
        node = topic['node']
        author = topic['author']
        replies = topic['replies']
        time_str = topic['time']
        url = topic['url']

        meta_parts = []
        if author:
            meta_parts.append(f"by {author}")
        meta_parts.append(f"{replies} 条回复")
        if time_str:
            meta_parts.append(time_str)

        meta = " · ".join(meta_parts)

        print(f"{i}. [{node}] {title}")
        print(f"   {meta}")
        print(f"   {url}")
        print()

    if total > 20:
        print(f"还有 {total - 20} 条，未展示。")


if __name__ == "__main__":
    fetch_hot_topics()

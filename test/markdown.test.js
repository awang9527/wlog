import test from "node:test";
import assert from "node:assert/strict";
import { parseMarkdown, renderInline, calculateReadingTime } from "../src/markdown.js";

test("parseMarkdown converts headings properly", () => {
  const md = "# 大标题\n## 二级标题\n### 三级标题";
  const html = parseMarkdown(md);
  assert.ok(html.includes("<h1 class=\"post-h1\">大标题</h1>"));
  assert.ok(html.includes("<h2 class=\"post-h2\">二级标题</h2>"));
  assert.ok(html.includes("<h3 class=\"post-h3\">三级标题</h3>"));
});

test("parseMarkdown handles code blocks and escapes content", () => {
  const md = "```javascript\nconst a = 1 < 2;\nconsole.log(a);\n```";
  const html = parseMarkdown(md);
  assert.ok(html.includes("<pre class=\"code-block\" data-lang=\"javascript\">"));
  assert.ok(html.includes("&lt; 2;"));
});

test("parseMarkdown renders lists and blockquotes", () => {
  const md = "> 这是引用金句\n\n- 第一项\n- 第二项";
  const html = parseMarkdown(md);
  assert.ok(html.includes("<blockquote class=\"post-quote\">这是引用金句</blockquote>"));
  assert.ok(html.includes("<ul class=\"post-list\">"));
  assert.ok(html.includes("<li>第一项</li>"));
  assert.ok(html.includes("<li>第二项</li>"));
});

test("renderInline converts bold, italic, code, and links", () => {
  const text = "**粗体** 与 *斜体* 与 `code` 与 [首页](https://example.com)";
  const rendered = renderInline(text);
  assert.ok(rendered.includes("<strong>粗体</strong>"));
  assert.ok(rendered.includes("<em>斜体</em>"));
  assert.ok(rendered.includes("<code class=\"inline-code\">code</code>"));
  assert.ok(rendered.includes("<a href=\"https://example.com\""));
});

test("calculateReadingTime estimates reasonable minutes", () => {
  assert.equal(calculateReadingTime(""), 1);
  assert.equal(calculateReadingTime("短文本"), 1);
  // 700 chars should be ~2 minutes
  const longText = "测试".repeat(350);
  assert.equal(calculateReadingTime(longText), 2);
});

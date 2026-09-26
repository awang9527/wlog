import test from "node:test";
import assert from "node:assert/strict";
import { BlogStore, DEFAULT_POSTS } from "../src/blogStore.js";

test("BlogStore initializes with default posts", () => {
  const store = new BlogStore();
  const all = store.getAll();
  assert.equal(all.length, DEFAULT_POSTS.length);
  assert.equal(all[0].id, "post_design_curve");
});

test("BlogStore creates a new post", () => {
  const store = new BlogStore();
  const initialCount = store.getAll().length;

  const newPost = store.create({
    title: "测试新博文",
    excerpt: "这是一段摘要",
    content: "# 内容标题\n正文内容...",
    tags: ["生活", "摄影"],
    coverEmoji: "📷",
    author: "小明"
  });

  assert.ok(newPost.id);
  assert.equal(newPost.title, "测试新博文");
  assert.equal(store.getAll().length, initialCount + 1);
});

test("BlogStore throws error when creating post without title", () => {
  const store = new BlogStore();
  assert.throws(() => {
    store.create({ title: "   " });
  }, /文章标题不能为空/);
});

test("BlogStore searches and filters by keyword and tag", () => {
  const store = new BlogStore();
  
  // Search keyword
  const searchResult = store.search("圆角");
  assert.ok(searchResult.length >= 1);
  assert.ok(searchResult[0].title.includes("圆角"));

  // Search by tag
  const tagResult = store.search("", "生产力");
  assert.ok(tagResult.length >= 1);
  assert.ok(tagResult.some(p => p.tags.includes("生产力")));

  // Non-matching query
  const emptyResult = store.search("一段绝对不存在的稀有关键词xyz");
  assert.equal(emptyResult.length, 0);
});

test("BlogStore toggles like count and deletes post", () => {
  const store = new BlogStore();
  const post = store.getAll()[0];
  const initialLikes = post.likes || 0;

  const newLikes = store.toggleLike(post.id);
  assert.equal(newLikes, initialLikes + 1);

  const deleted = store.delete(post.id);
  assert.equal(deleted, true);
  assert.equal(store.getById(post.id), null);
});

test("BlogStore exports and imports data cleanly", () => {
  const store = new BlogStore();
  const exported = store.exportData();
  assert.ok(typeof exported === "string");

  const imported = store.importData(exported);
  assert.equal(imported, true);
});

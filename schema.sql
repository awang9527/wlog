-- Aura Blog Database Schema for Cloudflare D1
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  coverEmoji TEXT DEFAULT '📝',
  author TEXT DEFAULT '我',
  tags TEXT DEFAULT '["随笔"]',
  date TEXT,
  likes INTEGER DEFAULT 0
);

-- Insert initial sample or clean post
INSERT OR IGNORE INTO posts (id, title, excerpt, content, coverEmoji, author, tags, date, likes)
VALUES (
  'post_init_1',
  '欢迎来到我的线上博客',
  '这是通过 Cloudflare D1 云数据库发布的第一篇博文。',
  '# 欢迎来到我的在线博客\n\n现在这个博客已经成功连接了云端数据库。\n\n- 每一篇新发布的文章都会直接存入云端数据库；\n- 全世界任何一台设备打开此网站，都能立即看到最新内容；\n- 只有输入正确的管理员密码才能发布或删除文章。',
  '🌿',
  'Lsi77',
  '["生活", "随笔"]',
  '2026-09-26',
  1
);

/**
 * Initial sample posts demonstrating rich formatting and rounded aesthetic
 */
export const DEFAULT_POSTS = [
  {
    "id": "post_design_curve",
    "title": "圆角设计的温润美学：为什么现代 UI 都在削去棱角？",
    "excerpt": "从 Apple 的连续曲率到现代界面的大圆角风潮，圆角不仅是一种视觉风格，更是一种降低认知防御、传递亲和力的人性化设计心理学。",
    "coverEmoji": "🎨",
    "author": "晨风",
    "tags": [
      "设计美学",
      "UI/UX",
      "思考"
    ],
    "date": "2026-09-26",
    "likes": 18,
    "content": "# 圆角设计的温润美学\n\n在我们每天触碰的手机、笔记本和 Web 应用中，不知你是否发现：界面的棱角正在肉眼可见地变圆。\n\n从早期的像素硬边，到拟物化时代的微圆角（4px ~ 6px），再到如今主流操作系统中常见的 **16px、24px 甚至药丸形圆角**，设计的触觉正在发生深刻的转变。\n\n> “在现实世界中，几乎没有绝对锋利的 90 度直角。大自然的鹅卵石、水滴、细胞都是圆润的，大脑对圆角有着天然的安全感。”\n\n---\n\n## 为什么我们本能地喜爱圆角？\n\n### 1. 神经科学与威胁规避\n人类对锐利的尖角有着本能的警戒反应。在认知心理学中，尖锐的物体更容易激发大脑边缘系统中的危险警报；而平滑、无锐角的曲线则会传递出“安全、易接触、无侵略性”的心理暗号。\n\n### 2. 视觉焦点的自然内向汇聚\n直角的视线会向外延伸发散，而圆角的弧度会把使用者的视线柔和地引向卡片内部的核心内容：\n- **直角卡片**：视线被引导向四个对角尖端，形成张力；\n- **圆角卡片**：弧线形成包裹感，视线自然聚焦在正文区域。\n\n### 3. 微交互与触摸时代的到来\n在移动端时代，手指滑动与点击取代了鼠标指针的绝对精度。大圆角按钮不仅视觉上更加饱满舒适，也给予用户更宽容的触控反馈体验。\n\n```css\n/* 经典现代圆角卡片样式 */\n.curved-card {\n  border-radius: 20px;\n  background: var(--bg-card);\n  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);\n  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);\n}\n```\n\n---\n\n## 极简不是简陋，而是克制的丰盈\n\n在今天这个信息过载的时代，圆角设计搭配克制的留白与柔和的色彩，就像喧嚣数字世界中的一处静室。愿你的每次记录与阅读，都能体会到这种温润的平静。"
  },
  {
    "id": "post_mindfulness",
    "title": "极简工作流：在数字噪音中找回深度心流",
    "excerpt": "工具越堆越多，输出却越来越少？聊聊如何通过精简工具链、剥离非必要依赖，搭建一套轻盈、自律且持久的本地创作流。",
    "coverEmoji": "🌿",
    "author": "林深",
    "tags": [
      "思考",
      "生产力",
      "生活"
    ],
    "date": "2026-09-24",
    "likes": 12,
    "content": "# 极简工作流：在数字噪音中找回深度心流\n\n你是否有过这样的体验：\n想写一篇文章，先花了一小时选主题、配置数据库、挑选插件与字体，最后精疲力竭，文章却一个字没动。\n\n这就是典型的 **“工具陷阱”** ——我们误把打磨工具的过程当成了创造本身。\n\n---\n\n## 我的极简三原则\n\n### 1. 本地优先 (Local-First)\n将数据的所有权留在自己的电脑上。不依赖云端账户，不担心服务器宕机，没有网络时依然随开随写。纯粹的 Markdown 与轻量本地存储，永远是最稳固的资产。\n\n### 2. 零冗余依赖\n如无必要，勿增实体。一个简单的纯前端应用，不需要安装几百兆的第三方依赖包，干净、轻快、瞬间加载。\n\n### 3. 一次只做一件事\n- 写作时：关闭一切浮动通知与侧边栏，只有白纸与黑字；\n- 整理时：通过清晰的标签分类，而非建立无限层级的文件夹。\n\n> 真正持久的高效，来自于内心的平静，而非繁琐系统的堆砌。"
  },
  {
    "id": "post_dev_notes",
    "title": "从零构思轻量博客：基于 Codex 的敏捷设计实录",
    "excerpt": "用原生技术栈结合现代前端设计规范，完整记录如何从需求沟通到高质量实现一个纯本地、免部署的现代化个人博客。",
    "coverEmoji": "💻",
    "author": "Codex",
    "tags": [
      "技术",
      "Codex",
      "Web开发"
    ],
    "date": "2026-09-26",
    "likes": 25,
    "content": "# 从零构思轻量博客：基于 Codex 的敏捷设计实录\n\n构建一个好用的本地个人博客，并不一定需要复杂的后端框架或重型 CMS。\n\n在本次实践中，我们确立了几个核心目标：\n1. **视觉风格**：简约圆角 UI，柔和无边框感卡片，支持日间/夜间明暗主题切换；\n2. **纯原生与零外部依赖**：直接在浏览器双击即可运行，无需预装任何服务；\n3. **内容体验**：支持轻量 Markdown 格式化、即时字数统计、预估阅读时间与即时搜索。\n\n---\n\n## 核心架构设计\n\n```text\n[ UI 层: index.html + style.css ]\n             │\n             ▼\n[ 控制层: app.js ] ──► [ 数据层: blogStore.js ] ──► localStorage\n             │\n             ▼\n[ 工具层: markdown.js ] (自研安全解析器)\n```\n\n通过将数据存储与解析逻辑独立为纯 JS 模块，我们能够为其编写严格的自动化测试用例，确保无论文章多长、符号多复杂，都不会发生脚本崩溃或页面异常。"
  }
];

const STORAGE_KEY = "zen_blog_posts_v1";

export class BlogStore {
  constructor(initialData = null) {
    this.posts = [];
    if (initialData && Array.isArray(initialData)) {
      this.posts = [...initialData];
    } else {
      this.load();
    }
  }

  load() {
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.posts = parsed;
            return;
          }
        }
      }
    } catch {
      // fallback
    }
    this.posts = JSON.parse(JSON.stringify(DEFAULT_POSTS));
  }

  save() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.posts));
      }
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }

  getAll() {
    return [...this.posts];
  }

  getById(id) {
    return this.posts.find(p => p.id === id) || null;
  }

  create({ title, excerpt, content, tags, coverEmoji, author }) {
    const trimmedTitle = (title || "").trim();
    if (!trimmedTitle) {
      throw new Error("文章标题不能为空");
    }

    const newPost = {
      id: "post_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      title: trimmedTitle,
      excerpt: (excerpt || "").trim() || trimmedTitle,
      content: content || "",
      coverEmoji: coverEmoji || "📝",
      author: author || "我",
      tags: Array.isArray(tags) ? tags.filter(Boolean) : ["随笔"],
      date: new Date().toISOString().split("T")[0],
      likes: 0,
    };

    this.posts.unshift(newPost);
    this.save();
    return newPost;
  }

  update(id, updates) {
    const post = this.getById(id);
    if (!post) return null;

    if (updates.title !== undefined) post.title = updates.title.trim();
    if (updates.excerpt !== undefined) post.excerpt = updates.excerpt.trim();
    if (updates.content !== undefined) post.content = updates.content;
    if (updates.tags !== undefined) post.tags = Array.isArray(updates.tags) ? updates.tags : post.tags;
    if (updates.coverEmoji !== undefined) post.coverEmoji = updates.coverEmoji;
    if (updates.author !== undefined) post.author = updates.author;

    this.save();
    return post;
  }

  delete(id) {
    const prevLen = this.posts.length;
    this.posts = this.posts.filter(p => p.id !== id);
    if (this.posts.length < prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  toggleLike(id) {
    const post = this.getById(id);
    if (!post) return null;
    post.likes = (post.likes || 0) + 1;
    this.save();
    return post.likes;
  }

  getAllTags() {
    const set = new Set();
    this.posts.forEach(p => {
      (p.tags || []).forEach(t => set.add(t));
    });
    return Array.from(set);
  }

  search(query = "", tagFilter = "") {
    const q = (query || "").toLowerCase().trim();
    const tag = (tagFilter || "").trim();

    return this.posts.filter(p => {
      const matchTag = !tag || (p.tags && p.tags.includes(tag));
      if (!matchTag) return false;

      if (!q) return true;
      const matchTitle = (p.title || "").toLowerCase().includes(q);
      const matchExcerpt = (p.excerpt || "").toLowerCase().includes(q);
      const matchContent = (p.content || "").toLowerCase().includes(q);
      return matchTitle || matchExcerpt || matchContent;
    });
  }

  exportData() {
    return JSON.stringify(this.posts, null, 2);
  }

  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        this.posts = parsed;
        this.save();
        return true;
      }
    } catch {
      // invalid json
    }
    return false;
  }
}

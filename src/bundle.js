(() => {
// --- markdown.js ---
/**
 * Simple, safe markdown to HTML parser for the blog
 */

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Convert markdown string to clean HTML
 * @param {string} md 
 * @returns {string}
 */
function parseMarkdown(md) {
  if (!md || typeof md !== "string") return "";

  // Split into lines
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const htmlOut = [];
  let inCodeBlock = false;
  let codeBlockLang = "";
  let codeBlockLines = [];
  let inList = false;
  let listType = null; // "ul" or "ol"

  function closeList() {
    if (inList) {
      htmlOut.push(`</${listType}>`);
      inList = false;
      listType = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    // Check code blocks
    if (rawLine.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        htmlOut.push(`<pre class="code-block" data-lang="${escapeHtml(codeBlockLang)}"><code>${escapeHtml(codeBlockLines.join("\n"))}</code></pre>`);
        inCodeBlock = false;
        codeBlockLines = [];
        codeBlockLang = "";
      } else {
        // Start code block
        closeList();
        inCodeBlock = true;
        codeBlockLang = rawLine.trim().slice(3).trim();
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    const trimmed = rawLine.trim();

    // Blank line
    if (!trimmed) {
      closeList();
      continue;
    }

    // Horizontal Rule
    if (/^(---|\*\*\*|___)$/.test(trimmed)) {
      closeList();
      htmlOut.push("<hr class=\"post-divider\" />");
      continue;
    }

    // Headings
    if (trimmed.startsWith("#### ")) {
      closeList();
      htmlOut.push(`<h4 class="post-h4">${renderInline(trimmed.slice(5))}</h4>`);
      continue;
    }
    if (trimmed.startsWith("### ")) {
      closeList();
      htmlOut.push(`<h3 class="post-h3">${renderInline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      closeList();
      htmlOut.push(`<h2 class="post-h2">${renderInline(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      closeList();
      htmlOut.push(`<h1 class="post-h1">${renderInline(trimmed.slice(2))}</h1>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      closeList();
      htmlOut.push(`<blockquote class="post-quote">${renderInline(trimmed.slice(2))}</blockquote>`);
      continue;
    }

    // Unordered List
    if (/^[\-\+\*]\s+/.test(trimmed)) {
      if (!inList || listType !== "ul") {
        closeList();
        htmlOut.push("<ul class=\"post-list\">");
        inList = true;
        listType = "ul";
      }
      const content = trimmed.replace(/^[\-\+\*]\s+/, "");
      htmlOut.push(`<li>${renderInline(content)}</li>`);
      continue;
    }

    // Ordered List
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (olMatch) {
      if (!inList || listType !== "ol") {
        closeList();
        htmlOut.push("<ol class=\"post-olist\">");
        inList = true;
        listType = "ol";
      }
      htmlOut.push(`<li>${renderInline(olMatch[2])}</li>`);
      continue;
    }

    // Normal Paragraph
    closeList();
    htmlOut.push(`<p class="post-p">${renderInline(trimmed)}</p>`);
  }

  closeList();
  if (inCodeBlock) {
    htmlOut.push(`<pre class="code-block"><code>${escapeHtml(codeBlockLines.join("\n"))}</code></pre>`);
  }

  return htmlOut.join("\n");
}

/**
 * Inline markdown formatting (bold, italic, code, links, images)
 */
function renderInline(text) {
  let s = escapeHtml(text);

  // Images: ![alt](url)
  s = s.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, `<img src="$2" alt="$1" class="post-inline-img" />`);

  // Links: [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, `<a href="$2" target="_blank" rel="noopener" class="post-link">$1</a>`);

  // Inline Code: `code`
  s = s.replace(/`([^`]+)`/g, `<code class="inline-code">$1</code>`);

  // Bold: **text**
  s = s.replace(/\*\*([^\*]+)\*\*/g, `<strong>$1</strong>`);

  // Italic: *text*
  s = s.replace(/\*([^\*]+)\*/g, `<em>$1</em>`);

  return s;
}

/**
 * Estimate reading time in minutes based on Chinese and English character counts
 */
function calculateReadingTime(content) {
  if (!content) return 1;
  const clean = content.replace(/\s+/g, "");
  const chars = clean.length;
  // Average reading speed: ~350 chars per minute
  const mins = Math.ceil(chars / 350);
  return Math.max(1, mins);
}


// --- blogStore.js ---
/**
 * Initial sample posts demonstrating rich formatting and rounded aesthetic
 */
const DEFAULT_POSTS = [
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

class BlogStore {
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


// --- app.js ---



// Initialize Data Store
const store = new BlogStore();

// App State
let currentTag = "";
let currentSearch = "";
let activePostId = null;

// Theme Handling
const STORAGE_THEME_KEY = "aura_blog_theme_v1";
const htmlEl = document.documentElement;
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeIcon = themeToggleBtn.querySelector(".theme-icon");

function initTheme() {
  const saved = localStorage.getItem(STORAGE_THEME_KEY);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = saved || (prefersDark ? "dark" : "light");
  setTheme(initialTheme);
}

function setTheme(theme) {
  htmlEl.dataset.theme = theme;
  themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem(STORAGE_THEME_KEY, theme);
}

themeToggleBtn.addEventListener("click", () => {
  const current = htmlEl.dataset.theme;
  setTheme(current === "dark" ? "light" : "dark");
});

// DOM Elements
const feedView = document.getElementById("feedView");
const readerView = document.getElementById("readerView");
const heroBanner = document.getElementById("heroBanner");
const homeLogo = document.getElementById("homeLogo");
const postsGrid = document.getElementById("postsGrid");
const emptyPostsState = document.getElementById("emptyPostsState");
const tagFilterBar = document.getElementById("tagFilterBar");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const progressBar = document.getElementById("progressBar");

// Reader Elements
const backToFeedBtn = document.getElementById("backToFeedBtn");
const readerTitle = document.getElementById("readerTitle");
const readerEmoji = document.getElementById("readerEmoji");
const readerAuthor = document.getElementById("readerAuthor");
const readerDate = document.getElementById("readerDate");
const readerReadTime = document.getElementById("readerReadTime");
const readerTags = document.getElementById("readerTags");
const readerBody = document.getElementById("readerBody");
const readerLikeBtn = document.getElementById("readerLikeBtn");
const readerLikeIcon = document.getElementById("readerLikeIcon");
const readerLikeCount = document.getElementById("readerLikeCount");
const readerEditBtn = document.getElementById("readerEditBtn");
const readerDeleteBtn = document.getElementById("readerDeleteBtn");

// Modal Elements
const editorModal = document.getElementById("editorModal");
const modalTitleText = document.getElementById("modalTitleText");
const newPostBtn = document.getElementById("newPostBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const postEditorForm = document.getElementById("postEditorForm");
const editPostId = document.getElementById("editPostId");
const postEmojiInput = document.getElementById("postEmojiInput");
const postTitleInput = document.getElementById("postTitleInput");
const postTagsInput = document.getElementById("postTagsInput");
const postAuthorInput = document.getElementById("postAuthorInput");
const postExcerptInput = document.getElementById("postExcerptInput");
const postContentInput = document.getElementById("postContentInput");
const tabWriteBtn = document.getElementById("tabWriteBtn");
const tabPreviewBtn = document.getElementById("tabPreviewBtn");
const editorPreviewBox = document.getElementById("editorPreviewBox");

// Data Backup Elements
const exportDataBtn = document.getElementById("exportDataBtn");
const importDataBtn = document.getElementById("importDataBtn");
const importFileInput = document.getElementById("importFileInput");

// --- View Switching ---
function showFeedView() {
  activePostId = null;
  readerView.style.display = "none";
  feedView.style.display = "block";
  if (heroBanner) heroBanner.style.display = "flex";
  progressBar.style.width = "0%";
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderPostsGrid();
}

function showReaderView(postId) {
  const post = store.getById(postId);
  if (!post) return;

  activePostId = postId;
  feedView.style.display = "none";
  if (heroBanner) heroBanner.style.display = "none";
  readerView.style.display = "flex";

  // Fill content
  readerTitle.textContent = post.title;
  readerEmoji.textContent = post.coverEmoji || "📝";
  readerAuthor.textContent = post.author || "我";
  readerDate.textContent = post.date || "";
  readerLikeCount.textContent = post.likes || 0;

  const readTime = calculateReadingTime(post.content);
  readerReadTime.textContent = `⏱️ ${readTime} 分钟阅读`;

  // Tags
  readerTags.innerHTML = (post.tags || []).map(t => `<span class="tag-pill active mini">${escapeHtml(t)}</span>`).join("");

  // Body HTML
  readerBody.innerHTML = parseMarkdown(post.content || "");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Reading Progress on Scroll
window.addEventListener("scroll", () => {
  if (activePostId && readerView.style.display !== "none") {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }
});

// --- Render Feed ---
function renderTagsBar() {
  const tags = store.getAllTags();
  const pillsHtml = [
    `<button class="tag-pill ${currentTag === "" ? "active" : ""}" data-tag="">全部文章</button>`,
    ...tags.map(t => `<button class="tag-pill ${currentTag === t ? "active" : ""}" data-tag="${escapeHtml(t)}">${escapeHtml(t)}</button>`)
  ].join("");

  tagFilterBar.innerHTML = pillsHtml;
}

function renderPostsGrid() {
  const filtered = store.search(currentSearch, currentTag);
  postsGrid.innerHTML = "";

  if (filtered.length === 0) {
    emptyPostsState.style.display = "block";
    return;
  }
  emptyPostsState.style.display = "none";

  filtered.forEach(post => {
    const card = document.createElement("article");
    card.className = "post-card";
    card.dataset.id = post.id;

    const readTime = calculateReadingTime(post.content);
    const tagsHtml = (post.tags || []).slice(0, 3).map(t => `<span class="mini-tag">${escapeHtml(t)}</span>`).join("");

    card.innerHTML = `
      <div>
        <div class="post-card-top">
          <div class="card-emoji-wrap">${post.coverEmoji || "📝"}</div>
          <span class="card-date">${post.date || ""}</span>
        </div>
        <h2 class="card-title">${escapeHtml(post.title)}</h2>
        <p class="card-excerpt">${escapeHtml(post.excerpt || "")}</p>
      </div>

      <div class="post-card-bottom">
        <div class="card-tags">${tagsHtml}</div>
        <div class="card-stats">
          <span>⏱️ ${readTime}m</span>
          <span>🤍 ${post.likes || 0}</span>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      showReaderView(post.id);
    });

    postsGrid.appendChild(card);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// --- Event Listeners ---
homeLogo.addEventListener("click", (e) => {
  e.preventDefault();
  currentTag = "";
  currentSearch = "";
  searchInput.value = "";
  clearSearchBtn.style.display = "none";
  renderTagsBar();
  showFeedView();
});

tagFilterBar.addEventListener("click", (e) => {
  if (e.target.classList.contains("tag-pill")) {
    currentTag = e.target.dataset.tag || "";
    renderTagsBar();
    renderPostsGrid();
  }
});

searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value.trim();
  clearSearchBtn.style.display = currentSearch ? "block" : "none";
  renderPostsGrid();
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  currentSearch = "";
  clearSearchBtn.style.display = "none";
  renderPostsGrid();
  searchInput.focus();
});

backToFeedBtn.addEventListener("click", () => {
  showFeedView();
});

// Reader Actions
readerLikeBtn.addEventListener("click", () => {
  if (!activePostId) return;
  const newLikes = store.toggleLike(activePostId);
  readerLikeCount.textContent = newLikes;
  readerLikeIcon.textContent = "❤️";
});

readerDeleteBtn.addEventListener("click", () => {
  if (!activePostId) return;
  if (confirm("确定要删除这篇文章吗？此操作无法撤销。")) {
    store.delete(activePostId);
    renderTagsBar();
    showFeedView();
  }
});

readerEditBtn.addEventListener("click", () => {
  if (!activePostId) return;
  openEditorModal(activePostId);
});

// --- Modal Editor Logic ---
function openEditorModal(postId = null) {
  postEditorForm.reset();
  switchEditorTab("write");

  if (postId) {
    const post = store.getById(postId);
    if (!post) return;
    modalTitleText.textContent = "编辑文章";
    editPostId.value = post.id;
    postEmojiInput.value = post.coverEmoji || "📝";
    postTitleInput.value = post.title;
    postTagsInput.value = (post.tags || []).join(", ");
    postAuthorInput.value = post.author || "我";
    postExcerptInput.value = post.excerpt || "";
    postContentInput.value = post.content || "";
  } else {
    modalTitleText.textContent = "撰写新文章";
    editPostId.value = "";
    postEmojiInput.value = "📝";
    postAuthorInput.value = "我";
  }

  editorModal.style.display = "flex";
  postTitleInput.focus();
}

function closeEditorModal() {
  editorModal.style.display = "none";
}

newPostBtn.addEventListener("click", () => {
  openEditorModal(null);
});

closeModalBtn.addEventListener("click", closeEditorModal);
cancelModalBtn.addEventListener("click", closeEditorModal);

editorModal.addEventListener("click", (e) => {
  if (e.target === editorModal) closeEditorModal();
});

function switchEditorTab(tab) {
  if (tab === "preview") {
    tabWriteBtn.classList.remove("active");
    tabPreviewBtn.classList.add("active");
    postContentInput.style.display = "none";
    editorPreviewBox.style.display = "block";
    editorPreviewBox.innerHTML = parseMarkdown(postContentInput.value || "*暂无正文内容*");
  } else {
    tabPreviewBtn.classList.remove("active");
    tabWriteBtn.classList.add("active");
    editorPreviewBox.style.display = "none";
    postContentInput.style.display = "block";
  }
}

tabWriteBtn.addEventListener("click", () => switchEditorTab("write"));
tabPreviewBtn.addEventListener("click", () => switchEditorTab("preview"));

postEditorForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = editPostId.value;
  const title = postTitleInput.value.trim();
  const coverEmoji = postEmojiInput.value.trim() || "📝";
  const author = postAuthorInput.value.trim() || "我";
  const excerpt = postExcerptInput.value.trim();
  const content = postContentInput.value;
  const rawTags = postTagsInput.value.split(/[,，]/).map(t => t.trim()).filter(Boolean);
  const tags = rawTags.length > 0 ? rawTags : ["随笔"];

  if (!title) return;

  if (id) {
    store.update(id, { title, coverEmoji, author, excerpt, content, tags });
  } else {
    store.create({ title, coverEmoji, author, excerpt, content, tags });
  }

  closeEditorModal();
  renderTagsBar();

  if (activePostId && activePostId === id) {
    showReaderView(id);
  } else {
    showFeedView();
  }
});

// --- Data Export & Import ---
if (exportDataBtn) exportDataBtn.addEventListener("click", () => {
  const jsonStr = store.exportData();
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `aura_blog_backup_${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

if (importDataBtn) importDataBtn.addEventListener("click", () => {
  importFileInput.click();
});

if (importFileInput) importFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const ok = store.importData(event.target.result);
    if (ok) {
      alert("🎉 数据导入成功！");
      renderTagsBar();
      showFeedView();
    } else {
      alert("❌ 导入失败，请检查是否为有效的备份 JSON 文件。");
    }
    importFileInput.value = "";
  };
  reader.readAsText(file);
});

// --- Initialization ---
initTheme();
renderTagsBar();
renderPostsGrid();

})();
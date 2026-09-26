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
const DEFAULT_POSTS = [
  {
    id: "post_1",
    title: "wwwwwwww",
    excerpt: "wwwwwwww",
    content: "# wwwwwwww\n\nwwwwwwww",
    coverEmoji: "📝",
    author: "Lsi77",
    tags: ["随笔"],
    date: new Date().toISOString().split("T")[0],
    likes: 0
  }
];

const STORAGE_KEY = "zen_blog_posts_v1";
const ADMIN_PASS_KEY = "aura_blog_admin_pass_v1";

class BlogStore {
  constructor(initialData = null) {
    this.posts = [];
    this.isCloudConnected = false;
    if (initialData && Array.isArray(initialData)) {
      this.posts = [...initialData];
    } else {
      this.load();
    }
  }

  getSavedPassword() {
    try {
      return localStorage.getItem(ADMIN_PASS_KEY) || "";
    } catch {
      return "";
    }
  }

  savePassword(pass) {
    try {
      localStorage.setItem(ADMIN_PASS_KEY, pass);
    } catch {}
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
    } catch {}
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

  // --- Cloud Sync API Methods ---
  async syncFromCloud() {
    try {
      const res = await fetch("/api/posts");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          this.posts = data;
          this.isCloudConnected = true;
          this.save();
          return { success: true, posts: this.posts };
        }
      }
    } catch (err) {
      // offline or not deployed yet
    }
    return { success: false, posts: this.posts };
  }

  async savePostOnline(postData, password) {
    // If running on cloud
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify(postData)
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "发布失败，请检查密码");
      }

      this.savePassword(password);
      await this.syncFromCloud();
      return json.post;
    } catch (err) {
      if (err.message && err.message.includes("密码")) {
        throw err;
      }
      // If API unavailable (e.g. local preview), fallback to local storage
      const localPost = this.createLocal(postData);
      return localPost;
    }
  }

  async deletePostOnline(id, password) {
    try {
      const res = await fetch(`/api/posts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": password
        }
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "删除失败，请检查密码");
      }
      this.savePassword(password);
      await this.syncFromCloud();
      return true;
    } catch (err) {
      if (err.message && err.message.includes("密码")) {
        throw err;
      }
      return this.deleteLocal(id);
    }
  }

  async likePostOnline(id) {
    try {
      const res = await fetch("/api/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        const target = this.getById(id);
        if (target) {
          target.likes = data.likes;
          this.save();
        }
        return data.likes;
      }
    } catch {}

    // Fallback local like
    const post = this.getById(id);
    if (!post) return 0;
    post.likes = (post.likes || 0) + 1;
    this.save();
    return post.likes;
  }

  // Local fallbacks
  createLocal({ title, excerpt, content, tags, coverEmoji, author }) {
    const trimmedTitle = (title || "").trim();
    if (!trimmedTitle) throw new Error("文章标题不能为空");

    const newPost = {
      id: "post_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      title: trimmedTitle,
      excerpt: (excerpt || "").trim() || trimmedTitle,
      content: content || "",
      coverEmoji: coverEmoji || "📝",
      author: author || "Lsi77",
      tags: Array.isArray(tags) ? tags.filter(Boolean) : ["随笔"],
      date: new Date().toISOString().split("T")[0],
      likes: 0,
    };
    this.posts.unshift(newPost);
    this.save();
    return newPost;
  }

  deleteLocal(id) {
    const prev = this.posts.length;
    this.posts = this.posts.filter(p => p.id !== id);
    if (this.posts.length < prev) {
      this.save();
      return true;
    }
    return false;
  }

  
  create(data) {
    return this.createLocal(data);
  }

  delete(id) {
    return this.deleteLocal(id);
  }

  toggleLike(id) {
    const post = this.getById(id);
    if (!post) return 0;
    post.likes = (post.likes || 0) + 1;
    this.save();
    return post.likes;
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
    } catch {}
    return false;
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
const postAdminPasswordInput = document.getElementById("postAdminPasswordInput");
const tabWriteBtn = document.getElementById("tabWriteBtn");
const tabPreviewBtn = document.getElementById("tabPreviewBtn");
const editorPreviewBox = document.getElementById("editorPreviewBox");

// --- View Switching ---
function showFeedView() {
  activePostId = null;
  readerView.style.display = "none";
  feedView.style.display = "block";
  progressBar.style.width = "0%";
  window.scrollTo({ top: 0, behavior: "smooth" });
  renderPostsGrid();
}

function showReaderView(postId) {
  const post = store.getById(postId);
  if (!post) return;

  activePostId = postId;
  feedView.style.display = "none";
  readerView.style.display = "flex";

  // Fill content
  readerTitle.textContent = post.title;
  readerEmoji.textContent = post.coverEmoji || "📝";
  readerAuthor.textContent = post.author || "Lsi77";
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
readerLikeBtn.addEventListener("click", async () => {
  if (!activePostId) return;
  const newLikes = await store.likePostOnline(activePostId);
  readerLikeCount.textContent = newLikes;
  readerLikeIcon.textContent = "❤️";
});

readerDeleteBtn.addEventListener("click", async () => {
  if (!activePostId) return;
  const savedPass = store.getSavedPassword();
  const password = prompt("请输入管理员密码以确认删除该文章：", savedPass || "");
  if (!password) return;

  try {
    await store.deletePostOnline(activePostId, password);
    alert("🗑️ 文章删除成功！");
    renderTagsBar();
    showFeedView();
  } catch (err) {
    alert("❌ " + err.message);
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

  const savedPass = store.getSavedPassword();
  if (postAdminPasswordInput && savedPass) {
    postAdminPasswordInput.value = savedPass;
  }

  if (postId) {
    const post = store.getById(postId);
    if (!post) return;
    modalTitleText.textContent = "编辑文章";
    editPostId.value = post.id;
    postEmojiInput.value = post.coverEmoji || "📝";
    postTitleInput.value = post.title;
    postTagsInput.value = (post.tags || []).join(", ");
    postAuthorInput.value = post.author || "Lsi77";
    postExcerptInput.value = post.excerpt || "";
    postContentInput.value = post.content || "";
  } else {
    modalTitleText.textContent = "撰写新文章";
    editPostId.value = "";
    postEmojiInput.value = "📝";
    postAuthorInput.value = "Lsi77";
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

postEditorForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = editPostId.value;
  const title = postTitleInput.value.trim();
  const coverEmoji = postEmojiInput.value.trim() || "📝";
  const author = postAuthorInput.value.trim() || "Lsi77";
  const excerpt = postExcerptInput.value.trim();
  const content = postContentInput.value;
  const password = postAdminPasswordInput ? postAdminPasswordInput.value.trim() : "";
  const rawTags = postTagsInput.value.split(/[,，]/).map(t => t.trim()).filter(Boolean);
  const tags = rawTags.length > 0 ? rawTags : ["随笔"];

  if (!title) return;

  const submitBtn = postEditorForm.querySelector("button[type='submit']");
  const origBtnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "正在发布...";

  try {
    const postData = { id: id || undefined, title, coverEmoji, author, excerpt, content, tags };
    const saved = await store.savePostOnline(postData, password);

    alert("🎉 发布成功！全网访客已实时可见。");
    closeEditorModal();
    renderTagsBar();

    if (saved && saved.id) {
      showReaderView(saved.id);
    } else {
      showFeedView();
    }
  } catch (err) {
    alert("❌ " + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = origBtnText;
  }
});

// --- Boot & Async Cloud Sync ---
initTheme();
renderTagsBar();
renderPostsGrid();

// Asynchronously fetch latest posts from Cloudflare D1
store.syncFromCloud().then(({ success }) => {
  if (success) {
    renderTagsBar();
    renderPostsGrid();
  }
});

})();
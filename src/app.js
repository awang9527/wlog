import { parseMarkdown, calculateReadingTime } from "./markdown.js";
import { BlogStore } from "./blogStore.js";

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

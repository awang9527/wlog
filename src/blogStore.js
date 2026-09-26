export const DEFAULT_POSTS = [
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

export class BlogStore {
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

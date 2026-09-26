export async function onRequestGet(context) {
  const { env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 database 'DB' not bound yet" }), {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM posts ORDER BY date DESC, id DESC"
    ).all();

    const formatted = (results || []).map(row => {
      let tags = [];
      try {
        tags = typeof row.tags === "string" ? JSON.parse(row.tags) : (row.tags || []);
      } catch {
        tags = [row.tags || "随笔"];
      }
      return {
        ...row,
        tags: Array.isArray(tags) ? tags : ["随笔"]
      };
    });

    return new Response(JSON.stringify(formatted), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 database 'DB' not bound yet" }), {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  const adminPassword = env.ADMIN_PASSWORD || "admin123";
  const authHeader = request.headers.get("x-admin-password");

  if (!authHeader || authHeader !== adminPassword) {
    return new Response(JSON.stringify({ error: "管理员密码错误，无权发布文章" }), {
      status: 401,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  try {
    const body = await request.json();
    const title = (body.title || "").trim();
    if (!title) {
      return new Response(JSON.stringify({ error: "文章标题不能为空" }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    const id = body.id || ("post_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6));
    const excerpt = (body.excerpt || "").trim() || title;
    const content = body.content || "";
    const coverEmoji = body.coverEmoji || "📝";
    const author = body.author || "我";
    const tagsJson = JSON.stringify(Array.isArray(body.tags) ? body.tags : ["随笔"]);
    const date = body.date || new Date().toISOString().split("T")[0];
    const likes = typeof body.likes === "number" ? body.likes : 0;

    await env.DB.prepare(
      `INSERT INTO posts (id, title, excerpt, content, coverEmoji, author, tags, date, likes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title=excluded.title,
         excerpt=excluded.excerpt,
         content=excluded.content,
         coverEmoji=excluded.coverEmoji,
         author=excluded.author,
         tags=excluded.tags`
    ).bind(id, title, excerpt, content, coverEmoji, author, tagsJson, date, likes).run();

    return new Response(JSON.stringify({
      success: true,
      post: { id, title, excerpt, content, coverEmoji, author, tags: JSON.parse(tagsJson), date, likes }
    }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 database 'DB' not bound yet" }), {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  const adminPassword = env.ADMIN_PASSWORD || "admin123";
  const authHeader = request.headers.get("x-admin-password");

  if (!authHeader || authHeader !== adminPassword) {
    return new Response(JSON.stringify({ error: "管理员密码错误，无权删除文章" }), {
      status: 401,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response(JSON.stringify({ error: "缺少文章 ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    }

    await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true, id }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}

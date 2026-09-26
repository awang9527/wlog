export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "D1 database not bound" }), {
      status: 503,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  try {
    const body = await request.json();
    const id = body.id;
    if (!id) {
      return new Response(JSON.stringify({ error: "缺少文章 ID" }), { status: 400 });
    }

    await env.DB.prepare("UPDATE posts SET likes = likes + 1 WHERE id = ?").bind(id).run();
    const post = await env.DB.prepare("SELECT likes FROM posts WHERE id = ?").bind(id).first();

    return new Response(JSON.stringify({ success: true, likes: post ? post.likes : 1 }), {
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }
}

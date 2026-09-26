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
function sanitizeUrl(url) {
  const u = (url || "").trim().toLowerCase();
  if (u.startsWith("javascript:") || u.startsWith("vbscript:") || u.startsWith("data:text")) {
    return "#";
  }
  return url;
}

export function parseMarkdown(md) {
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
export function renderInline(text) {
  let s = escapeHtml(text);

  // Images: ![alt](url)
  s = s.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, (match, alt, url) => `<img src="${sanitizeUrl(url)}" alt="${alt}" class="post-inline-img" />`);

  // Links: [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, (match, text, url) => `<a href="${sanitizeUrl(url)}" target="_blank" rel="noopener" class="post-link">${text}</a>`);

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
export function calculateReadingTime(content) {
  if (!content) return 1;
  const clean = content.replace(/\s+/g, "");
  const chars = clean.length;
  // Average reading speed: ~350 chars per minute
  const mins = Math.ceil(chars / 350);
  return Math.max(1, mins);
}

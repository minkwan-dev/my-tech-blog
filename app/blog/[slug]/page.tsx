import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Nav from "@/components/Nav";
import TableOfContents from "@/components/TableOfContents";

// ── 타입 ──────────────────────────────────────────────────────────────────

interface Post {
  title: string;
  slug: string;
  short_description: string | null;
  body?: string;
  released_at: string;
  tags: string[];
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

// ── Supabase ───────────────────────────────────────────────────────────────

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function getPost(slug: string): Promise<Post | null> {
  const { data, error } = await getSupabase()
    .from("posts")
    .select("title, slug, short_description, body, released_at, tags")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data;
}

async function getRelatedPosts(currentSlug: string): Promise<Post[]> {
  const { data } = await getSupabase()
    .from("posts")
    .select("title, slug, short_description, tags, released_at")
    .neq("slug", currentSlug)
    .order("released_at", { ascending: false })
    .limit(3);

  return data ?? [];
}

// ── 유틸 ──────────────────────────────────────────────────────────────────

function calcReadingTime(body: string) {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// 헤딩 텍스트 → slug id 변환
function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\sㄱ-ㅎ가-힣]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// 마크다운에서 TOC 항목 추출
function extractToc(md: string): TocItem[] {
  const items: TocItem[] = [];
  const idCount: Record<string, number> = {};

  for (const line of md.split("\n")) {
    const h2 = line.match(/^## (.+)/);
    const h3 = line.match(/^### (.+)/);
    const match = h2 ?? h3;
    const level = h2 ? 2 : h3 ? 3 : null;
    if (!match || !level) continue;

    const text = match[1].replace(/[*_`]/g, "");
    let id = slugifyHeading(text);

    // 중복 id 처리
    if (idCount[id]) {
      idCount[id]++;
      id = `${id}-${idCount[id]}`;
    } else {
      idCount[id] = 1;
    }

    items.push({ id, text, level });
  }

  return items;
}

// ── 마크다운 렌더러 ────────────────────────────────────────────────────────

function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function parseInline(text: string): string {
  return text
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      '<img src="$2" alt="$1" class="prose-img" />'
    )
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="prose-link">$1</a>')
    .replace(/\*\*/g, "")
    .replace(/\*/g, "");
}

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let inCode = false;
  let codeLang = "";
  let codeLines: string[] = [];
  let inBlockquote = false;
  let inParagraph = false;
  const idCount: Record<string, number> = {};

  const flushParagraph = () => {
    if (inParagraph) {
      html.push("</p>");
      inParagraph = false;
    }
  };

  const makeHeadingId = (text: string) => {
    let id = slugifyHeading(text.replace(/[*_`]/g, ""));
    if (idCount[id]) {
      idCount[id]++;
      id = `${id}-${idCount[id]}`;
    } else {
      idCount[id] = 1;
    }
    return id;
  };

  for (const line of lines) {
    // 코드블록
    if (line.startsWith("```")) {
      if (!inCode) {
        flushParagraph();
        codeLang = line.slice(3).trim();
        codeLines = [];
        inCode = true;
      } else {
        html.push(
          `<div class="code-block"><div class="code-lang">${
            codeLang || "code"
          }</div><pre><code>${codeLines
            .map(escapeHtml)
            .join("\n")}</code></pre></div>`
        );
        inCode = false;
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }

    // 인용
    if (line.startsWith("> ")) {
      flushParagraph();
      if (!inBlockquote) {
        html.push('<blockquote class="prose-blockquote">');
        inBlockquote = true;
      }
      html.push(`<p>${parseInline(line.slice(2))}</p>`);
      continue;
    }

    // 빈 줄
    if (line.trim() === "") {
      if (inBlockquote) {
        html.push("</blockquote>");
        inBlockquote = false;
      }
      flushParagraph();
      continue;
    }

    // 단독 이미지
    const imgMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      flushParagraph();
      html.push(
        `<figure class="prose-figure"><img src="${imgMatch[2]}" alt="${imgMatch[1]}" class="prose-img" /></figure>`
      );
      continue;
    }

    // 헤딩 (id 포함)
    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h3) {
      flushParagraph();
      const id = makeHeadingId(h3[1]);
      html.push(`<h3 id="${id}" class="prose-h3">${parseInline(h3[1])}</h3>`);
      continue;
    }
    if (h2) {
      flushParagraph();
      const id = makeHeadingId(h2[1]);
      html.push(`<h2 id="${id}" class="prose-h2">${parseInline(h2[1])}</h2>`);
      continue;
    }
    if (h1) {
      flushParagraph();
      const id = makeHeadingId(h1[1]);
      html.push(`<h1 id="${id}" class="prose-h1">${parseInline(h1[1])}</h1>`);
      continue;
    }

    // 수평선
    if (/^---+$/.test(line.trim())) {
      flushParagraph();
      html.push('<hr class="prose-hr" />');
      continue;
    }

    // 문단
    if (!inParagraph) {
      html.push('<p class="prose-p">');
      inParagraph = true;
    } else {
      html.push(" ");
    }
    html.push(parseInline(line));
  }

  flushParagraph();
  if (inBlockquote) html.push("</blockquote>");
  return html.join("");
}

// ── 페이지 ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(decodeURIComponent(slug));
  return {
    title: post?.title ?? "Post",
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const [post, related] = await Promise.all([
    getPost(decodedSlug),
    getRelatedPosts(decodedSlug),
  ]);

  if (!post) notFound();

  const readingTime = calcReadingTime(post.body ?? "");
  const bodyHtml = markdownToHtml(post.body ?? "");
  const tocItems = extractToc(post.body ?? "");
  const firstTag = post.tags?.[0] ?? null;

  return (
    <div className="min-h-screen bg-[#f5f7f5] font-sans text-gray-800">
      <Nav />

      {/* 본문 + TOC 레이아웃 */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-20 flex gap-16 items-start">
        {/* 본문 */}
        <article className="flex-1 min-w-0">
          {/* 태그 */}
          {firstTag && (
            <div className="flex items-center gap-1.5 mb-4">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#3d8b6e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              <span className="text-xs font-medium text-[#3d8b6e]">
                {firstTag}
              </span>
            </div>
          )}

          <h1 className="text-3xl font-extrabold text-gray-900 leading-snug mb-3">
            {post.title}
          </h1>

          {post.short_description && (
            <p className="text-gray-400 text-base mb-4">
              {post.short_description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-400 mb-8">
            <span className="flex items-center gap-1.5">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {new Date(post.released_at).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {readingTime}min read
            </span>
          </div>

          <hr className="border-gray-200 mb-8" />

          <div
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          {/* More to read */}
          {related.length > 0 && (
            <div className="border-t border-gray-200 mt-16 pt-10">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-5">
                More to read
              </p>
              <div className="flex gap-4 overflow-x-auto pb-1">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group min-w-55 max-w-65 rounded-xl border border-gray-200 bg-white p-4 hover:border-[#3d8b6e] transition-colors shrink-0"
                  >
                    {r.tags?.[0] && (
                      <span className="text-xs text-[#3d8b6e] font-medium mb-2 block">
                        {r.tags[0]}
                      </span>
                    )}
                    <p className="text-sm font-bold text-gray-900 group-hover:text-[#3d8b6e] transition-colors leading-snug mb-1">
                      {r.title}
                    </p>
                    {r.short_description && (
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {r.short_description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Footer nav */}
          <div className="border-t border-gray-200 mt-8 pt-5 flex justify-between text-sm">
            <Link href="/blog" className="text-[#3d8b6e] hover:underline">
              View all posts
            </Link>
            <Link href="/" className="text-gray-400 hover:underline">
              Back to portfolio
            </Link>
          </div>
        </article>

        {/* TOC - 클라이언트 컴포넌트 */}
        <TableOfContents items={tocItems} />
      </div>

      <style>{`
        .prose-content { color: #374151; line-height: 1.8; font-size: 0.95rem; }
        .prose-h2 { font-size: 1.4rem; font-weight: 800; color: #111827; margin: 2.5rem 0 0.75rem; }
        .prose-h3 { font-size: 1.15rem; font-weight: 700; color: #111827; margin: 2rem 0 0.5rem; }
        .prose-h1 { font-size: 1.6rem; font-weight: 800; color: #111827; margin: 2.5rem 0 0.75rem; }
        .prose-p { margin: 0 0 1.25rem; }
        .prose-hr { border: none; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
        .prose-blockquote { border-left: 3px solid #3d8b6e; padding: 0.5rem 1rem; margin: 1.5rem 0; background: #f0f7f4; border-radius: 0 6px 6px 0; color: #4b5563; font-style: italic; }
        .prose-blockquote p { margin: 0; }
        .prose-link { color: #3d8b6e; text-decoration: underline; }
        .inline-code { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 4px; padding: 0.1em 0.4em; font-size: 0.85em; font-family: monospace; color: #374151; }
        .code-block { background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin: 1.5rem 0; }
        .code-lang { font-size: 0.7rem; font-family: monospace; color: #9ca3af; padding: 0.4rem 1rem; border-bottom: 1px solid #e5e7eb; background: #f3f4f6; }
        .code-block pre { margin: 0; padding: 1rem; overflow-x: auto; font-size: 0.85rem; line-height: 1.7; }
        .code-block code { font-family: 'Menlo', 'Monaco', 'Consolas', monospace; color: #374151; }
        .prose-img { max-width: 100%; height: auto; border-radius: 8px; margin: 0.5rem 0; }
        .prose-figure { margin: 1.5rem 0; text-align: center; }
      `}</style>
    </div>
  );
}

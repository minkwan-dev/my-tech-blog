export const metadata = { title: "Blog" };

import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Nav from "@/components/Nav";

async function getAllPosts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("posts")
    .select("title, slug, short_description, released_at")
    .order("released_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }

  return data;
}

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-[#f5f7f5] font-sans text-gray-800">
      <Nav />

      <section className="max-w-5xl mx-auto px-8 py-5 pt-10 pb-20">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Blog</h1>
          <p className="text-gray-400 text-base">
            Thoughts on development, design, and technology.
          </p>
        </div>

        {/* Post list */}
        <div className="flex flex-col divide-y divide-gray-200">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group py-6 flex items-start justify-between gap-8"
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-900 group-hover:text-[#3d8b6e] transition-colors mb-1">
                  {post.title}
                </h2>
                {post.short_description && (
                  <p className="text-sm text-gray-400 line-clamp-1">
                    {post.short_description}
                  </p>
                )}
              </div>
              <span className="text-sm text-gray-400 shrink-0 mt-0.5">
                {new Date(post.released_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer
      <footer className="border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6 text-sm text-gray-400">
          Built with Next.js
        </div>
      </footer> */}
    </div>
  );
}

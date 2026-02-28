import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import Nav from "@/components/Nav"; // 경로는 프로젝트 구조에 맞게 조정

const certifications = ["SQLD", "ADsP", "Engineer Information Processing"];

async function getRecentPosts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("posts")
    .select("title, slug, released_at")
    .order("released_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }

  return data;
}

export default async function Home() {
  const posts = await getRecentPosts();

  return (
    <div className="min-h-screen bg-[#f5f7f5] font-sans text-gray-800">
      {/* Nav - 클라이언트 컴포넌트 (usePathname 사용) */}
      <Nav />

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 py-5 pt-10 pb-16">
        <div className="flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex-1">
            <p className="text-[#3d8b6e] font-medium text-sm mb-3">
              Frontend Developer
            </p>
            <h1 className="text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
              Hi, I&apos;m Minkwan
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-10 max-w-md">
              Passionate about building clean, data-driven web experiences.
              Currently training at SSAFY to sharpen my skills.
            </p>

            <div className="flex flex-col gap-4">
              {/* Education */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#eaf3ef] flex items-center justify-center text-[#3d8b6e] shrink-0 mt-0.5">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-0.5">
                    Education
                  </p>
                  <p className="text-gray-700 text-sm">
                    Kyonggi Univ. Applied Statistics / Public Administration
                    (B.A.)
                  </p>
                </div>
              </div>

              {/* Training */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#eaf3ef] flex items-center justify-center text-[#3d8b6e] shrink-0 mt-0.5">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-0.5">
                    Training
                  </p>
                  <p className="text-gray-700 text-sm">
                    SSAFY 15th Cohort (in progress)
                  </p>
                </div>
              </div>

              {/* Certifications */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#eaf3ef] flex items-center justify-center text-[#3d8b6e] shrink-0 mt-0.5">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="8" r="6" />
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-1.5">
                    Certifications
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {certifications.map((cert) => (
                      <span
                        key={cert}
                        className="px-3 py-1 rounded-full border border-gray-300 text-gray-600 text-xs font-medium"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile image */}
          <div className="shrink-0 hidden md:flex items-center justify-center ml-10">
            {/* 컨테이너 크기를 w-72(288px) -> w-96(384px)로 확장 */}
            <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-8 border-white shadow-xl bg-gray-200 transition-transform hover:scale-105 duration-300">
              <Image
                src="/profile.jpg"
                alt="Minkwan"
                // 고해상도 대응을 위해 width/height 값을 컨테이너 최대치에 맞춤
                width={400}
                height={400}
                className="object-cover w-full h-full"
                priority // Hero 이미지는 우선 로딩 권장
              />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200" />

      {/* Recent Writing */}
      <section className="max-w-5xl mx-auto px-8 py-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs font-bold tracking-widest uppercase text-gray-500">
            Recent Writing
          </h2>
          <Link
            href="/blog"
            className="text-sm font-medium text-[#3d8b6e] hover:underline flex items-center gap-1"
          >
            All posts
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="flex flex-col divide-y divide-gray-200">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="flex items-center justify-between py-4 group"
            >
              <span className="text-gray-800 font-medium group-hover:text-[#3d8b6e] transition-colors text-sm sm:text-base">
                {post.title}
              </span>
              <span className="text-gray-400 text-sm shrink-0 ml-4">
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

      {/* Footer */}
      {/* <footer className="border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-6 text-sm text-gray-400">
          Built with Next.js · Content managed via{" "}
          <Link href="/admin" className="text-[#3d8b6e] hover:underline">
            admin panel
          </Link>
        </div>
      </footer> */}
    </div>
  );
}

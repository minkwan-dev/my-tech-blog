import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sync() {
  const username = "minkwan";
  console.log(`${username} 벨로그 동기화 시작...`);

  const query = `
    query Posts($username: String!) {
      posts(username: $username, limit: 100) {
        id, title, short_description, thumbnail, released_at, url_slug, body, tags
      }
    }
  `;

  const response = await fetch("https://v2.velog.io/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { username } }),
  });

  const { data } = await response.json();
  const posts = data.posts;

  for (const post of posts) {
    const { error } = await supabase.from("posts").upsert(
      {
        velog_id: post.id,
        title: post.title,
        slug: post.url_slug,
        body: post.body,
        short_description: post.short_description,
        thumbnail: post.thumbnail,
        tags: post.tags,
        released_at: post.released_at,
      },
      // 중복 시 업데이트 [cite: 17, 41]
      { onConflict: "velog_id" }
    );

    if (error) console.error(`에러 발생: ${post.title}`, error);
    else console.log(`동기화 완료: ${post.title}`);
  }
}

sync();

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface VelogPost {
  id: string;
  title: string;
  short_description: string | null;
  thumbnail: string | null;
  released_at: string;
  url_slug: string;
  body: string;
  tags: string[];
}

interface VelogResponse {
  data: {
    posts: VelogPost[];
  };
}

async function sync() {
  const username = "minkwan";
  let cursor: string | null = null;
  let hasMore = true;
  let totalSynced = 0;

  console.log(`${username} 벨로그 전체 동기화 시작 (50개씩 반복 호출)...`);

  while (hasMore) {
    const query = `
      query Posts($username: String!, $cursor: ID) {
        posts(username: $username, cursor: $cursor, limit: 50) {
          id
          title
          short_description
          thumbnail
          released_at
          url_slug
          body
          tags
        }
      }
    `;

    try {
      const response = await fetch("https://v2.velog.io/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          variables: { username, cursor },
        }),
      });

      const result = (await response.json()) as VelogResponse;
      const posts = result.data?.posts;

      if (!posts || posts.length === 0) {
        hasMore = false;
        break;
      }

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
          { onConflict: "velog_id" }
        );

        if (error) console.error(`에러 발생: ${post.title}`, error);
      }

      totalSynced += posts.length;
      console.log(`${posts.length}개 동기화 완료 (누적: ${totalSynced}개)`);

      cursor = posts[posts.length - 1].id;

      if (posts.length < 50) {
        hasMore = false;
      }
    } catch (err) {
      console.error("동기화 중 오류 발생:", err);
      hasMore = false;
    }
  }

  console.log(`총 ${totalSynced}개의 포스트가 저장`);
}

sync();

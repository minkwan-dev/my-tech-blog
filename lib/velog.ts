export async function getVelogPosts(username: string) {
  const query = `
      query Posts($username: String!) {
        posts(username: $username, limit: 100) {
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

  const response = await fetch("https://v2.velog.io/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { username },
    }),
    // ISR 설정 (1시간) [cite: 45]
    next: { revalidate: 3600 },
  });

  const data = await response.json();
  return data.data.posts;
}

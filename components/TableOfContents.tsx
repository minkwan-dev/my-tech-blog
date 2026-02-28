"use client";

import { useEffect, useRef, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headings = items
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // 화면에 보이는 헤딩 중 가장 위에 있는 것을 active로
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0 }
    );

    headings.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside className="hidden xl:block w-56 shrink-0 self-start sticky top-20">
      <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
        On this page
      </p>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById(item.id)
                ?.scrollIntoView({ behavior: "smooth" });
              setActiveId(item.id);
            }}
            className={`
              text-xs leading-relaxed py-0.5 transition-colors border-l-2
              ${item.level === 3 ? "pl-4" : "pl-3"}
              ${
                activeId === item.id
                  ? "text-[#3d8b6e] border-[#3d8b6e] font-medium"
                  : "text-gray-400 border-transparent hover:text-gray-600 hover:border-gray-300"
              }
            `}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </aside>
  );
}

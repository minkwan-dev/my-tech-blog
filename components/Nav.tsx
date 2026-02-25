"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between px-8 py-5 max-w-4xl mx-auto">
      <span className="font-mono font-semibold text-lg tracking-tight text-gray-900">
        {"< "}
        <span className="font-bold">Minkwan</span>
        {" />"}
      </span>
      <div className="flex gap-2">
        {navLinks.map(({ href, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[#e8f2ed] text-[#3d8b6e]"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

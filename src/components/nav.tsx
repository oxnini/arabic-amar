"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/topics", label: "Topics" },
  { href: "/lessons", label: "Lessons" },
  { href: "/vocabulary", label: "Vocabulary Bank" },
  { href: "/grammar", label: "Grammar" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="font-arabic text-xl font-bold text-stone-800"
        >
          القرآن
          <span className="ml-2 font-sans text-sm font-normal text-stone-500">
            Quranic Arabic
          </span>
        </Link>
        <div className="flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-amber-100 text-amber-900"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

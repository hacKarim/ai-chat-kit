import Link from "next/link";

const links = [
  { href: "/blocks/plan", label: "Blocks" },
  { href: "/chat", label: "Chat demo" },
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
      <Link href="/" className="font-display text-lg font-semibold tracking-tight">
        AI chat kit
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline focus-visible:outline-none"
          >
            {link.label}
          </Link>
        ))}
        <a
          href="https://github.com/hacKarim/ai-chat-kit"
          className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline focus-visible:outline-none"
        >
          GitHub
        </a>
      </nav>
    </header>
  );
}

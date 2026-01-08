import { SiteHeader } from "@/components/playground/site-header";
import { BlockNav } from "@/components/playground/block-nav";

export default function BlocksLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <SiteHeader />
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-24 md:grid-cols-[11rem_minmax(0,1fr)]">
        <BlockNav />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

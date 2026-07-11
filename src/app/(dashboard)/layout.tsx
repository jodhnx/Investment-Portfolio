import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PageTransition } from "@/components/layout/page-transition";
import { PriceUpdater } from "@/hooks/use-price-updater";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] bg-background">
      <PriceUpdater />
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 md:p-6 md:pb-6">
          <PageTransition>{children}</PageTransition>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

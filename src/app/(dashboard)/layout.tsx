import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { TransactionFab } from "@/components/layout/transaction-fab";
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
        <main className="mx-auto w-full max-w-7xl flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 pb-[calc(5.75rem+env(safe-area-inset-bottom))] md:px-8 md:py-8 md:pb-8">
          <PageTransition>{children}</PageTransition>
        </main>
        <BottomNav />
        <TransactionFab />
      </div>
    </div>
  );
}

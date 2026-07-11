import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PriceUpdater } from "@/hooks/use-price-updater";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <PriceUpdater />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

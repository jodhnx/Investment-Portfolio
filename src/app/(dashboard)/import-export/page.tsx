"use client";

import { useRef } from "react";
import { Download, Upload, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePortfolioStore } from "@/store/portfolio-store";
import { selectActivePortfolio } from "@/lib/store-selectors";
import { exportToCSV, parseCSVImport } from "@/lib/storage";
import { toast } from "sonner";

export default function ImportExportPage() {
  const portfolio = usePortfolioStore(selectActivePortfolio);
  const importPositions = usePortfolioStore((s) => s.importPositions);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExportCSV = () => {
    if (!portfolio) return;
    const csv = exportToCSV(portfolio);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${portfolio.name.replace(/\s/g, "_")}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportiert");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const positions = parseCSVImport(text);
      if (positions.length) {
        importPositions(positions);
        toast.success(`${positions.length} Positionen importiert`);
      } else {
        toast.error("Keine gültigen Daten in der Datei");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExportJSON = () => {
    if (!portfolio) return;
    const blob = new Blob([JSON.stringify(portfolio, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${portfolio.name.replace(/\s/g, "_")}_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup exportiert");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Import / Export</h2>
        <p className="text-sm text-muted-foreground">
          Daten importieren, exportieren – alle Änderungen werden automatisch mit Supabase synchronisiert
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-4 w-4" /> CSV Export
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Portfolio als CSV-Datei exportieren (Excel-kompatibel)
            </p>
            <Button onClick={handleExportCSV}>CSV herunterladen</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4" /> CSV Import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Positionen aus CSV-Datei importieren
            </p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              CSV auswählen
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" /> JSON Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              Vollständiges Portfolio-Backup als JSON
            </p>
            <Button variant="secondary" onClick={handleExportJSON}>
              Backup erstellen
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvestmentCalculator } from "@/components/calculators/investment-calculator";
import { SparplanCalculator } from "@/components/calculators/sparplan-calculator";
import { DCACalculator } from "@/components/calculators/dca-calculator";
import { ROICalculator } from "@/components/calculators/roi-calculator";
import { BreakEvenCalculator } from "@/components/calculators/break-even-calculator";
import { CompoundInterestCalculator } from "@/components/calculators/compound-calculator";
import { InflationCalculator } from "@/components/calculators/inflation-calculator";

export default function CalculatorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Rechner</h2>
        <p className="text-sm text-muted-foreground">
          Investment-, ROI-, DCA-, Sparplan- und Finanzrechner
        </p>
      </div>

      <Tabs defaultValue="investment" className="space-y-4">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-auto min-w-max flex-wrap gap-1">
            <TabsTrigger value="investment" className="h-10">Investment</TabsTrigger>
            <TabsTrigger value="roi" className="h-10">ROI</TabsTrigger>
            <TabsTrigger value="dca" className="h-10">DCA</TabsTrigger>
            <TabsTrigger value="sparplan" className="h-10">ETF Sparplan</TabsTrigger>
            <TabsTrigger value="compound" className="h-10">Zinseszins</TabsTrigger>
            <TabsTrigger value="breakeven" className="h-10">Break-Even</TabsTrigger>
            <TabsTrigger value="inflation" className="h-10">Inflation</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="investment"><InvestmentCalculator /></TabsContent>
        <TabsContent value="roi"><ROICalculator /></TabsContent>
        <TabsContent value="dca"><DCACalculator /></TabsContent>
        <TabsContent value="sparplan"><SparplanCalculator /></TabsContent>
        <TabsContent value="compound"><CompoundInterestCalculator /></TabsContent>
        <TabsContent value="breakeven"><BreakEvenCalculator /></TabsContent>
        <TabsContent value="inflation"><InflationCalculator /></TabsContent>
      </Tabs>
    </div>
  );
}

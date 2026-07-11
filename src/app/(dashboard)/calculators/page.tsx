"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvestmentCalculator } from "@/components/calculators/investment-calculator";
import { SparplanCalculator } from "@/components/calculators/sparplan-calculator";
import { DCACalculator } from "@/components/calculators/dca-calculator";

export default function CalculatorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Rechner</h2>
        <p className="text-sm text-muted-foreground">
          Investment-, Sparplan- und DCA-Rechner
        </p>
      </div>

      <Tabs defaultValue="investment">
        <TabsList>
          <TabsTrigger value="investment">Investment</TabsTrigger>
          <TabsTrigger value="sparplan">Sparplan</TabsTrigger>
          <TabsTrigger value="dca">DCA</TabsTrigger>
        </TabsList>
        <TabsContent value="investment" className="mt-4">
          <InvestmentCalculator />
        </TabsContent>
        <TabsContent value="sparplan" className="mt-4">
          <SparplanCalculator />
        </TabsContent>
        <TabsContent value="dca" className="mt-4">
          <DCACalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}

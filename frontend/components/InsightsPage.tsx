import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { TrendingUp } from "lucide-react";
import { InsightCards, type InsightMetrics } from "./insights/InsightCards";
import { ChartSection } from "./insights/ChartSection";
import { TransportTable } from "./insights/TransportTable";
import { MainLayout } from './layout/MainLayout';
import { Button } from './ui/button';
import { ViewType } from '../types';

interface NewInsightsPageProps {
  darkMode: boolean;
  isLoggedIn: boolean;
  onDarkModeChange: (value: boolean) => void;
  onNavigate: (view: ViewType) => void;
}

const insights: InsightMetrics = {
  ecoFriendly: {
    value: "Piccadilly Line",
    subtext: "2.1kg CO₂"
  },
  fastest: {
    value: "Heathrow Express",
    subtext: "15 mins"
  },
  topRated: {
    value: "Gatwick Express",
    subtext: "4.8/5 rating"
  }
};

const recentRoutes = [
  { route: "Heathrow → Paddington", mode: "Train", duration: "15 mins", price: "£25" },
  { route: "Gatwick → Victoria", mode: "Train", duration: "30 mins", price: "£20" },
  { route: "Stansted → Liverpool St", mode: "Train", duration: "45 mins", price: "£19" }
];

const NewInsightsPage: React.FC<NewInsightsPageProps> = ({
  isLoggedIn,
  onNavigate
}) => {
  return (
    <MainLayout
      isLoggedIn={isLoggedIn}
      onNavigate={onNavigate}
      className="text-gray-900"
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Airport Transfer Insights</h2>
            <p className="text-muted-foreground">Data-driven analysis of airport transfer options</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => onNavigate('results')} className="hidden sm:inline-flex">
              View Results
            </Button>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="text-primary" /> Insights Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InsightCards metrics={insights} />
              <ChartSection />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Recent Transport Options</CardTitle>
            </CardHeader>
            <CardContent>
              <TransportTable routes={recentRoutes} />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export { NewInsightsPage };

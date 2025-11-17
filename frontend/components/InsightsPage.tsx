import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { TrendingUp } from "lucide-react";
import { InsightCards, type InsightMetrics } from "./insights/InsightCards";
import { ChartSection } from "./insights/ChartSection";
import { MainLayout } from './layout/MainLayout';
import { Button } from './ui/button';
import { Moon, Sun } from 'lucide-react';
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
    value: "Piccadilly Line",
    subtext: "£6"
  }
};

const NewInsightsPage: React.FC<NewInsightsPageProps> = ({
  darkMode,
  isLoggedIn,
  onDarkModeChange,
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDarkModeChange(!darkMode)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="outline" onClick={() => onNavigate('results')} className="hidden sm:inline-flex">
              Back to Results
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
              <CardTitle className="text-xl font-semibold">Time vs Cost Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analysis of travel time versus cost for different transport options.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Route Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span>Airport</span>
                <span>→</span>
                <span>City Centre</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export { NewInsightsPage };

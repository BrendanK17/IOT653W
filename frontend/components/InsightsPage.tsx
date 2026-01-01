import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { TrendingUp } from "lucide-react";
import { InsightCards, type InsightMetrics } from "./insights/InsightCards";
import { ChartSection } from "./insights/ChartSection";
import { MainLayout } from './layout/MainLayout';
import { Button } from './ui/button';
import { ViewType, TransportOption } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface NewInsightsPageProps {
  isLoggedIn: boolean;
  onNavigate: (view: ViewType) => void;
  transportOptions: TransportOption[];
}

const NewInsightsPage: React.FC<NewInsightsPageProps> = ({
  isLoggedIn,
  onNavigate,
  transportOptions
}) => {
  // Calculate insights from transport options
  const calculateInsights = (): InsightMetrics => {
    if (transportOptions.length === 0) {
      return {
        ecoFriendly: { value: "N/A", subtext: "No data" },
        fastest: { value: "N/A", subtext: "No data" },
        topRated: { value: "N/A", subtext: "No data" }
      };
    }

    // Find most eco-friendly (lowest CO2)
    const ecoFriendly = transportOptions.reduce((prev, current) => {
      const prevCo2 = prev.co2 ?? Number.MAX_VALUE;
      const currentCo2 = current.co2 ?? Number.MAX_VALUE;
      return currentCo2 < prevCo2 ? current : prev;
    });

    // Find fastest (lowest duration)
    const fastest = transportOptions.reduce((prev, current) => {
      const prevDuration = typeof prev.duration === 'number' ? prev.duration : parseInt(prev.duration);
      const currentDuration = typeof current.duration === 'number' ? current.duration : parseInt(current.duration);
      return currentDuration < prevDuration ? current : prev;
    });

    // Find cheapest (lowest price)
    const cheapest = transportOptions.reduce((prev, current) => {
      return current.price < prev.price ? current : prev;
    });

    return {
      ecoFriendly: {
        value: ecoFriendly.name,
        subtext: ecoFriendly.co2 ? `${ecoFriendly.co2} kg CO₂` : "N/A"
      },
      fastest: {
        value: fastest.name,
        subtext: `${typeof fastest.duration === 'number' ? fastest.duration : parseInt(fastest.duration)} mins`
      },
      topRated: {
        value: cheapest.name,
        subtext: `£${cheapest.price}`
      }
    };
  };

  const insights = calculateInsights();
  // Prepare data for the scatter chart
  const chartData = transportOptions.map(option => ({
    name: option.name,
    time: typeof option.duration === 'number' ? option.duration : parseInt(option.duration),
    cost: option.price,
    mode: option.mode
  }));

  // Color map for transport modes
  const modeColors: Record<string, string> = {
    train: '#3b82f6',
    bus: '#ef4444',
    coach: '#f59e0b',
    taxi: '#8b5cf6',
    underground: '#ec4899'
  };

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
              <div className="w-full h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" type="number" label={{ value: 'Duration (minutes)', position: 'insideBottomRight', offset: -10 }} />
                    <YAxis dataKey="cost" type="number" label={{ value: 'Cost (£)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 border border-gray-300 rounded shadow">
                            <p className="font-semibold">{data.name}</p>
                            <p className="text-sm">Time: {data.time} mins</p>
                            <p className="text-sm">Cost: £{data.cost}</p>
                          </div>
                        );
                      }
                      return null;
                    }} />
                    <Legend />
                    {Array.from(new Set(chartData.map(d => d.mode))).map(mode => (
                      <Scatter
                        key={mode}
                        name={mode.charAt(0).toUpperCase() + mode.slice(1)}
                        data={chartData.filter(d => d.mode === mode)}
                        fill={modeColors[mode]}
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export { NewInsightsPage };

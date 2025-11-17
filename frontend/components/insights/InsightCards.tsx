import React from 'react';
import { Badge } from "../ui/badge";
import { Leaf, TrendingUp, Star } from "lucide-react";

interface MetricCardProps {
  title: string;
  icon: "eco" | "speed" | "rating";
  value: string;
  subtext: string;
}

const getIcon = (type: MetricCardProps['icon']) => {
  switch (type) {
    case "eco":
      return <Leaf className="text-green-600 mb-1" />;
    case "speed":
      return <TrendingUp className="text-blue-600 mb-1" />;
    case "rating":
      return <Star className="text-yellow-500 mb-1" />;
  }
};

const MetricCard: React.FC<MetricCardProps> = ({ title, icon, value, subtext }) => {
  return (
    <div className="flex flex-col items-center">
      <Badge variant="secondary" className="mb-2">{title}</Badge>
      {getIcon(icon)}
      <span className="text-lg font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{subtext}</span>
    </div>
  );
};

export interface InsightMetrics {
  ecoFriendly: { value: string; subtext: string; };
  fastest: { value: string; subtext: string; };
  topRated: { value: string; subtext: string; };
}

interface InsightCardsProps {
  metrics: InsightMetrics;
}

export const InsightCards: React.FC<InsightCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <MetricCard
        title="Most Eco-Friendly"
        icon="eco"
        value={metrics.ecoFriendly.value}
        subtext={metrics.ecoFriendly.subtext}
      />
      <MetricCard
        title="Fastest Option"
        icon="speed"
        value={metrics.fastest.value}
        subtext={metrics.fastest.subtext}
      />
      <MetricCard
        title="Most Affordable"
        icon="rating"
        value={metrics.topRated.value}
        subtext={metrics.topRated.subtext}
      />
    </div>
  );
};
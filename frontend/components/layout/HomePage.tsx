import React, { useState } from 'react';
import { Card } from "../ui/card";
import { Leaf, Clock, Star } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Header } from '../layout/Header';
import { SearchBox, AirportDropdown, SearchButton } from '../search/SearchComponents';
import { ViewType } from '../../types';
import type { AirportOption } from '../search/SearchComponents';
import { AccountPage } from '../AccountPage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface HomePageProps {
  isLoggedIn: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: (passengers: number) => void;
  selectedAirport: string;
  showDropdown: boolean;
  onShowDropdown: (show: boolean) => void;
  onAirportSelect: (display: string, code: string) => void;
  onNavigate: (view: ViewType) => void;
  airports: AirportOption[];
  userEmail?: string;
  onLogout: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  isLoggedIn,
  searchQuery,
  onSearchChange,
  onSearch,
  selectedAirport,
  showDropdown,
  onShowDropdown,
  onAirportSelect,
  onNavigate,
  airports,
  userEmail = '',
  onLogout
}) => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [defaultAirport, setDefaultAirport] = useState('');
  const [passengers, setPassengers] = useState(1);

  if (currentView === 'account') {
    return (
        <AccountPage
        userEmail={userEmail}
        defaultAirport={defaultAirport}
        setDefaultAirport={setDefaultAirport}
        setIsLoggedIn={(value) => {
          if (!value) onLogout();
        }}
        setUserEmail={() => {}} // This will be handled by onLogout
        onNavigateHome={() => setCurrentView('home')}
        airports={airports}
      />
    );
  }
  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 -z-10">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1635073630004-97c3587ebcbf"
          alt="Airport terminal"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50" />
      </div>

      <Header
        isLoggedIn={isLoggedIn}
        onNavigate={(view) => {
          if (view === 'account') {
            setCurrentView('account');
          } else {
            onNavigate(view);
          }
        }}
        className="relative backdrop-blur-sm bg-white/80 border-b border-white/20 shadow-sm"
      />

      <main className="w-full px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-5xl font-bold mb-4 text-white">
              Compare your best route from the airport to the city
            </h2>
            <p className="text-lg sm:text-xl text-white/90">
              Find the cheapest, fastest, and most sustainable airport transfers
            </p>
          </div>

          <Card className="max-w-2xl mx-auto mb-8 shadow-2xl bg-white/95 border-white/20 z-10">
          <div className="p-4 sm:p-6 space-y-4">
            <div className="relative">
              <SearchBox
                searchQuery={searchQuery}
                onSearchChange={(value) => {
                  onSearchChange(value);
                  onShowDropdown(true);
                }}
                onFocus={() => onShowDropdown(true)}
              />
              
              <AirportDropdown
                searchQuery={searchQuery}
                showDropdown={showDropdown}
                airports={airports}
                onSelect={(display, code) => {
                  onAirportSelect(display, code);
                  onSearchChange(display);
                  onShowDropdown(false);
                }}
              />
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="passengers" className="text-sm font-medium text-gray-700">Passengers:</label>
              <Select value={passengers.toString()} onValueChange={(value) => setPassengers(parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="7">7</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SearchButton
              disabled={!selectedAirport && !searchQuery}
              onClick={() => onSearch(passengers)}
              className="w-full"
            />
          </div>
        </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            {[
              { icon: Leaf, title: 'Eco-Friendly Options', desc: 'Compare sustainable transport methods', color: 'bg-teal-500' },
              { icon: Clock, title: 'Real-Time Pricing', desc: 'Always get the most current prices', color: 'bg-blue-500' },
              { icon: Star, title: 'Best Route', desc: 'AI-powered recommendations', color: 'bg-orange-500' },
            ].map((item, idx) => (
              <Card key={idx} className="text-center p-4 sm:p-6 bg-white/95 hover:bg-white transition-all shadow-lg border-white/20 z-0">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${item.color}`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
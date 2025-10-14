import { ReactNode } from 'react';
import { Button } from "../ui/button";
import { Plane, User } from 'lucide-react';
import { ViewType } from '../../types';
import { cn } from "../../utils/cn";

interface HeaderProps {
  isLoggedIn: boolean;
  onNavigate: (view: ViewType) => void;
  className?: string;
}

export function Header({
  isLoggedIn,
  onNavigate,
  className,
}: HeaderProps): ReactNode {
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('home')}
              type="button"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Plane className="w-7 h-7 mr-2 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">GroundScanner</h1>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <Button
                variant="ghost"
                onClick={() => onNavigate('account')}
                className="text-gray-700 hover:bg-gray-100"
              >
                <User className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Account</span>
              </Button>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:bg-gray-100 hidden sm:inline-flex"
                  onClick={() => onNavigate('login')}
                >
                  Log in
                </Button>
                <Button 
                  className="bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => onNavigate('register')}
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
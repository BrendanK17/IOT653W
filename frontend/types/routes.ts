export type RouteParams = {
  airport?: string;
};

export type NavigationHandler = (path: string) => void;

export interface WithRouteProps {
  onNavigate: NavigationHandler;
}

export interface WithAirportProps {
  airport: string;
}

export interface WithUserProps {
  isLoggedIn: boolean;
  userEmail?: string;
}
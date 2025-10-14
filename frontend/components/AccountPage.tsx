import { MainLayout } from "./layout/MainLayout"
import { UserInfoCard } from "./account/UserInfoCard"
import { DefaultAirportCard } from "./account/DefaultAirportCard"
import { LogoutCard } from "./account/LogoutCard"
import { ViewType } from "../types"

interface AccountPageProps {
  userEmail: string
  defaultAirport: string
  setDefaultAirport: (value: string) => void
  setIsLoggedIn: (value: boolean) => void
  setUserEmail: (value: string) => void
  onNavigateHome: () => void
  airports: string[]
}

export function AccountPage({
  userEmail,
  defaultAirport,
  setDefaultAirport,
  setIsLoggedIn,
  setUserEmail,
  onNavigateHome,
  airports
}: AccountPageProps) {
  const handleNavigate = (view: ViewType) => {
    if (view === 'home') {
      onNavigateHome();
    }
  };

  return (
    <MainLayout
      isLoggedIn={true}
      onNavigate={handleNavigate}
    >

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Account Settings</h2>
          <p className="text-muted-foreground">Manage your GroundScanner preferences</p>
        </div>

        <div className="space-y-6">
          <UserInfoCard userEmail={userEmail} />
          
          <DefaultAirportCard
            defaultAirport={defaultAirport}
            setDefaultAirport={setDefaultAirport}
            airports={airports}
          />
          

          
          <LogoutCard
            onLogout={() => {
              setIsLoggedIn(false);
              setUserEmail('');
              setDefaultAirport('');
              onNavigateHome();
            }}
          />
        </div>
      </div>
    </MainLayout>
  )
}
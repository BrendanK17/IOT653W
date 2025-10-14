import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"

interface LogoutCardProps {
  onLogout: () => void
}

export function LogoutCard({ onLogout }: LogoutCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <Button
          variant="destructive"
          className="w-full"
          onClick={onLogout}
        >
          Log out
        </Button>
      </CardContent>
    </Card>
  )
}
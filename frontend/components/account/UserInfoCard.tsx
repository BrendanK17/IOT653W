import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

interface UserInfoCardProps {
  userEmail: string
}

export function UserInfoCard({ userEmail }: UserInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
        <CardDescription>Your account details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={userEmail} disabled />
        </div>
        <Button variant="outline">Change Password</Button>
      </CardContent>
    </Card>
  )
}
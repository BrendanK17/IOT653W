import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"

interface PreferencesCardProps {
  darkMode: boolean
  onDarkModeChange: (value: boolean) => void
}

export function PreferencesCard({ darkMode, onDarkModeChange }: PreferencesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Customize your experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Dark Mode</Label>
            <p className="text-sm text-muted-foreground">Use dark theme</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDarkModeChange(!darkMode)}
          >
            {darkMode ? 'Enabled' : 'Disabled'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
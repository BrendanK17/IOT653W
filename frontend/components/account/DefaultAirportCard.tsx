import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

interface DefaultAirportCardProps {
  defaultAirport: string
  setDefaultAirport: (value: string) => void
  airports: string[]
}

export function DefaultAirportCard({
  defaultAirport,
  setDefaultAirport,
  airports
}: DefaultAirportCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Default Airport</CardTitle>
        <CardDescription>Set your preferred airport to prepopulate searches</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="default-airport">Select Default Airport</Label>
          <Select 
            value={defaultAirport || 'none'} 
            onValueChange={(value) => setDefaultAirport(value === 'none' ? '' : value)}
          >
            <SelectTrigger id="default-airport">
              <SelectValue placeholder="Choose an airport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {airports.map((airport) => (
                <SelectItem key={airport} value={airport}>
                  {airport}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {defaultAirport && (
            <p className="text-sm text-muted-foreground">
              This airport will be automatically filled in when you search for routes.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
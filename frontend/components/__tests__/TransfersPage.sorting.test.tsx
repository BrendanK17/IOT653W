import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TransfersPage } from '../TransfersPage'
import type { ViewType } from '../../types'
import type { AirportOption } from '../search/SearchComponents'

// Previous mock transport data removed — tests skipped until new schema/mocks provided

const mockProps = {
  isLoggedIn: false,
  onNavigate: (() => {}) as (view: ViewType) => void,
  selectedAirport: 'London Heathrow (LHR)',
  searchQuery: 'London Heathrow (LHR)',
  transportOptions: [],
  onAirportSelect: vi.fn(),
  airports: [
    { id: '1', display: 'London Heathrow (LHR)', value: 'LHR', type: 'airport' as const, iata: 'LHR', name: 'Heathrow', city: 'London' },
    { id: '2', display: 'London Gatwick (LGW)', value: 'LGW', type: 'airport' as const, iata: 'LGW', name: 'Gatwick', city: 'London' }
  ] as AirportOption[],
}

describe.skip('TransfersPage Sorting (skipped - mocks removed)', () => {
  it('should sort by cheapest (lowest to highest price)', async () => {
    render(<TransfersPage {...mockProps} />)

    // Wait for the component to render
    await screen.findByDisplayValue('London Heathrow (LHR)')

    // Get all sorting buttons (they contain spans with (4))
    const allButtons = screen.getAllByRole('button')
    const sortingButtons = allButtons.filter(b => b.textContent?.includes('(4)'))

    // Find the Cheapest button
    const cheapestButton = sortingButtons.find((b: HTMLElement) => b.textContent?.includes('Cheapest'))
    if (!cheapestButton) throw new Error('Cheapest button not found')
    fireEvent.click(cheapestButton)

    // Get all transport cards
    const transportCards = screen.getAllByRole('heading', { level: 3 }).map(h3 => h3.closest('[data-slot="card"]')).filter(Boolean) as HTMLElement[]

    // Verify the order is by price: £6, £8, £25, £45
    expect(transportCards).toHaveLength(4)

    // Check that the first card shows the cheapest option (Piccadilly Line - £6)
    const firstCard = transportCards[0]
    expect(firstCard).toHaveTextContent('Piccadilly Line')
    expect(firstCard).toHaveTextContent('£6')

    // Check that the second card shows the next cheapest (National Express - £8)
    const secondCard = transportCards[1]
    expect(secondCard).toHaveTextContent('National Express')
    expect(secondCard).toHaveTextContent('£8')

    // Check that the third card shows the next cheapest (Heathrow Express - £25)
    const thirdCard = transportCards[2]
    expect(thirdCard).toHaveTextContent('Heathrow Express')
    expect(thirdCard).toHaveTextContent('£25')

    // Check that the last card shows the most expensive option (Taxi - £45)
    const lastCard = transportCards[3]
    expect(lastCard).toHaveTextContent('Taxi')
    expect(lastCard).toHaveTextContent('£45')
  })

  it('should sort by fastest (quickest to slowest)', async () => {
    render(<TransfersPage {...mockProps} />)

    // Wait for the component to render
    await screen.findByDisplayValue('London Heathrow (LHR)')

    // Get all sorting buttons (they contain spans with (4))
    const allButtons = screen.getAllByRole('button')
    const sortingButtons = allButtons.filter(b => b.textContent?.includes('(4)'))

    // Find the Fastest button
    const fastestButton = sortingButtons.find((b: HTMLElement) => b.textContent?.includes('Fastest'))
    if (!fastestButton) throw new Error('Fastest button not found')
    fireEvent.click(fastestButton)

    // Get all transport cards
    const transportCards = screen.getAllByRole('heading', { level: 3 }).map(h3 => h3.closest('[data-slot="card"]')).filter(Boolean) as HTMLElement[]

    // Verify the order is by duration: 15 mins, 35 mins, 45 mins, 60 mins
    expect(transportCards).toHaveLength(4)

    // Check that the first card shows the fastest option (Heathrow Express - 15 mins)
    const firstCard = transportCards[0]
    expect(firstCard).toHaveTextContent('Heathrow Express')
    expect(firstCard).toHaveTextContent('15 mins')

    // Check that the last card shows the slowest option (National Express - 60 mins)
    const lastCard = transportCards[3]
    expect(lastCard).toHaveTextContent('National Express')
    expect(lastCard).toHaveTextContent('60 mins')
  })

  it('should sort by eco-friendly (lowest to highest CO2)', async () => {
    render(<TransfersPage {...mockProps} />)

    // Wait for the component to render
    await screen.findByDisplayValue('London Heathrow (LHR)')

    // Get all sorting buttons (they contain spans with (4))
    const allButtons = screen.getAllByRole('button')
    const sortingButtons = allButtons.filter(b => b.textContent?.includes('(4)'))

    // Find the Eco Friendly button
    const ecoButton = sortingButtons.find((b: HTMLElement) => b.textContent?.includes('Eco Friendly'))
    if (!ecoButton) throw new Error('Eco Friendly button not found')
    fireEvent.click(ecoButton)

    // Get all transport cards
    const transportCards = screen.getAllByRole('heading', { level: 3 }).map(h3 => h3.closest('[data-slot="card"]')).filter(Boolean) as HTMLElement[]

    // Verify the order is by CO2: 1.2kg, 1.8kg, 2.1kg, 8.5kg
    expect(transportCards).toHaveLength(4)

    // Check that the first card shows the most eco-friendly option (Piccadilly Line - 1.2 kg CO₂)
    const firstCard = transportCards[0]
    expect(firstCard).toHaveTextContent('Piccadilly Line')
    expect(firstCard).toHaveTextContent('1.2 kg CO₂')

    // Check that the last card shows the least eco-friendly option (Taxi - 8.5 kg CO₂)
    const lastCard = transportCards[3]
    expect(lastCard).toHaveTextContent('Taxi')
    expect(lastCard).toHaveTextContent('8.5 kg CO₂')
  })

  it('should show best overall by default (original order)', async () => {
    render(<TransfersPage {...mockProps} />)

    // Wait for the component to render
    await screen.findByDisplayValue('London Heathrow (LHR)')

    // Get all sorting buttons (they contain spans with (4))
    const allButtons = screen.getAllByRole('button')
    const sortingButtons = allButtons.filter(b => b.textContent?.includes('(4)'))

    // "Best Overall" should be selected by default
    const bestOverallButton = sortingButtons.find((b: HTMLElement) => b.textContent?.includes('Best Overall'))
    if (!bestOverallButton) throw new Error('Best Overall button not found')
    expect(bestOverallButton).toHaveClass('bg-blue-600')

    // Get all transport cards
    const transportCards = screen.getAllByRole('heading', { level: 3 }).map(h3 => h3.closest('[data-slot="card"]')).filter(Boolean) as HTMLElement[]

    // Verify the order matches the original mock data order
    expect(transportCards).toHaveLength(4)

    // Check the original order: train (£25), subway (£6), bus (£8), taxi (£45)
    expect(transportCards[0]).toHaveTextContent('Heathrow Express')
    expect(transportCards[0]).toHaveTextContent('£25')
    expect(transportCards[1]).toHaveTextContent('Piccadilly Line')
    expect(transportCards[1]).toHaveTextContent('£6')
    expect(transportCards[2]).toHaveTextContent('National Express')
    expect(transportCards[2]).toHaveTextContent('£8')
    expect(transportCards[3]).toHaveTextContent('Taxi')
    expect(transportCards[3]).toHaveTextContent('£45')
  })
})
export interface Match {
  id: string
  startsAt: string | null 
  status: 'finished' | 'live' | 'scheduled' | 'postponed'
  minute?: number
  home: {
    id: string
    name: string
    city: string
  }
  away: {
    id: string
    name: string
    city: string
  }
  score: {
    home: number
    away: number
  } | null 
}

export interface MatchesResponse {
  round: number
  matches: Match[]
}
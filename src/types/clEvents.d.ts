export interface ClClub {
  name: string
  website: string | null
  instagram: string | null
}

export interface ClEvent {
  id: string
  organizer: string
  host: ClHost
  title: string
  titles: ClText
  description: string | null
  descriptions: ClText | null
  begin: Date
  end: Date | null
  startDateTime: Date
  endDateTime: Date | null
  location: string | null
  eventWebsite: string | null
  isMoodleEvent: boolean
}

export interface ScrapedClEvent {
  id: string
  organizer: string
  host: ClHost
  title: string
  titles: ClText
  description: string | null
  descriptions: ClText | null
  begin: Date | null
  end: Date | null
  startDateTime: Date | null
  endDateTime: Date | null
  location: string | null
  eventWebsite: string | null
  isMoodleEvent: boolean
}

interface ClHost {
  name: string
  website: string | null
  instagram: string | null
}

interface ClText {
  de: string
  en: string
}

export interface ManualClEventsInput {
  host: ClHost
  title: ClText
  description: ClText | null
  begin: Date
  end: Date | null
  location: string | null
  eventWebsite: string | null
}

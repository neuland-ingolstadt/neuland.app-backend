interface NeulandEvent {
  id: number
  title: {
    en: string
    de: string
  }
  description: {
    en: string | null
    de: string | null
  }
  location: string | null
  createdAt: Date
  updatedAt: Date | null
  startTime: Date | null
  endTime: Date | null
  rrule: string | null
}

export type NeulandEventInput = Omit<
  NeulandEvent,
  'id' | 'createdAt' | 'updatedAt'
>

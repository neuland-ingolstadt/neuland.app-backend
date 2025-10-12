type CampusType = 'Ingolstadt' | 'Neuburg'

type WeekdayType =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday'

type SportsCategoryType =
  | 'Basketball'
  | 'Soccer'
  | 'Calisthenics'
  | 'Dancing'
  | 'StrengthTraining'
  | 'Running'
  | 'Jogging'
  | 'Handball'
  | 'Frisbee'
  | 'Volleyball'
  | 'Spikeball'
  | 'FullBodyWorkout'
  | 'Defense'
  | 'Yoga'
  | 'Meditation'
  | 'Tennis'
  | 'Badminton'
  | 'Swimming'
  | 'Waterpolo'
  | 'Cycling'
  | 'Climbing'
  | 'Boxing'
  | 'Kickboxing'
  | 'MartialArts'
  | 'TableTennis'
  | 'Rowing'
  | 'Baseball'
  | 'Skateboarding'
  | 'Parkour'
  | 'Hiking'
  | 'Hockey'
  | 'Other'

interface UniversitySports {
  id: number
  title: {
    de: string
    en: string
  }
  description: {
    de: string | null
    en: string | null
  }
  campus: CampusType
  location: string
  weekday: WeekdayType
  startTime: string
  endTime: string | null
  requiresRegistration: boolean
  invitationLink: string | null
  eMail: string | null
  sportsCategory: SportsCategoryType | null
  createdAt: Date
  updatedAt: Date
}

interface UniversitySportInput {
  title: {
    de: string
    en: string
  }
  description: {
    de: string
    en: string
  }
  campus: CampusType
  location: string
  weekday: WeekdayType
  startTime: string
  endTime?: string
  requiresRegistration: boolean
  invitationLink?: string
  eMail?: string
  sportsCategory: SportsCategoryType
}

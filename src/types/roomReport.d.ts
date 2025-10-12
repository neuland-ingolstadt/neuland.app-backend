export interface RoomReport {
  id: number
  room: string
  reason:
    | 'WRONG_DESCRIPTION'
    | 'WRONG_LOCATION'
    | 'NOT_EXISTING'
    | 'MISSING'
    | 'OTHER'
  description: string
  createdAt: Date
  resolvedAt: Date | null
}

export interface RoomReportInput {
  room: string
  reason:
    | 'WRONG_DESCRIPTION'
    | 'WRONG_LOCATION'
    | 'NOT_EXISTING'
    | 'MISSING'
    | 'OTHER'
  description: string
}

export interface StudentCounsellingEvent {
	id: string
	title: string
	date: Date
	unlimitedSlots: boolean
	availableSlots: number | null
	totalSlots: number | null
	waitingList: number | null
	maxWaitingList: number | null
	url: string
}

import clubsData from '@/data/clubs.json'
import type { ClClub } from '@/types/clEvents'

/**
 * Returns all campus life clubs from the static clubs data
 */
export async function clClubs(): Promise<ClClub[]> {
    return clubsData.map((club) => ({
        name: club.club,
        website: club.website,
        instagram: club.instagram
    }))
}

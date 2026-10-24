import type { components } from '@neuland-ingolstadt/backend-core-api'
import { coreApiFetch } from '@/utils/core-api'
import { mapCoreSport } from '@/utils/core-api-mappers'

type SportsListResponse = components['schemas']['SportsListResponse']

export async function sports(): Promise<UniversitySports[]> {
    const data = await coreApiFetch<SportsListResponse>('/university-sports')
    return data.sports.map(mapCoreSport)
}

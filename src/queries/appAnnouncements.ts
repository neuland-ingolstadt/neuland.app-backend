import type { components } from '@neuland-ingolstadt/backend-core-api'
import type { Announcement } from '@/types/announcement'
import { coreApiFetch } from '@/utils/core-api'
import { mapCoreAnnouncement } from '@/utils/core-api-mappers'

type AnnouncementListResponse =
    components['schemas']['AnnouncementListResponse']

export async function appAnnouncementsQuery(
    _: unknown,
    args: {
        active?: boolean | null
    }
): Promise<Announcement[]> {
    // Inactive announcements require Core API auth; legacy admin listing is dropped.
    if (args.active === false) {
        return []
    }

    const data = await coreApiFetch<AnnouncementListResponse>('/announcements')
    return data.announcements.map(mapCoreAnnouncement)
}

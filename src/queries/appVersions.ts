import { db } from '@/db'
import { appVersions } from '@/db/schema/appVersions'

export async function appVersionsQuery(): Promise<AppVersionInfo | null> {
    const data = await db.select().from(appVersions).limit(1)
    if (data.length === 0) {
        return null
    }
    const version = data[0]
    return {
        id: version.id,
        warningVersion: version.warning_version,
        deprecatedVersion: version.deprecated_version,
        createdAt: version.created_at,
        updatedAt: version.updated_at,
    }
}

import { db } from '@/db'
import { appVersions } from '@/db/schema/appVersions'
import { adminRole, checkAuthorization } from '@/utils/auth-utils'
import { eq } from 'drizzle-orm'

export async function upsertAppVersion(
    _: unknown,
    { id, input }: { id: number | undefined; input: AppVersionInfoInput },
    contextValue: { jwtPayload?: { groups: string[] } }
): Promise<{ id: number }> {
    const { warningVersion, deprecatedVersion } = input
    checkAuthorization(contextValue, adminRole)

    let version
    if (id != null) {
        ;[version] = await db
            .update(appVersions)
            .set({
                warning_version: warningVersion,
                deprecated_version: deprecatedVersion,
                updated_at: new Date(),
            })
            .where(eq(appVersions.id, id))
            .returning({ id: appVersions.id })
    } else {
        ;[version] = await db
            .insert(appVersions)
            .values({
                warning_version: warningVersion,
                deprecated_version: deprecatedVersion,
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returning({ id: appVersions.id })
    }

    return { id: version.id }
}

import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { universitySports } from '@/db/schema/universitySports'
import { logAudit } from '@/utils/audit-utils'
import { checkAuthorization, sportRole } from '@/utils/auth-utils'

export async function upsertUniversitySport(
    _: unknown,
    {
        id,
        input
    }: {
        id: number | undefined
        input: UniversitySportInput
    },
    contextValue: { jwtPayload?: { groups: string[] } }
): Promise<{ id: number }> {
    const {
        title,
        description,
        campus,
        location,
        weekday,
        startTime,
        endTime,
        requiresRegistration,
        invitationLink,
        eMail,
        sportsCategory
    } = input

    checkAuthorization(contextValue, sportRole)

    let event

    if (id != null) {
        ;[event] = await db
            .update(universitySports)
            .set({
                title_de: title.de,
                title_en: title.en,
                description_de: description?.de ?? null,
                description_en: description?.en ?? null,
                campus,
                location,
                weekday,
                start_time: startTime,
                end_time: endTime,
                requires_registration: requiresRegistration,
                invitation_link: invitationLink ?? null,
                e_mail: eMail ?? null,
                sports_category: sportsCategory ?? null,
                updated_at: new Date()
            })
            .where(eq(universitySports.id, id))
            .returning({
                id: universitySports.id
            })
        try {
            await logAudit(
                'university_sports',
                event.id,
                'update',
                contextValue
            )
        } catch (error) {
            console.error('Audit logging failed:', error)
        }
    } else {
        ;[event] = await db
            .insert(universitySports)
            .values({
                title_de: title.de,
                title_en: title.en,
                description_de: description?.de ?? null,
                description_en: description?.en ?? null,
                campus,
                location,
                weekday,
                start_time: startTime,
                end_time: endTime,
                requires_registration: requiresRegistration,
                invitation_link: invitationLink ?? null,
                e_mail: eMail ?? null,
                sports_category: sportsCategory ?? null,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning({
                id: universitySports.id
            })
        try {
            await logAudit(
                'university_sports',
                event.id,
                'insert',
                contextValue
            )
        } catch (error) {
            console.error('Audit logging failed for insert operation:', error)
        }
    }
    return {
        id: event.id
    }
}

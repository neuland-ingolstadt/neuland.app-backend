import { db } from '@/db'
import { universitySports } from '@/db/schema/appAnnouncements'
import { sportRole } from '@/utils/auth-utils'
import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'
import type { JwtPayload } from 'jsonwebtoken'

export async function upsertUniversitySport(
    _: unknown,
    {
        id,
        input,
    }: {
        id: number | undefined
        input: UniversitySportInput
    },
    contextValue: { jwtPayload?: JwtPayload }
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
    } = input

    if (!contextValue.jwtPayload) {
        console.error('Not authorized: Missing JWT payload')
        throw new GraphQLError('Not authorized: Missing JWT payload')
    }

    if (!contextValue.jwtPayload.groups.includes(sportRole)) {
        console.error('Not authorized: Insufficient permissions')
        throw new GraphQLError('Not authorized: Insufficient permissions')
    }

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
                updated_at: new Date(),
            })
            .where(eq(universitySports.id, id))
            .returning({
                id: universitySports.id,
            })
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
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returning({
                id: universitySports.id,
            })
    }
    return {
        id: event.id,
    }
}

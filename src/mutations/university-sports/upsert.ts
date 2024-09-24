import { universitySports } from '@/db/schema'
import { drizzleDB } from '@/index'
import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'

interface AuthPayload {
    authRole: string
}
export async function upsertUniversitySport(
    _: unknown,
    {
        id,
        input,
    }: {
        id: number | undefined
        input: UniversitySportInput
    },
    contextValue: AuthPayload
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

    if (contextValue.authRole.includes('Manager') === false) {
        throw new GraphQLError('Not authorized')
    }

    let event

    if (id != null) {
        ;[event] = await drizzleDB
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
        ;[event] = await drizzleDB
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

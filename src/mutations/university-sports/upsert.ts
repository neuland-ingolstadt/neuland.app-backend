import { db } from '@/index'
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
        id: string | undefined
        input: UniversitySportInput
    },
    contextValue: AuthPayload
): Promise<UniversitySports> {
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
        // Perform update
        ;[event] = await db('university_sports')
            .where({ id })
            .update({
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
                updated_at: db.fn.now(),
            })
            .returning('*')
    } else {
        // Perform insert
        ;[event] = await db('university_sports')
            .insert({
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
                created_at: db.fn.now(),
                updated_at: db.fn.now(),
            })
            .returning('*')
    }
    return {
        id: event.id,
        title: {
            de: event.title_de,
            en: event.title_en,
        },
        description: {
            de: event.description_de,
            en: event.description_en,
        },
        campus: event.campus,
        location: event.location,
        weekday: event.weekday,
        startTime: event.start_time,
        endTime: event.end_time,
        requiresRegistration: event.requires_registration,
        invitationLink: event.invitation_link,
        eMail: event.e_mail,
        createdAt: new Date(event.created_at),
        updatedAt: new Date(event.updated_at),
    }
}

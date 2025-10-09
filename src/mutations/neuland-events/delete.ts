import { eq } from 'drizzle-orm'
import { GraphQLError } from 'graphql'
import { db } from '@/db'
import { neulandEvents } from '@/db/schema/neulandEvents'
import { logAudit } from '@/utils/audit-utils'
import { checkAuthorization, eventRole } from '@/utils/auth-utils'

export async function deleteNeulandEvent(
	_: unknown,
	{
		id
	}: {
		id: number
	},
	contextValue: { jwtPayload?: { groups: string[] } }
): Promise<boolean> {
	checkAuthorization(contextValue, eventRole)
	try {
		const rowsDeleted = await db
			.delete(neulandEvents)
			.where(eq(neulandEvents.id, id))
			.returning()

		if (rowsDeleted.length > 0) {
			try {
				await logAudit('neuland_events', id, 'delete', contextValue)
			} catch (error) {
				console.error('Audit logging failed for delete operation:', error)
			}
		}

		return rowsDeleted.length > 0
	} catch (error) {
		throw new GraphQLError(`Failed to delete the event with id ${id}: ${error}`)
	}
}

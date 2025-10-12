import { db } from '@/db'
import { roomReports } from '@/db/schema/roomReports'
import type { RoomReport } from '@/types/roomReport'
import { adminRole, checkAuthorization } from '@/utils/auth-utils'

export async function roomReportsQuery(
  _: unknown,
  __: unknown,
  contextValue: { jwtPayload?: { groups: string[] } }
): Promise<RoomReport[]> {
  checkAuthorization(contextValue, adminRole)
  const data = await db.select().from(roomReports)

  return data.map((report) => ({
    id: report.id,
    room: report.room,
    reason: report.reason,
    description: report.description,
    createdAt: report.created_at,
    resolvedAt: report.resolved_at || null
  }))
}

import * as appAnnouncements from '@/db/schema/appAnnouncements'
import * as auditLog from '@/db/schema/auditLog'
import * as manualClEvents from '@/db/schema/manualClEvents'
import * as roomReports from '@/db/schema/roomReports'
import * as universitySports from '@/db/schema/universitySports'
import { deleteManualClEvent } from '@/mutations/manual-cl-events/delete'

export default {
  ...appAnnouncements,
  ...universitySports,
  ...roomReports,
  ...manualClEvents,
  ...auditLog,
  ...deleteManualClEvent
}

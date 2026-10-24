import * as appAnnouncements from '@/db/schema/appAnnouncements'
import * as auditLog from '@/db/schema/auditLog'
import * as manualClEvents from '@/db/schema/manualClEvents'
import * as neulandEvents from '@/db/schema/neulandEvents'
import * as roomReports from '@/db/schema/roomReports'
import * as universitySports from '@/db/schema/universitySports'

export default {
    ...appAnnouncements,
    ...universitySports,
    ...roomReports,
    ...manualClEvents,
    ...neulandEvents,
    ...auditLog
}

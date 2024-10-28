import * as appAnnouncements from '@/db/schema/appAnnouncements'
import * as food from '@/db/schema/food'
import * as roomReports from '@/db/schema/roomReports'
import * as universitySports from '@/db/schema/universitySports'

export default {
    ...appAnnouncements,
    ...universitySports,
    ...food,
    ...roomReports,
}

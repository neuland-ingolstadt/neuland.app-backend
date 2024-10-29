import * as appAnnouncements from '@/db/schema/appAnnouncements'
import * as mealRatings from '@/db/schema/mealRatings'
import * as roomReports from '@/db/schema/roomReports'
import * as universitySports from '@/db/schema/universitySports'

export default {
    ...appAnnouncements,
    ...universitySports,
    ...roomReports,
    ...mealRatings,
}

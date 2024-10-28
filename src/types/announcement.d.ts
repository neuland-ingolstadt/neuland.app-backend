enum AppPlatformEnum {
    ANDROID = 'ANDROID',
    IOS = 'IOS',
    WEB = 'WEB',
    WEB_DEV = 'WEB_DEV',
}

enum UserKindEnum {
    STUDENT = 'STUDENT',
    EMPLOYEE = 'EMPLOYEE',
    GUEST = 'GUEST',
}

interface Announcement {
    id: number
    platform: AppPlatformEnum[]
    userKind: UserKindEnum[]
    title: {
        de: string
        en: string
    }
    description: {
        de: string
        en: string
    }
    startDateTime: Date | string
    endDateTime: Date | string
    priority: number
    url: string | null
    createdAt: Date
    updatedAt: Date
}

interface AnnouncementInput {
    platform: AppPlatformEnum[]
    userKind: UserKindEnum[]
    title: {
        de: string
        en: string
    }
    description: {
        de: string
        en: string
    }
    startDateTime: Date
    endDateTime: Date
    priority: number
    url: string | null
}

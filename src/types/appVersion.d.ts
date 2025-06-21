interface AppVersionInfo {
    id: number
    warningVersion: string
    deprecatedVersion: string
    createdAt: Date
    updatedAt: Date
}

interface AppVersionInfoInput {
    warningVersion: string
    deprecatedVersion: string
}

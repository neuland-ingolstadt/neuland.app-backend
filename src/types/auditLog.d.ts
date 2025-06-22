interface AuditLogEntry {
    id: number
    entity: string
    entityId: number | null
    operation: string
    email: string | null
    userId: string | null
    createdAt: Date
}

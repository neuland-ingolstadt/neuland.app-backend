interface AuditLogEntry {
    id: number
    entity: string
    entityId: number | null
    operation: string
    name: string | null
    userId: string | null
    createdAt: Date
}

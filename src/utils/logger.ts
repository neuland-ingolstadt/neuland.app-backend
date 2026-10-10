type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogContext = Record<string, unknown>

const LEVEL_ORDER: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40
}

function resolveLevel(): LogLevel {
    const raw = (Bun.env.LOG_LEVEL ?? '').toLowerCase()
    if (
        raw === 'debug' ||
        raw === 'info' ||
        raw === 'warn' ||
        raw === 'error'
    ) {
        return raw
    }
    return Bun.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

function resolveFormat(): 'json' | 'pretty' {
    const raw = (Bun.env.LOG_FORMAT ?? '').toLowerCase()
    if (raw === 'json' || raw === 'pretty') {
        return raw
    }
    return Bun.env.NODE_ENV === 'production' ? 'json' : 'pretty'
}

const COLORS: Record<LogLevel, string> = {
    debug: '\x1b[36m',
    info: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m'
}
const DIM = '\x1b[2m'
const RESET = '\x1b[0m'

function useColors(): boolean {
    if (Bun.env.NO_COLOR === '1' || Bun.env.NO_COLOR === 'true') {
        return false
    }
    return resolveFormat() === 'pretty'
}

function normalizeContext(context?: LogContext): LogContext {
    if (!context) {
        return {}
    }
    const out: LogContext = { ...context }
    const err = out.err ?? out.error
    if (err instanceof Error) {
        out.err = {
            name: err.name,
            message: err.message,
            stack: err.stack
        }
        delete out.error
    }
    for (const [key, value] of Object.entries(out)) {
        if (value instanceof Error) {
            out[key] = {
                name: value.name,
                message: value.message,
                stack: value.stack
            }
        }
    }
    return out
}

function safeJson(value: unknown): string {
    try {
        return JSON.stringify(value)
    } catch {
        return '"[unserializable]"'
    }
}

class Logger {
    private bindings: LogContext

    constructor(bindings: LogContext = {}) {
        this.bindings = bindings
    }

    child(bindings: LogContext): Logger {
        return new Logger({ ...this.bindings, ...bindings })
    }

    debug(msg: string, context?: LogContext): void {
        this.emit('debug', msg, context)
    }

    info(msg: string, context?: LogContext): void {
        this.emit('info', msg, context)
    }

    warn(msg: string, context?: LogContext): void {
        this.emit('warn', msg, context)
    }

    error(msg: string, context?: LogContext): void {
        this.emit('error', msg, context)
    }

    private emit(level: LogLevel, msg: string, context?: LogContext): void {
        if (LEVEL_ORDER[level] < LEVEL_ORDER[resolveLevel()]) {
            return
        }
        const timestamp = new Date().toISOString()
        const fields = normalizeContext({ ...this.bindings, ...context })

        if (resolveFormat() === 'json') {
            const line = safeJson({
                timestamp,
                level,
                msg,
                service: 'neuland.app-backend',
                env: Bun.env.NODE_ENV ?? 'development',
                ...fields
            })
            if (level === 'warn' || level === 'error') {
                console.error(line)
            } else {
                console.log(line)
            }
            return
        }

        const colors = useColors()
        const levelLabel = level.toUpperCase().padEnd(5)
        const prefix = colors
            ? `${DIM}${timestamp}${RESET} ${COLORS[level]}${levelLabel}${RESET}`
            : `${timestamp} ${levelLabel}`
        const extraKeys = Object.keys(fields)
        const suffix = extraKeys.length > 0 ? ` ${safeJson(fields)}` : ''
        const line = `${prefix} ${msg}${suffix}`
        if (level === 'warn' || level === 'error') {
            console.error(line)
        } else {
            console.log(line)
        }
    }
}

export const logger = new Logger()

export type { LogLevel }

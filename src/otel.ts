import type { IncomingMessage } from 'node:http'
import {
    type Context,
    context,
    propagation,
    type Span,
    SpanKind,
    SpanStatusCode,
    trace
} from '@opentelemetry/api'
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks'
import { W3CTraceContextPropagator } from '@opentelemetry/core'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import {
    ATTR_HTTP_REQUEST_METHOD,
    ATTR_HTTP_RESPONSE_STATUS_CODE,
    ATTR_SERVICE_NAME,
    ATTR_URL_PATH
} from '@opentelemetry/semantic-conventions'
import {
    ATTR_GRAPHQL_OPERATION_NAME,
    ATTR_GRAPHQL_OPERATION_TYPE
} from '@opentelemetry/semantic-conventions/incubating'
import type { Request, Response } from 'express'
import { logger } from '@/utils/logger'

const DEFAULT_SERVICE_NAME = 'neuland.app-backend'

let provider: NodeTracerProvider | null = null
let enabled = false

const requestContexts = new WeakMap<IncomingMessage, Context>()

export function isTracingEnabled(): boolean {
    return enabled
}

export function getTracer() {
    return trace.getTracer(
        Bun.env.OTEL_SERVICE_NAME?.trim() || DEFAULT_SERVICE_NAME
    )
}

/**
 * Starts the OTLP tracer provider when `OTEL_EXPORTER_OTLP_ENDPOINT`
 * (or `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT`) is set. No-op otherwise.
 */
export function initTracing(): boolean {
    const tracesEndpoint = Bun.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT?.trim()
    const baseEndpoint = Bun.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim()
    if (!tracesEndpoint && !baseEndpoint) {
        return false
    }

    const url = tracesEndpoint ?? normalizeOtlpTracesUrl(baseEndpoint as string)
    const serviceName =
        Bun.env.OTEL_SERVICE_NAME?.trim() || DEFAULT_SERVICE_NAME
    const headers = parseOtlpHeaders(Bun.env.OTEL_EXPORTER_OTLP_HEADERS)

    const exporter = new OTLPTraceExporter({
        url,
        ...(headers ? { headers } : {})
    })

    provider = new NodeTracerProvider({
        resource: resourceFromAttributes({
            [ATTR_SERVICE_NAME]: serviceName
        }),
        spanProcessors: [new BatchSpanProcessor(exporter)]
    })

    provider.register({
        contextManager: new AsyncLocalStorageContextManager(),
        propagator: new W3CTraceContextPropagator()
    })

    enabled = true
    logger.info('OpenTelemetry tracing enabled', {
        endpoint: url,
        serviceName
    })
    return true
}

export async function shutdownTracing(): Promise<void> {
    if (!provider) {
        return
    }
    try {
        await provider.shutdown()
    } catch (err) {
        logger.error('Failed to shut down OpenTelemetry tracing', { err })
    } finally {
        provider = null
        enabled = false
    }
}

export function getRequestOtelContext(
    req: IncomingMessage
): Context | undefined {
    return requestContexts.get(req)
}

/**
 * Starts an HTTP server span, binds it to ALS + the request WeakMap, and ends
 * it when the response finishes. Runs `next` inside the span context.
 */
export function withHttpSpan(
    req: Request,
    res: Response,
    requestId: string,
    next: () => void
): void {
    if (!enabled) {
        next()
        return
    }

    const path = req.originalUrl.split('?')[0]
    const parentContext = propagation.extract(context.active(), req.headers)
    const span = getTracer().startSpan(
        `${req.method} ${path}`,
        {
            kind: SpanKind.SERVER,
            attributes: {
                [ATTR_HTTP_REQUEST_METHOD]: req.method,
                [ATTR_URL_PATH]: path,
                'http.request_id': requestId
            }
        },
        parentContext
    )
    const spanContext = trace.setSpan(parentContext, span)
    requestContexts.set(req, spanContext)

    let ended = false
    const endSpan = () => {
        if (ended) {
            return
        }
        ended = true
        span.setAttribute(ATTR_HTTP_RESPONSE_STATUS_CODE, res.statusCode)
        if (res.statusCode >= 500) {
            span.setStatus({ code: SpanStatusCode.ERROR })
        }
        span.end()
    }

    res.on('finish', endSpan)
    res.on('close', endSpan)

    context.with(spanContext, next)
}

export type GraphQLTraceHandle = {
    span: Span
    end: (errorMessages: string[]) => void
    recordErrors: (errors: readonly Error[]) => void
}

/**
 * Starts a GraphQL child span under the HTTP request context when tracing is on.
 */
export function startGraphQLSpan(
    operationName: string,
    parentContext?: Context
): GraphQLTraceHandle | null {
    if (!enabled) {
        return null
    }

    const parent = parentContext ?? context.active()
    const span = getTracer().startSpan(
        `graphql ${operationName}`,
        {
            kind: SpanKind.INTERNAL,
            attributes: {
                [ATTR_GRAPHQL_OPERATION_NAME]: operationName
            }
        },
        parent
    )

    return {
        span,
        recordErrors(errors) {
            for (const err of errors) {
                span.recordException(err)
            }
            span.setStatus({ code: SpanStatusCode.ERROR })
        },
        end(errorMessages) {
            if (errorMessages.length > 0) {
                span.setAttribute('graphql.errors', errorMessages)
                span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: errorMessages.join('; ')
                })
            }
            span.end()
        }
    }
}

export function setGraphQLOperationType(
    handle: GraphQLTraceHandle | null,
    operationType: string,
    operationName: string
): void {
    if (!handle) {
        return
    }
    handle.span.updateName(`${operationType} ${operationName}`)
    handle.span.setAttribute(ATTR_GRAPHQL_OPERATION_TYPE, operationType)
}

function normalizeOtlpTracesUrl(endpoint: string): string {
    const base = endpoint.replace(/\/$/, '')
    if (base.endsWith('/v1/traces')) {
        return base
    }
    return `${base}/v1/traces`
}

function parseOtlpHeaders(raw?: string): Record<string, string> | undefined {
    if (!raw?.trim()) {
        return undefined
    }
    const headers: Record<string, string> = {}
    for (const part of raw.split(',')) {
        const idx = part.indexOf('=')
        if (idx <= 0) {
            continue
        }
        const key = part.slice(0, idx).trim()
        const value = part.slice(idx + 1).trim()
        if (key) {
            headers[key] = value
        }
    }
    return Object.keys(headers).length > 0 ? headers : undefined
}

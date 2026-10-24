import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ApolloServer } from '@apollo/server'
import { GraphQLScalarType, Kind } from 'graphql'
import {
	DateTimeResolver,
	EmailAddressResolver,
	LocalEndTimeResolver,
	URLResolver
} from 'graphql-scalars'
import { createRoomReport } from '../src/mutations/room-reports/create'
import { appAnnouncementsQuery } from '../src/queries/appAnnouncements'
import { sports } from '../src/queries/sports'

const PROD = 'https://api.neuland.app/graphql'

const schemaFiles = [
	'enums.gql',
	'scalars.gql',
	'types.gql',
	'inputs.gql',
	'schema.gql'
]
const schemaDir = path.join(import.meta.dir, '../src/schema')
const typeDefs = schemaFiles.map((file) =>
	readFileSync(path.join(schemaDir, file), 'utf-8')
)

const LocationInput = new GraphQLScalarType({
	name: 'LocationInput',
	parseValue: (value) => value,
	serialize: (value) => value,
	parseLiteral(ast) {
		if (ast.kind === Kind.STRING || ast.kind === Kind.ENUM) return ast.value
		throw new Error('LocationInput must be a string or enum')
	}
})

// Avoid importing ../src/resolvers (pulls food → index.ts circular bootstrap).
const resolvers = {
	Query: {
		appAnnouncements: appAnnouncementsQuery,
		universitySports: sports,
		food: () => {
			throw new Error('food compared separately against prod only')
		}
	},
	Mutation: { createRoomReport },
	LocalTime: LocalEndTimeResolver,
	DateTime: DateTimeResolver,
	EmailAddress: EmailAddressResolver,
	URL: URLResolver,
	LocationInput
}

const localServer = new ApolloServer({ typeDefs, resolvers })
await localServer.start()

async function prodGql<T>(
	query: string,
	variables?: Record<string, unknown>
): Promise<T> {
	const resp = await fetch(PROD, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify({ query, variables })
	})
	const json = (await resp.json()) as { data?: T; errors?: unknown }
	if (json.errors) {
		throw new Error(`prod errors: ${JSON.stringify(json.errors, null, 2)}`)
	}
	return json.data as T
}

async function localGql<T>(
	query: string,
	variables?: Record<string, unknown>
): Promise<T> {
	const result = await localServer.executeOperation({
		query,
		variables
	})
	if (result.body.kind !== 'single') {
		throw new Error('expected single result')
	}
	const { data, errors } = result.body.singleResult
	if (errors?.length) {
		throw new Error(`local errors: ${JSON.stringify(errors, null, 2)}`)
	}
	return data as T
}

function normalize(v: unknown): unknown {
	if (v == null) return null
	if (typeof v === 'string') {
		const d = Date.parse(v)
		if (!Number.isNaN(d) && /\d{4}-\d{2}-\d{2}T/.test(v)) {
			return new Date(d).toISOString()
		}
		return v
	}
	if (Array.isArray(v)) return v.map(normalize)
	if (typeof v === 'object') {
		const out: Record<string, unknown> = {}
		for (const k of Object.keys(v as object).sort()) {
			out[k] = normalize((v as Record<string, unknown>)[k])
		}
		return out
	}
	return v
}

function byId(list: Array<Record<string, unknown>>) {
	return Object.fromEntries(
		list.map((x) => [String(x.id), normalize(x) as Record<string, unknown>])
	)
}

function compare(
	name: string,
	prodList: Array<Record<string, unknown>>,
	localList: Array<Record<string, unknown>>
) {
	const a = byId(prodList)
	const b = byId(localList)
	const prodIds = Object.keys(a)
	const localIds = Object.keys(b)
	const onlyProd = prodIds.filter((id) => !(id in b))
	const onlyLocal = localIds.filter((id) => !(id in a))
	const shared = prodIds.filter((id) => id in b)

	const contentDiffs: Array<{
		id: string
		fieldDiffs: Record<string, { prod: unknown; local: unknown }>
	}> = []
	const formatDiffs: typeof contentDiffs = []

	for (const id of shared) {
		const fields = new Set([...Object.keys(a[id]), ...Object.keys(b[id])])
		const fieldDiffs: Record<string, { prod: unknown; local: unknown }> = {}
		for (const f of fields) {
			if (JSON.stringify(a[id][f]) !== JSON.stringify(b[id][f])) {
				fieldDiffs[f] = { prod: a[id][f], local: b[id][f] }
			}
		}
		if (Object.keys(fieldDiffs).length === 0) continue

		const onlyContent =
			Object.keys(fieldDiffs).every((f) =>
				['title', 'description', 'location', 'invitationLink', 'eMail'].includes(
					f
				)
			) &&
			Object.values(fieldDiffs).every(({ prod, local }) => {
				// treat trailing whitespace / newline-only content drift as content
				const p = JSON.stringify(prod)
				const l = JSON.stringify(local)
				return (
					typeof prod === 'string' ||
					typeof local === 'string' ||
					(typeof prod === 'object' && typeof local === 'object')
				) && p.replace(/\\n/g, '').trim() !== l.replace(/\\n/g, '').trim()
					? true
					: p.replace(/\s+/g, '') !== l.replace(/\s+/g, '')
			})

		// Heuristic: id/type/enum/nullability → format; text body → content
		const formatFields = Object.keys(fieldDiffs).filter(
			(f) =>
				!['title', 'description', 'location', 'invitationLink', 'eMail'].includes(
					f
				)
		)
		if (formatFields.length) {
			formatDiffs.push({
				id,
				fieldDiffs: Object.fromEntries(
					formatFields.map((f) => [f, fieldDiffs[f]])
				)
			})
		}
		const contentFields = Object.keys(fieldDiffs).filter((f) =>
			['title', 'description', 'location', 'invitationLink', 'eMail'].includes(f)
		)
		if (contentFields.length) {
			contentDiffs.push({
				id,
				fieldDiffs: Object.fromEntries(
					contentFields.map((f) => [f, fieldDiffs[f]])
				)
			})
		}
		void onlyContent
	}

	console.log(`\n=== ${name} (GraphQL wire) ===`)
	console.log(`prod=${prodList.length} local=${localList.length}`)
	console.log(`set mismatch onlyProd=${onlyProd.length} onlyLocal=${onlyLocal.length}`)
	console.log(
		`byte-identical=${shared.length - formatDiffs.length - contentDiffs.length}/${shared.length}`
	)
	console.log(`format diffs=${formatDiffs.length}`)
	if (formatDiffs.length) {
		console.log(JSON.stringify(formatDiffs.slice(0, 5), null, 2))
	}
	console.log(`content diffs=${contentDiffs.length}`)
	if (contentDiffs.length) {
		console.log(JSON.stringify(contentDiffs.slice(0, 5), null, 2))
	}

	return {
		onlyProd,
		onlyLocal,
		formatDiffs,
		contentDiffs,
		identical:
			onlyProd.length === 0 &&
			onlyLocal.length === 0 &&
			formatDiffs.length === 0 &&
			contentDiffs.length === 0
	}
}

const ANN_Q = `query {
  appAnnouncements(active: true) {
    id title { de en } description { de en }
    startDateTime endDateTime priority url platform userKind imageUrl
  }
}`

const SPORTS_Q = `query {
  universitySports {
    id title { de en } description { de en }
    campus location weekday startTime endTime
    requiresRegistration invitationLink eMail sportsCategory
  }
}`

const FOOD_Q = `query ($locations: [LocationInput!]!) {
  food(locations: $locations) {
    foodData {
      timestamp
      meals {
        id mealId name { de en } category
        prices { student employee guest }
        allergens flags originalLanguage static restaurant
      }
    }
    errors { location message }
  }
}`

const [prodAnn, localAnn] = await Promise.all([
	prodGql<{ appAnnouncements: Array<Record<string, unknown>> }>(ANN_Q),
	localGql<{ appAnnouncements: Array<Record<string, unknown>> }>(ANN_Q)
])

const [prodSports, localSports] = await Promise.all([
	prodGql<{ universitySports: Array<Record<string, unknown>> | null }>(
		SPORTS_Q
	),
	localGql<{ universitySports: Array<Record<string, unknown>> | null }>(
		SPORTS_Q
	)
])

const ann = compare(
	'appAnnouncements',
	prodAnn.appAnnouncements,
	localAnn.appAnnouncements
)
const sp = compare(
	'universitySports',
	prodSports.universitySports ?? [],
	localSports.universitySports ?? []
)

// Food stays on local scrapers (not Core-proxied). Spot-check prod shape only.
const foodVars = { locations: ['IngolstadtMensa', 'Reimanns'] }
const prodFood = await prodGql<{ food: Record<string, unknown> }>(
	FOOD_Q,
	foodVars
)
const foodData = prodFood.food?.foodData as unknown[] | null | undefined
console.log('\n=== food (prod only; not proxied) ===')
console.log('keys', Object.keys(prodFood.food ?? {}).sort())
console.log('days', Array.isArray(foodData) ? foodData.length : foodData)

const room = await localGql<{ createRoomReport: { id: string } }>(
	`mutation ($input: RoomReportInput!) {
    createRoomReport(input: $input) { id }
  }`,
	{
		input: {
			room: 'PROXY-COMPARE',
			reason: 'OTHER',
			description: 'wire-format compare; ignore'
		}
	}
)
console.log('\n=== createRoomReport local wire ===', room.createRoomReport)
console.log('id is string:', typeof room.createRoomReport?.id === 'string')

await localServer.stop()

const formatOk =
	ann.formatDiffs.length === 0 &&
	sp.formatDiffs.length === 0 &&
	ann.onlyProd.length === 0 &&
	ann.onlyLocal.length === 0 &&
	sp.onlyProd.length === 0 &&
	sp.onlyLocal.length === 0

console.log('\n=== VERDICT ===')
console.log(
	formatOk
		? 'FORMAT COMPATIBLE (wire types/enums/nullability match)'
		: 'FORMAT MISMATCH'
)
if (ann.contentDiffs.length || sp.contentDiffs.length) {
	console.log(
		'Note: some text content differs between prod DB and Core API data.'
	)
}
process.exit(formatOk ? 0 : 1)

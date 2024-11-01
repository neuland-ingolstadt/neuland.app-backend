import NodeCache from 'node-cache'
import { Pool } from 'pg'

import { getCanisiusPlan } from './food/canisius'
import { getMensaPlan } from './food/mensa'
import { getReimannsPlan } from './food/reimanns'
import { upsertMealWithNutrition } from './utils/db-utils'

export const pool = new Pool({
    host: Bun.env.DB_HOST,
    port: Number(Bun.env.DB_PORT),
    user: Bun.env.POSTGRES_USER,
    password: Bun.env.POSTGRES_PASSWORD,
    database: Bun.env.POSTGRES_DB,
})

export const cache = new NodeCache({ stdTTL: 60 * 10 }) // 10 minutes default TTL

// Example usage
const mensa = await getMensaPlan('INGOLSTADT_MENSA')
const neuburg = await getMensaPlan('NEUBURG_MENSA')
const canisius = await getCanisiusPlan()
const reimanns = await getReimannsPlan()

const meals = [...mensa, ...neuburg, ...canisius, ...reimanns]

for (const day of meals) {
    console.log(`Upserting meals for ${day.timestamp}`)
    for (const meal of day.meals) {
        await upsertMealWithNutrition(meal, new Date(day.timestamp))
    }
}

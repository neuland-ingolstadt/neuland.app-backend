import NodeCache from 'node-cache'
import cron from 'node-cron'
import { Pool } from 'pg'

import { getCanisiusPlan } from './food/canisius'
import { getMensaPlan } from './food/mensa'
import { getReimannsPlan } from './food/reimanns'
import { removeOldMeals, upsertMealWithNutrition3 } from './utils/db-utils'
import { Restaurant } from './utils/food-utils'

export const pool = new Pool({
    host: Bun.env.DB_HOST,
    port: Number(Bun.env.DB_PORT),
    user: Bun.env.POSTGRES_USER,
    password: Bun.env.POSTGRES_PASSWORD,
    database: Bun.env.POSTGRES_DB,
})

export const cache = new NodeCache({ stdTTL: 60 * 10 }) // 10 minutes default TTL

const fetchMeals = async () => {
    const mensa = await getMensaPlan(Restaurant.INGOLSTADT_MENSA)
    const neuburg = await getMensaPlan(Restaurant.NEUBURG_MENSA)
    const canisius = await getCanisiusPlan()
    const reimanns = await getReimannsPlan()
    return [...mensa, ...neuburg, ...canisius, ...reimanns]
}

cron.schedule('*/30 * * * *', async () => {
    const meals = await fetchMeals()
    console.time('Total Time with merge conflict resolution')
    for (const day of meals) {
        for (const meal of day.meals) {
            await upsertMealWithNutrition3(meal, new Date(day.timestamp))
        }
    }
    console.timeEnd('Total Time with merge conflict resolution')
})

const meals = await fetchMeals()
console.time('Total Time with merge conflict resolution')
for (const day of meals) {
    for (const meal of day.meals) {
        await upsertMealWithNutrition3(meal, new Date(day.timestamp))
    }
}
console.timeEnd('Total Time with merge conflict resolution')

// delete old meals
removeOldMeals(
    meals.flatMap((day) => day.meals),
    new Date(meals[0].timestamp)
)

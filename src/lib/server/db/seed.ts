/**
 * Database seed — populates a user with realistic data.
 *
 * Run with: pnpm db:seed            (targets the default user below)
 *           pnpm db:seed someuser   (targets a specific username)
 *
 * Runs outside SvelteKit, so it reads DATABASE_URL straight from .env and builds
 * its own drizzle client (it must NOT import $lib/server/db, which depends on $env).
 *
 * It wipes the target user's existing payments/tags/budgets, then inserts fresh
 * data so reruns stay clean.
 */
import * as fs from 'node:fs'
import * as path from 'node:path'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq, inArray } from 'drizzle-orm'
import * as schema from './schema'
import { budget, payment, paymentsToTags, tag, user } from './schema'

const TARGET_USERNAME = process.argv[2] ?? 'spider_penguin'

// --- env ---------------------------------------------------------------------
function loadDatabaseUrl(): string {
	if (process.env.DATABASE_URL) return process.env.DATABASE_URL
	try {
		const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8')
		for (const line of envFile.split('\n')) {
			const m = line.match(/^\s*DATABASE_URL\s*=\s*(.*)\s*$/)
			if (m) return m[1].replace(/^["']|["']$/g, '').trim()
		}
	} catch {
		// ignore — fall through to the error below
	}
	throw new Error('DATABASE_URL is not set (checked process.env and .env)')
}

const client = postgres(loadDatabaseUrl())
const db = drizzle(client, { schema })

const daysAgo = (n: number, hour = 12) => {
	const d = new Date()
	d.setDate(d.getDate() - n)
	d.setHours(hour, 0, 0, 0)
	return d
}

// --- seed data ---------------------------------------------------------------
const TAGS: { name: string; color: string; icon: string; budget: number | null }[] = [
	{ name: 'Groceries', color: 'sage', icon: 'ShoppingBasket', budget: 500 },
	{ name: 'Dining', color: 'sand', icon: 'UtensilsCrossed', budget: 250 },
	{ name: 'Coffee', color: 'sand', icon: 'Coffee', budget: 60 },
	{ name: 'Transport', color: 'sky', icon: 'Bus', budget: 160 },
	{ name: 'Fuel', color: 'clay', icon: 'Fuel', budget: 120 },
	{ name: 'Rent', color: 'lilac', icon: 'House', budget: 2150 },
	{ name: 'Utilities', color: 'olive', icon: 'Plug', budget: 200 },
	{ name: 'Internet', color: 'teal', icon: 'Wifi', budget: 150 },
	{ name: 'Subscriptions', color: 'rose', icon: 'Repeat', budget: 80 },
	{ name: 'Fitness', color: 'olive', icon: 'Dumbbell', budget: 245 },
	{ name: 'Shopping', color: 'teal', icon: 'ShoppingBag', budget: 200 },
	{ name: 'Health', color: 'rose', icon: 'Pill', budget: 80 }
]

type SeedPayment = { daysAgo: number; note: string; dollars: number; tags: string[] }

// Recurring bills appear in both the current and the previous month.
function recurringBills(offset: number): SeedPayment[] {
	return [
		{ daysAgo: offset + 0, note: 'Greenpoint Apartments', dollars: 2150, tags: ['Rent'] },
		{ daysAgo: offset + 2, note: 'Comcast', dollars: 79, tags: ['Internet'] },
		{ daysAgo: offset + 3, note: 'ConEd', dollars: 92, tags: ['Utilities'] },
		{ daysAgo: offset + 5, note: 'Spotify', dollars: 12, tags: ['Subscriptions'] },
		{ daysAgo: offset + 5, note: 'Netflix', dollars: 15, tags: ['Subscriptions'] },
		{ daysAgo: offset + 8, note: 'Equinox', dollars: 245, tags: ['Fitness'] },
		{ daysAgo: offset + 10, note: 'Verizon', dollars: 70, tags: ['Internet', 'Utilities'] }
	]
}

const PAYMENTS: SeedPayment[] = [
	// --- this month / last ~30 days ---
	{ daysAgo: 0, note: 'Blue Bottle', dollars: 6, tags: ['Coffee'] },
	{ daysAgo: 0, note: "Trader Joe's", dollars: 64, tags: ['Groceries'] },
	{ daysAgo: 1, note: 'Sweetgreen', dollars: 16, tags: ['Dining'] },
	{ daysAgo: 1, note: 'MTA Subway', dollars: 33, tags: ['Transport'] },
	{ daysAgo: 2, note: 'Stumptown', dollars: 5, tags: ['Coffee'] },
	{ daysAgo: 2, note: 'Shell', dollars: 48, tags: ['Fuel', 'Transport'] },
	{ daysAgo: 3, note: 'Whole Foods', dollars: 118, tags: ['Groceries'] },
	{ daysAgo: 4, note: "Joe's Pizza", dollars: 13, tags: ['Dining'] },
	{ daysAgo: 4, note: 'CVS Pharmacy', dollars: 23, tags: ['Health'] },
	{ daysAgo: 5, note: 'Lyft', dollars: 22, tags: ['Transport'] },
	{ daysAgo: 6, note: 'Blue Bottle', dollars: 6, tags: ['Coffee'] },
	{ daysAgo: 6, note: 'Uniqlo', dollars: 90, tags: ['Shopping'] },
	{ daysAgo: 7, note: "Trader Joe's", dollars: 52, tags: ['Groceries'] },
	{ daysAgo: 8, note: 'Chipotle', dollars: 14, tags: ['Dining'] },
	{ daysAgo: 9, note: 'Uber Eats', dollars: 29, tags: ['Dining'] },
	{ daysAgo: 10, note: 'Citi Bike', dollars: 19, tags: ['Transport'] },
	{ daysAgo: 11, note: 'Whole Foods', dollars: 73, tags: ['Groceries'] },
	{ daysAgo: 12, note: 'Stumptown', dollars: 5, tags: ['Coffee'] },
	{ daysAgo: 13, note: 'Walgreens', dollars: 19, tags: ['Health'] },
	{ daysAgo: 14, note: 'Sweetgreen', dollars: 17, tags: ['Dining'] },
	{ daysAgo: 15, note: 'Shell', dollars: 45, tags: ['Fuel', 'Transport'] },
	{ daysAgo: 16, note: "Trader Joe's", dollars: 59, tags: ['Groceries'] },
	{ daysAgo: 18, note: 'Amazon', dollars: 42, tags: ['Shopping'] },
	{ daysAgo: 19, note: 'Blue Bottle', dollars: 6, tags: ['Coffee'] },
	{ daysAgo: 20, note: 'Thai Villa', dollars: 39, tags: ['Dining'] },
	{ daysAgo: 22, note: 'MTA Subway', dollars: 33, tags: ['Transport'] },
	{ daysAgo: 24, note: 'Whole Foods', dollars: 96, tags: ['Groceries'] },
	{ daysAgo: 26, note: 'Nike', dollars: 120, tags: ['Shopping', 'Fitness'] },
	{ daysAgo: 28, note: 'Stumptown', dollars: 5, tags: ['Coffee'] },
	// --- last month ---
	{ daysAgo: 33, note: "Trader Joe's", dollars: 61, tags: ['Groceries'] },
	{ daysAgo: 35, note: 'Lyft', dollars: 27, tags: ['Transport'] },
	{ daysAgo: 37, note: 'Sweetgreen', dollars: 16, tags: ['Dining'] },
	{ daysAgo: 39, note: 'Blue Bottle', dollars: 6, tags: ['Coffee'] },
	{ daysAgo: 41, note: 'Whole Foods', dollars: 104, tags: ['Groceries'] },
	{ daysAgo: 44, note: 'Shell', dollars: 48, tags: ['Fuel', 'Transport'] },
	{ daysAgo: 46, note: 'Uber Eats', dollars: 31, tags: ['Dining'] },
	{ daysAgo: 49, note: 'CVS Pharmacy', dollars: 28, tags: ['Health'] },
	{ daysAgo: 52, note: "Trader Joe's", dollars: 56, tags: ['Groceries'] },
	{ daysAgo: 55, note: 'Amazon', dollars: 65, tags: ['Shopping'] },
	{ daysAgo: 58, note: 'Stumptown', dollars: 5, tags: ['Coffee'] },
	...recurringBills(1),
	...recurringBills(31)
]

// Budgets: a current monthly cap and a previous, non-intersecting one. Whole dollars.
function monthRange(monthsBack: number) {
	const ref = new Date()
	const start = new Date(ref.getFullYear(), ref.getMonth() - monthsBack, 1)
	const end = new Date(ref.getFullYear(), ref.getMonth() - monthsBack + 1, 0)
	return { start, end }
}

const BUDGETS = [
	{ dollars: 5000, ...monthRange(0) },
	{ dollars: 5000, ...monthRange(1) }
]

// --- run ---------------------------------------------------------------------
async function main() {
	const target = (
		await db
			.select({ id: user.id, username: user.username })
			.from(user)
			.where(eq(user.username, TARGET_USERNAME))
			.limit(1)
	).at(0)

	if (!target) {
		throw new Error(
			`User "${TARGET_USERNAME}" not found — register that account first, or pass a username: pnpm db:seed <username>`
		)
	}
	console.log(`Seeding data for user "${target.username}" (${target.id})`)

	// Wipe this user's existing data so reruns stay clean.
	const existingPayments = await db.select({ id: payment.id }).from(payment).where(eq(payment.userId, target.id))
	const existingTags = await db.select({ id: tag.id }).from(tag).where(eq(tag.userId, target.id))
	const paymentIds = existingPayments.map((p) => p.id)
	const tagIds = existingTags.map((t) => t.id)

	if (paymentIds.length) await db.delete(paymentsToTags).where(inArray(paymentsToTags.paymentId, paymentIds))
	if (tagIds.length) await db.delete(paymentsToTags).where(inArray(paymentsToTags.tagId, tagIds))
	await db.delete(payment).where(eq(payment.userId, target.id))
	await db.delete(budget).where(eq(budget.userId, target.id))
	await db.delete(tag).where(eq(tag.userId, target.id))

	// Tags.
	const insertedTags = await db
		.insert(tag)
		.values(TAGS.map((t) => ({ ...t, userId: target.id })))
		.returning({ id: tag.id, name: tag.name })
	const tagIdByName = new Map(insertedTags.map((t) => [t.name, t.id]))

	// Payments + tag links.
	const insertedPayments = await db
		.insert(payment)
		.values(
			PAYMENTS.map((p) => ({
				amount: Math.round(p.dollars),
				note: p.note,
				createdAt: daysAgo(p.daysAgo),
				userId: target.id
			}))
		)
		.returning({ id: payment.id })

	const links = PAYMENTS.flatMap((p, i) =>
		p.tags
			.map((name) => tagIdByName.get(name))
			.filter((id): id is number => id !== undefined)
			.map((tagId) => ({ paymentId: insertedPayments[i].id, tagId }))
	)
	if (links.length) await db.insert(paymentsToTags).values(links)

	// Budgets.
	await db
		.insert(budget)
		.values(
			BUDGETS.map((b) => ({ amount: Math.round(b.dollars), startMonth: b.start, endMonth: b.end, userId: target.id }))
		)

	console.log(`Inserted ${insertedTags.length} tags, ${insertedPayments.length} payments, ${BUDGETS.length} budgets.`)
}

main()
	.then(() => client.end())
	.then(() => {
		console.log('Seed complete.')
		process.exit(0)
	})
	.catch(async (err) => {
		console.error('Seed failed:', err)
		await client.end().catch(() => {})
		process.exit(1)
	})

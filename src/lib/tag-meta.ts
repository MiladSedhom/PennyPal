import ShoppingBasket from '@lucide/svelte/icons/shopping-basket'
import UtensilsCrossed from '@lucide/svelte/icons/utensils-crossed'
import Coffee from '@lucide/svelte/icons/coffee'
import Bus from '@lucide/svelte/icons/bus'
import Fuel from '@lucide/svelte/icons/fuel'
import House from '@lucide/svelte/icons/house'
import Plug from '@lucide/svelte/icons/plug'
import Wifi from '@lucide/svelte/icons/wifi'
import HeartPulse from '@lucide/svelte/icons/heart-pulse'
import Heart from '@lucide/svelte/icons/heart'
import Dumbbell from '@lucide/svelte/icons/dumbbell'
import Repeat from '@lucide/svelte/icons/repeat'
import ShoppingBag from '@lucide/svelte/icons/shopping-bag'
import ShoppingCart from '@lucide/svelte/icons/shopping-cart'
import Receipt from '@lucide/svelte/icons/receipt'
import Tag from '@lucide/svelte/icons/tag'
import Plane from '@lucide/svelte/icons/plane'
import Gift from '@lucide/svelte/icons/gift'
import Book from '@lucide/svelte/icons/book'
import Music from '@lucide/svelte/icons/music'
import Smartphone from '@lucide/svelte/icons/smartphone'
import Film from '@lucide/svelte/icons/film'
import PiggyBank from '@lucide/svelte/icons/piggy-bank'
import Briefcase from '@lucide/svelte/icons/briefcase'
import CreditCard from '@lucide/svelte/icons/credit-card'
import Bell from '@lucide/svelte/icons/bell'
import Pill from '@lucide/svelte/icons/pill'
import type { Component } from 'svelte'

// Sage swatch system — each color is a soft chip bg + readable ink, all in the sage family
export type TagColor = 'sage' | 'sand' | 'clay' | 'sky' | 'teal' | 'lilac' | 'rose' | 'olive'

export type TagSwatch = { ink: string; bg: string; ring: string }

export const TAG_PALETTE: Record<TagColor, TagSwatch> = {
	sage: { ink: '#2c5a30', bg: '#d5e7cb', ring: 'rgba(44,90,48,0.18)' },
	sand: { ink: '#8a5a1e', bg: '#f3e2c9', ring: 'rgba(138,90,30,0.18)' },
	clay: { ink: '#9a4a3c', bg: '#ebd3ce', ring: 'rgba(154,74,60,0.18)' },
	sky: { ink: '#2a5c71', bg: '#cfe0e8', ring: 'rgba(42,92,113,0.18)' },
	teal: { ink: '#2c6657', bg: '#cde3dd', ring: 'rgba(44,102,87,0.18)' },
	lilac: { ink: '#4f4488', bg: '#d9d5ec', ring: 'rgba(79,68,136,0.18)' },
	rose: { ink: '#8a4670', bg: '#ecd8e4', ring: 'rgba(138,70,112,0.18)' },
	olive: { ink: '#5a6233', bg: '#dce0ca', ring: 'rgba(90,98,51,0.18)' }
}

export const TAG_COLOR_LIST: TagColor[] = ['sage', 'sand', 'clay', 'sky', 'teal', 'lilac', 'rose', 'olive']

export const ICON_LIBRARY: Record<string, Component> = {
	ShoppingBasket,
	UtensilsCrossed,
	Coffee,
	Bus,
	Fuel,
	House,
	Plug,
	Wifi,
	Repeat,
	Dumbbell,
	Heart,
	HeartPulse,
	Plane,
	Gift,
	Book,
	Music,
	Smartphone,
	Film,
	PiggyBank,
	ShoppingCart,
	ShoppingBag,
	Briefcase,
	CreditCard,
	Bell,
	Pill,
	Receipt,
	Tag
}

export const ICON_CHOICES = [
	'ShoppingBasket',
	'UtensilsCrossed',
	'Coffee',
	'Bus',
	'Fuel',
	'House',
	'Plug',
	'Wifi',
	'Repeat',
	'Dumbbell',
	'Heart',
	'Plane',
	'Gift',
	'Book',
	'Music',
	'Smartphone',
	'Film',
	'PiggyBank',
	'ShoppingCart',
	'Briefcase',
	'CreditCard',
	'Bell',
	'Pill',
	'Tag'
] as const

type TagPreset = { color: TagColor; iconName: keyof typeof ICON_LIBRARY; icon: Component }

const PRESET_RAW: Record<string, { color: TagColor; iconName: keyof typeof ICON_LIBRARY }> = {
	groceries: { color: 'sage', iconName: 'ShoppingBasket' },
	dining: { color: 'sand', iconName: 'UtensilsCrossed' },
	restaurant: { color: 'sand', iconName: 'UtensilsCrossed' },
	food: { color: 'sand', iconName: 'UtensilsCrossed' },
	coffee: { color: 'sand', iconName: 'Coffee' },
	transport: { color: 'sky', iconName: 'Bus' },
	transit: { color: 'sky', iconName: 'Bus' },
	travel: { color: 'sky', iconName: 'Plane' },
	fuel: { color: 'clay', iconName: 'Fuel' },
	gas: { color: 'clay', iconName: 'Fuel' },
	rent: { color: 'lilac', iconName: 'House' },
	home: { color: 'lilac', iconName: 'House' },
	utilities: { color: 'olive', iconName: 'Plug' },
	internet: { color: 'teal', iconName: 'Wifi' },
	health: { color: 'rose', iconName: 'HeartPulse' },
	medical: { color: 'rose', iconName: 'Pill' },
	fitness: { color: 'olive', iconName: 'Dumbbell' },
	gym: { color: 'olive', iconName: 'Dumbbell' },
	subscriptions: { color: 'rose', iconName: 'Repeat' },
	shopping: { color: 'teal', iconName: 'ShoppingBag' },
	entertainment: { color: 'rose', iconName: 'Film' },
	music: { color: 'rose', iconName: 'Music' },
	phone: { color: 'teal', iconName: 'Smartphone' },
	savings: { color: 'sage', iconName: 'PiggyBank' },
	work: { color: 'sky', iconName: 'Briefcase' },
	gift: { color: 'rose', iconName: 'Gift' },
	books: { color: 'sand', iconName: 'Book' }
}

const PRESETS: Record<string, TagPreset> = Object.fromEntries(
	Object.entries(PRESET_RAW).map(([k, v]) => [k, { ...v, icon: ICON_LIBRARY[v.iconName] }])
)

const FALLBACK_ICON_NAMES: (keyof typeof ICON_LIBRARY)[] = ['Tag', 'Receipt', 'ShoppingBag']

function hash(s: string): number {
	let h = 0
	for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
	return Math.abs(h)
}

export function getTagMeta(name: string): TagPreset {
	const key = name.trim().toLowerCase()
	if (PRESETS[key]) return PRESETS[key]
	const h = hash(key || 'tag')
	const iconName = FALLBACK_ICON_NAMES[h % FALLBACK_ICON_NAMES.length]
	return {
		color: TAG_COLOR_LIST[h % TAG_COLOR_LIST.length],
		iconName,
		icon: ICON_LIBRARY[iconName]
	}
}

export function getTagSwatch(name: string): TagSwatch {
	return TAG_PALETTE[getTagMeta(name).color]
}

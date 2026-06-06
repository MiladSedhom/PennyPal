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

export const DEFAULT_TAG_COLOR: TagColor = 'sage'
export const DEFAULT_TAG_ICON = 'Tag'

function isTagColor(value: string): value is TagColor {
	return value in TAG_PALETTE
}

/** Resolve a stored color id to its swatch, falling back to the default. */
export function getSwatch(color: string): TagSwatch {
	return TAG_PALETTE[isTagColor(color) ? color : DEFAULT_TAG_COLOR]
}

/** Resolve a stored icon name to its component, falling back to the default. */
export function getIcon(iconName: string): Component {
	return ICON_LIBRARY[iconName] ?? ICON_LIBRARY[DEFAULT_TAG_ICON]
}

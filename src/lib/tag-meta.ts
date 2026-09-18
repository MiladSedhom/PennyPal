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
import Car from '@lucide/svelte/icons/car'
import Pizza from '@lucide/svelte/icons/pizza'
import Wine from '@lucide/svelte/icons/wine'
import Beer from '@lucide/svelte/icons/beer'
import Cake from '@lucide/svelte/icons/cake'
import IceCreamCone from '@lucide/svelte/icons/ice-cream-cone'
import Shirt from '@lucide/svelte/icons/shirt'
import Footprints from '@lucide/svelte/icons/footprints'
import Baby from '@lucide/svelte/icons/baby'
import PawPrint from '@lucide/svelte/icons/paw-print'
import Dog from '@lucide/svelte/icons/dog'
import Cat from '@lucide/svelte/icons/cat'
import Scissors from '@lucide/svelte/icons/scissors'
import Stethoscope from '@lucide/svelte/icons/stethoscope'
import Glasses from '@lucide/svelte/icons/glasses'
import GraduationCap from '@lucide/svelte/icons/graduation-cap'
import Laptop from '@lucide/svelte/icons/laptop'
import Gamepad2 from '@lucide/svelte/icons/gamepad-2'
import Tv from '@lucide/svelte/icons/tv'
import Headphones from '@lucide/svelte/icons/headphones'
import Camera from '@lucide/svelte/icons/camera'
import Palette from '@lucide/svelte/icons/palette'
import Wrench from '@lucide/svelte/icons/wrench'
import Hammer from '@lucide/svelte/icons/hammer'
import Leaf from '@lucide/svelte/icons/leaf'
import TreePine from '@lucide/svelte/icons/tree-pine'
import Sun from '@lucide/svelte/icons/sun'
import Umbrella from '@lucide/svelte/icons/umbrella'
import Bike from '@lucide/svelte/icons/bike'
import Ship from '@lucide/svelte/icons/ship'
import Ticket from '@lucide/svelte/icons/ticket'
import Trophy from '@lucide/svelte/icons/trophy'
import Sparkles from '@lucide/svelte/icons/sparkles'
import Star from '@lucide/svelte/icons/star'
import Banknote from '@lucide/svelte/icons/banknote'
import Wallet from '@lucide/svelte/icons/wallet'
import Landmark from '@lucide/svelte/icons/landmark'
import Coins from '@lucide/svelte/icons/coins'
import TrendingUp from '@lucide/svelte/icons/trending-up'
import Calendar from '@lucide/svelte/icons/calendar'
import Phone from '@lucide/svelte/icons/phone'
import Mail from '@lucide/svelte/icons/mail'
import Cloud from '@lucide/svelte/icons/cloud'
import Droplet from '@lucide/svelte/icons/droplet'
import Flame from '@lucide/svelte/icons/flame'
import Zap from '@lucide/svelte/icons/zap'
import Lightbulb from '@lucide/svelte/icons/lightbulb'
import Bath from '@lucide/svelte/icons/bath'
import BedDouble from '@lucide/svelte/icons/bed-double'
import Sofa from '@lucide/svelte/icons/sofa'
import Key from '@lucide/svelte/icons/key'
import Shield from '@lucide/svelte/icons/shield'
import MapPin from '@lucide/svelte/icons/map-pin'
import Globe from '@lucide/svelte/icons/globe'
import type { Component } from 'svelte'

// Ids are stored in the DB; colours come from --tag-<id>-bg/-ink in layout.css.
export type TagColor = 'sage' | 'sand' | 'clay' | 'sky' | 'teal' | 'lilac' | 'rose' | 'olive'

export type TagSwatch = { ink: string; bg: string; ring: string }

function cssSwatch(id: TagColor): TagSwatch {
	return {
		ink: `var(--tag-${id}-ink)`,
		bg: `var(--tag-${id}-bg)`,
		ring: `color-mix(in srgb, var(--tag-${id}-ink) 18%, transparent)`
	}
}

export const TAG_PALETTE: Record<TagColor, TagSwatch> = {
	sage: cssSwatch('sage'),
	sand: cssSwatch('sand'),
	clay: cssSwatch('clay'),
	sky: cssSwatch('sky'),
	teal: cssSwatch('teal'),
	lilac: cssSwatch('lilac'),
	rose: cssSwatch('rose'),
	olive: cssSwatch('olive')
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
	Car,
	Pizza,
	Wine,
	Beer,
	Cake,
	IceCreamCone,
	Shirt,
	Footprints,
	Baby,
	PawPrint,
	Dog,
	Cat,
	Scissors,
	Stethoscope,
	Glasses,
	GraduationCap,
	Laptop,
	Gamepad2,
	Tv,
	Headphones,
	Camera,
	Palette,
	Wrench,
	Hammer,
	Leaf,
	TreePine,
	Sun,
	Umbrella,
	Bike,
	Ship,
	Ticket,
	Trophy,
	Sparkles,
	Star,
	Banknote,
	Wallet,
	Landmark,
	Coins,
	TrendingUp,
	Calendar,
	Phone,
	Mail,
	Cloud,
	Droplet,
	Flame,
	Zap,
	Lightbulb,
	Bath,
	BedDouble,
	Sofa,
	Key,
	Shield,
	MapPin,
	Globe,
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
	'Receipt',
	'Car',
	'Pizza',
	'Wine',
	'Beer',
	'Cake',
	'IceCreamCone',
	'Shirt',
	'Footprints',
	'Baby',
	'PawPrint',
	'Dog',
	'Cat',
	'Scissors',
	'Stethoscope',
	'Glasses',
	'GraduationCap',
	'Laptop',
	'Gamepad2',
	'Tv',
	'Headphones',
	'Camera',
	'Palette',
	'Wrench',
	'Hammer',
	'Leaf',
	'TreePine',
	'Sun',
	'Umbrella',
	'Bike',
	'Ship',
	'Ticket',
	'Trophy',
	'Sparkles',
	'Star',
	'Banknote',
	'Wallet',
	'Landmark',
	'Coins',
	'TrendingUp',
	'Calendar',
	'Phone',
	'Mail',
	'Cloud',
	'Droplet',
	'Flame',
	'Zap',
	'Lightbulb',
	'Bath',
	'BedDouble',
	'Sofa',
	'Key',
	'Shield',
	'MapPin',
	'Globe',
	'HeartPulse',
	'Tag'
] as const

export type IconChoices = (typeof ICON_CHOICES)[number]

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

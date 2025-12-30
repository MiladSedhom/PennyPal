import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null }

export function formatRelativeTime(date: Date, locale: string = 'en'): string {
	const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

	const diffMs = date.getTime() - Date.now()

	const seconds = Math.round(diffMs / 1000)
	const minutes = Math.round(seconds / 60)
	const hours = Math.round(minutes / 60)
	const days = Math.round(hours / 24)

	if (Math.abs(seconds) < 60) {
		return rtf.format(seconds, 'second')
	}

	if (Math.abs(minutes) < 60) {
		return rtf.format(minutes, 'minute')
	}

	if (Math.abs(hours) < 24) {
		return rtf.format(hours, 'hour')
	}

	return rtf.format(days, 'day')
}

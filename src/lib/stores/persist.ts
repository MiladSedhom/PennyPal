import { browser } from '$app/environment'
import { writable, type Writable } from 'svelte/store'

export const persisted = <T>(key: string, initialValue?: T): Writable<T> | undefined => {
	if (!browser) return writable({} as T)
	const storedValue = localStorage.getItem(key)
	const value = storedValue?.length ? JSON.parse(storedValue) : initialValue
	const store = writable<T>(value)

	store.subscribe((value) => {
		localStorage.setItem(key, JSON.stringify(value))
	})

	return store
}

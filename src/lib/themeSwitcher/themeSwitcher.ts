import { browser } from '$app/environment'
import { writable, type Writable } from 'svelte/store'

/**
 * Creates a writable store that syncs with localStorage and updates a dataset attribute on the document's root element.
 *
 * @param {string} key - The key to use for localStorage and the dataset attribute.
 * @param {string} [initialValue] - The initial value to use if no value is found in localStorage.
 * @returns {Writable<string>|undefined} A writable store that syncs with localStorage, or undefined if not in a browser environment.
 *
 * @description
 * This function creates a writable store that:
 * 1. Initializes with a value from localStorage or the provided initial value.
 * 2. Updates localStorage whenever the store value changes.
 * 3. Updates a dataset attribute on the document's root element with the current value.
 * 4. Only works in a browser environment.
 *
 * @example
 * const themeStore = themeSwitcher('theme', 'light');
 * themeStore.set('dark'); // This will update localStorage and set data-theme="dark" on <html>
 * const colorStore = themeSwitcher('color', 'red');
 * colorStore.set('blue'); // This will update localStorage and set data-color="blue" on <html>
 */
export const themeSwitcher = (key: string, initialValue?: string): Writable<string> | undefined => {
	if (!browser) return writable('')
	const value = localStorage.getItem(key) ?? initialValue
	const store = writable(value)

	store.subscribe((value) => {
		localStorage.setItem(key, value)
		document.documentElement.dataset[key] = value
	})

	return store
}

import { browser } from '$app/environment'

export function themeSwticher(themes: string[], key: string, init?: string) {
	if (browser) console.log('init', document.documentElement.dataset[key])
	if (browser) init = document.documentElement.dataset[key]
	let theme = $state(init)

	$effect.pre(() => {
		document.documentElement.dataset[key] = theme
		document.cookie = key + '=' + theme + '; max-age=99999999'
		console.log(document.cookie)
	})

	return {
		get current() {
			return theme
		},

		set current(v) {
			if (!v) return
			theme = v
		},

		next: () => {
			theme = themes[(themes.indexOf(theme as string) + 1) % themes.length]
		},

		previous: () => {
			theme = themes.at((themes.indexOf(theme as string) - 1) % themes.length)
		}
	}
}

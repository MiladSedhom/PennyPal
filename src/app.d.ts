// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: import('lucia').User | null
			session: import('lucia').Session | null
			theme: string
			color: string
		}
		// interface PageData {}
		interface PageState {
			loginModal?: boolean
			signupModal?: boolean
		}
		// interface Platform {}
	}

	namespace svelteHTML {
		interface HTMLAttributes<T> {
			'on:clickoutside'?: (event: Event) => void
			'on:focusoutside'?: (event: Event) => void
		}
	}
}

export {}

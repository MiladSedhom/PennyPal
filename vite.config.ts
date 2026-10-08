import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
			adapter: adapter(),
			experimental: { remoteFunctions: true },
			compilerOptions: { experimental: { async: true } },
			inspector: {
				toggleKeyCombo: 'alt-x',
				showToggleButton: 'always',
				toggleButtonPos: 'bottom-right'
			}
		})
	]
})

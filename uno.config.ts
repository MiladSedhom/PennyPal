import { defineConfig } from 'unocss'
import { presetUno, presetWebFonts, presetIcons } from 'unocss'

export default defineConfig({
	presets: [
		presetUno(),
		presetIcons({
			extraProperties: {
				display: 'inline-block',
				'vertical-align': 'middle'
			}
		})
	],
	theme: {
		colors: {
			body: 'var(--color-body)',
			primary: 'var(--color-primary)',
			text: 'var(--color-text)',
			'text-alt': 'var(--color-text-on-primary)',
			fields: 'var(--color-fields)',
			bg: 'var(--color-background)',
			bg1: 'var(--color-background-1)',
			bg2: 'var(--color-background-2)',
		}
	}
})

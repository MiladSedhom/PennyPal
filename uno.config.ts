import { defineConfig, transformerVariantGroup } from 'unocss'
import { presetUno, presetIcons } from 'unocss'

export default defineConfig({
	presets: [
		presetUno({ dark: { dark: "[data-theme='dark']" } }),
		presetIcons({
			extraProperties: {
				display: 'inline-block',
				'vertical-align': 'middle'
			}
		})
	],
	transformers: [transformerVariantGroup()],
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
			'text-90': 'var(--color-text-90)',
			'text-70': 'var(--color-text-70)',
			'text-60': 'var(--color-text-60)',
			muted: 'var(--color-muted)',
			grey: 'var(--color-grey)',
			'grey-2': 'var(--color-grey-2)'
		}
	}
})

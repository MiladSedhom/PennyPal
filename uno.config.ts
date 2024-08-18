import { defineConfig, transformerVariantGroup } from 'unocss'
import { presetUno, presetIcons } from 'unocss'

export default defineConfig({
	shortcuts: [
		{
			'interactions-ring':
				'outline-2 outline-offset-3 focus-within:(outline outline-primary) hover:(outline outline-grey) hover:focus-within:outline-primary'
		},

		[
			/^interactions-ring-([^-]+(?:-[^-]+)*),([^-]+(?:-[^-]+)*)$/,
			([, c1, c2]) =>
				`outline-2 outline-offset-3 focus-within:(outline outline-${c2}) hover:(outline outline-${c1}) hover:focus-within:outline-${c2}`
		]
	],
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
			body: 'hsl(var(--color-body) / <alpha-value>)',
			primary: 'hsl(var(--color-primary) / <alpha-value>)',
			text: 'hsl(var(--color-text) / <alpha-value>)',
			'text-alt': 'hsl(var(--color-text-on-primary) / <alpha-value>)',
			fields: 'hsl(var(--color-fields) / <alpha-value>)',
			bg: 'hsl(var(--color-background) / <alpha-value>)',
			bg1: 'hsl(var(--color-background-1) / <alpha-value>)',
			bg2: 'hsl(var(--color-background-2) / <alpha-value>)',
			muted: 'hsl(var(--color-muted) / <alpha-value>)',
			grey: 'hsl(var(--color-grey) / <alpha-value>)',
			'grey-2': 'hsl(var(--color-grey-2) / <alpha-value>)',
			error: 'hsl(var(--color-semantic-red) / <alpha-value>)'
		}
	}
})

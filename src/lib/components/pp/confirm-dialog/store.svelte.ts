// Global, imperatively-invoked confirmation dialog — a sonner-style API for
// "are you sure?" prompts. Call `dialogs.confirm(onConfirm, options)` from
// anywhere; a single <ConfirmDialog /> mounted in the root layout renders it.
//
// Uses a Svelte 5 `$state` class singleton (not a store) per Svelte best
// practices for shared reactive state.
import type { Component } from 'svelte'

export type ConfirmTone = 'danger' | 'warning' | 'info'

export interface ConfirmOptions {
	title?: string
	message: string
	confirmText?: string
	cancelText?: string
	tone?: ConfirmTone
	/** Optional Lucide-style icon component shown in the header. */
	icon?: Component
}

type ConfirmHandler = () => void | Promise<void>

interface ConfirmState extends Required<Omit<ConfirmOptions, 'icon'>> {
	icon?: Component
	onConfirm: ConfirmHandler
	onCancel?: () => void
}

const DEFAULTS = {
	title: 'Are you sure?',
	confirmText: 'Confirm',
	cancelText: 'Cancel',
	tone: 'info' as ConfirmTone
}

class ConfirmDialogController {
	open = $state(false)
	/** True while an async `onConfirm` is running. */
	pending = $state(false)
	current = $state<ConfirmState | null>(null)

	/**
	 * Open a confirmation dialog. Resolves nothing — pass an `onConfirm`
	 * callback (sync or async). If async, the dialog shows a pending state
	 * and only closes once it settles.
	 */
	confirm(onConfirm: ConfirmHandler, options: ConfirmOptions, onCancel?: () => void) {
		this.current = { ...DEFAULTS, ...options, onConfirm, onCancel }
		this.pending = false
		this.open = true
	}

	/** Shorthand for a destructive confirmation. */
	danger(onConfirm: ConfirmHandler, options: ConfirmOptions, onCancel?: () => void) {
		this.confirm(onConfirm, { tone: 'danger', confirmText: 'Delete', ...options }, onCancel)
	}

	async runConfirm() {
		if (!this.current) return
		const fn = this.current.onConfirm
		try {
			this.pending = true
			await fn()
			this.close()
		} finally {
			this.pending = false
		}
	}

	cancel() {
		this.current?.onCancel?.()
		this.close()
	}

	close() {
		this.open = false
	}
}

export const dialogs = new ConfirmDialogController()

<script lang="ts">
	import { clickOutside, focusOutside, scrollAction } from '$lib/actions'
	import { offset, flip, shift } from 'svelte-floating-ui/dom'
	import { createFloatingActions } from 'svelte-floating-ui'
	import { tick } from 'svelte'

	export let options: { label: string; value: string }[]
	export let multiple: boolean = false
	export let value: string[] | string = multiple ? [] : ''
	export let placeholder: string | undefined = undefined
	export let onSelect: Function | null = null
	export let name: string | null = null
	export let id: string | null = null

	let isOpen = false
	let isInput = multiple
	let inputValue = ''
	let inputRef: HTMLInputElement

	let hoveredTag: string | undefined
	let hoveredOption: { label: string; value: string } | undefined

	$: filteredOptions = options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()))

	const [floatingRef, floatingContent] = createFloatingActions({
		strategy: 'absolute',
		placement: 'bottom',
		middleware: [offset(16), flip(), shift()]
	})

	//functions
	const addOrRemoveFromSelectedValues = (v: string) => {
		if (!Array.isArray(value)) return
		value.includes(v) ? value.splice(value.indexOf(v), 1) : value.push(v)
		// add option if it doesn't exit
		if (!options.some((options) => options.value === inputValue))
			options = [...options, { label: inputValue, value: inputValue }]
		value = value
	}

	const select = (v: string) => {
		if (multiple) addOrRemoveFromSelectedValues(v)
		else if (options.map((o) => o.value).includes(v)) value = v
		onSelect?.(value)
		!multiple && (isOpen = false)
	}

	const handleInputFocus = () => {
		isOpen = true
	}

	const handleKeydown = (e: any) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			if (hoveredOption) {
				select(hoveredOption.value)
			} else if (inputValue.length != 0 && multiple) {
				select(inputValue)
				//reset input
				inputValue = ''
			}
			!multiple && inputRef.blur()
		}
		if (e.key === 'Escape') {
			if (hoveredTag) hoveredTag = undefined
			else inputRef.blur()
		}
		if (e.key === 'Backspace') {
			if (inputValue.length != 0) return
			if (hoveredTag) {
				removeTag(hoveredTag)
				hoveredTag = undefined
			} else {
				hoveredTag = value.at(-1)
			}
		} else {
			hoveredTag = undefined
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault()
			if (hoveredOption) {
				let hoveredOptionIndex = filteredOptions.indexOf(hoveredOption)
				if (hoveredOptionIndex === 0) hoveredOption = undefined
				else hoveredOption = filteredOptions.at(hoveredOptionIndex - 1)
			} else {
				hoveredOption = filteredOptions.at(filteredOptions.length - 1)
			}
			!multiple && hoveredOption && select(hoveredOption.value)
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			if (hoveredOption) {
				let hoveredOptionIndex = filteredOptions.indexOf(hoveredOption)
				if (hoveredOptionIndex === filteredOptions.length - 1) hoveredOption = filteredOptions.at(0)
				else hoveredOption = filteredOptions.at(hoveredOptionIndex + 1)
			} else {
				hoveredOption = filteredOptions.at(0)
			}
			!multiple && hoveredOption && select(hoveredOption.value)
		}
	}

	const removeTag = (tag: string) => {
		if (!Array.isArray(value)) return
		value.splice(value.indexOf(tag), 1)
		value = value
	}

	const handleOptionClick = (option: any) => {
		select(option.value)
	}

	const closeDropDown = () => {
		isOpen = false
	}

	const handleBlur = () => {
		if (inputValue !== '') select(inputValue)
		inputValue = ''
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="bg-fields rounded-1 pos-relative interactions-ring flex min-h-10 w-[var(--width)] w-full flex-col justify-center p-2"
	use:clickOutside
	use:focusOutside
	use:floatingRef
	on:clickoutside={closeDropDown}
	on:focusoutside={() => {
		if (!multiple) isInput = false
		closeDropDown()
	}}
	on:focus={async (e) => {
		isInput = true
		isOpen = true
		await tick()
		inputRef.focus()
	}}
	on:keydown={handleKeydown}
	role="combobox"
	aria-controls="options-list"
	aria-expanded={isOpen}
	tabindex="0"
>
	{#if multiple && value.length != 0}
		<div class="bg-fields rounded-1 p-x-2 m-b-2 flex flex-wrap gap-2">
			{#each value as tag}
				<button
					class="bg-primary text-text-alt rounded-1 text-3 font-500 hover:(bg-[var(--color-semantic-red)] text-text) p-y-1 p-x-3 text-center"
					type="button"
					on:click={() => {
						removeTag(tag)
						onSelect?.()
					}}
					>{tag}
				</button>
			{/each}
		</div>
	{/if}

	<div class="bg-fields rounded-1 flex h-full items-center justify-center">
		{#if !isInput}
			<p class="text-14px p-x-1 grow">
				{value ? options.filter((e) => e.value === value)[0]?.label : options[0].label}
			</p>
		{/if}

		<input
			class="text-14px p-x-1 rounded-1 placeholder:text-text/50 h-6 grow bg-transparent focus:outline-none"
			placeholder={placeholder ?? 'Pick your tags...'}
			class:hidden={!isInput}
			bind:value={inputValue}
			bind:this={inputRef}
			on:blur={handleBlur}
			on:focus={handleInputFocus}
			on:input|preventDefault={() => {
				hoveredOption = undefined
			}}
			type="text"
		/>
		<button
			type="button"
			on:click={() => (isOpen = !isOpen)}
			class="hover:(bg-muted) rounded-1 focus:(bg-muted outline-0) flex size-8 content-center items-center justify-center"
		>
			<div class="i-tabler-caret-down text-5"></div>
		</button>
	</div>

	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<ul
		class="rounded-1 pos-absolute outline-(2 solid grey-2) z-1 bg-bg scrollbar:w-0 max-h-40 w-full overflow-auto p-1"
		class:hidden={!(isOpen && filteredOptions.length !== 0)}
		use:floatingContent
		id="options-list"
	>
		{#each filteredOptions as option}
			<li class="w-full" use:scrollAction={{ isScroll: option === hoveredOption }}>
				<button
					on:click={() => {
						handleOptionClick(option)
					}}
					on:keydown={(e) => {
						if (e.key != 'Tab') e.preventDefault()
					}}
					class="text-3 bg-bg data-[selected=true]:bg-muted data-[hovered=true]:bg-grey-2
					[&[data-selected=true][data-hovered=true]]:bg-grey-2 w-full p-2"
					data-selected={multiple ? value.includes(option.value) : value === option.value}
					data-hovered={hoveredOption?.value === option.value}
					on:mouseenter={() => {
						hoveredOption = option
					}}
					on:mouseleave={() => {
						hoveredOption = undefined
					}}
					type="button"
					tabindex="-1"
				>
					{option.label}
				</button>
			</li>
		{/each}
	</ul>
</div>

<!-- this key block ensures the matching between this select's value and the state value -->
{#key value}
	<select class="hidden" {multiple} {name} {id}>
		{#each options as o}
			<option value={o.value} selected={Array.isArray(value) ? value.includes(o.value) : value == o.value}></option>
		{/each}
	</select>
{/key}

<style>
	ul::-webkit-scrollbar {
		width: 0;
	}
</style>

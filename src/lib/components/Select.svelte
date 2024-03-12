<script lang="ts">
	import { clickOutside, focusOutside, scrollAction } from '$lib/actions'
	import { offset, flip, shift } from 'svelte-floating-ui/dom'
	import { createFloatingActions } from 'svelte-floating-ui'
	import { tick } from 'svelte'

	export let options: { label: string; value: string }[]
	export let multiple: boolean = false
	export let value: string[] | string = multiple ? [] : ''
	export let placeholder: string = ''
	export let onSelect: Function | null = null
	export let noStyles: boolean = false
	export let name: string | null = null
	export let id: string | null = null

	let isOpen = false
	let isInput = multiple ? true : false //i know :)
	let inputValue = ''
	let inputRef: HTMLInputElement

	let hoverdTag: string | undefined
	let hoverdOption: { label: string; value: string } | undefined

	$: filteredOptions = options.filter((option) => option.label.toLowerCase().includes(inputValue.toLowerCase()))

	//floating ui
	let _floatingConfig: any = {
		strategy: 'absolute',
		placement: 'bottom-start',
		middleware: [offset(8), flip(), shift()]
	}

	const [floatingRef, floatingContent] = createFloatingActions(_floatingConfig)

	//functions
	const addOrRemoveFromSelectedValues = (v: any) => {
		if (!Array.isArray(value)) return
		value.includes(v) ? value.splice(value.indexOf(v), 1) : value.push(v)
		value = value
	}

	const select = async (v: string) => {
		multiple ? addOrRemoveFromSelectedValues(v) : (value = v)
		onSelect?.(value)
		!multiple && (isOpen = false)
	}

	const handleInputFocus = () => {
		isOpen = true
	}

	const handleKeydown = (e: any) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			if (hoverdOption) {
				select(hoverdOption.value)
			} else if (inputValue.length != 0 && multiple) {
				select(inputValue)
				// add option if it doesnt exit
				if (!options.some((options) => options.value === inputValue))
					options = [...options, { label: inputValue, value: inputValue }]
				//reset input
				inputValue = ''
			}
			!multiple && inputRef.blur()
		}
		if (e.key === 'Escape') {
			if (hoverdTag) hoverdTag = undefined
			else inputRef.blur()
		}
		if (e.key === 'Backspace') {
			if (inputValue.length != 0) return
			if (hoverdTag) {
				removeTag(hoverdTag)
				hoverdTag = undefined
			} else {
				hoverdTag = value.at(-1)
			}
		} else {
			hoverdTag = undefined
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault()
			if (hoverdOption) {
				let hoverdOptionIndex = filteredOptions.indexOf(hoverdOption)
				if (hoverdOptionIndex === 0) hoverdOption = undefined
				else hoverdOption = filteredOptions.at(hoverdOptionIndex - 1)
			} else {
				hoverdOption = filteredOptions.at(filteredOptions.length - 1)
			}
			!multiple && hoverdOption && select(hoverdOption.value)
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault()
			if (hoverdOption) {
				let hoverdOptionIndex = filteredOptions.indexOf(hoverdOption)
				if (hoverdOptionIndex === filteredOptions.length - 1) hoverdOption = filteredOptions.at(0)
				else hoverdOption = filteredOptions.at(hoverdOptionIndex + 1)
			} else {
				hoverdOption = filteredOptions.at(0)
			}
			!multiple && hoverdOption && select(hoverdOption.value)
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
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="container"
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
		<div class="tags-container">
			{#each value as tag}
				<button
					class="tag"
					class:hoverd-tag={hoverdTag === tag}
					on:click={() => {
						removeTag(tag)
						onSelect?.()
					}}
					type="button"
					>{tag}
				</button>
			{/each}
		</div>
	{/if}

	<div class="input-caret-container">
		{#if !isInput}
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<p>
				{options.filter((e) => e.value === value)[0]?.label}
			</p>
		{/if}

		<input
			class:hidden={!isInput}
			bind:value={inputValue}
			bind:this={inputRef}
			on:focus={handleInputFocus}
			on:input|preventDefault={() => {
				hoverdOption = undefined
			}}
			type="text"
			{placeholder}
		/>
		<svg
			class="caret"
			class:caret-closed={!isOpen}
			xmlns="http://www.w3.org/2000/svg"
			width="16"
			height="16"
			viewBox="0 0 32 32"><path fill="currentColor" d="m24 12l-8 10l-8-10z" /></svg
		>
	</div>

	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<ul class:show={isOpen && filteredOptions.length !== 0} use:floatingContent id="options-list">
		{#each filteredOptions as option}
			<li use:scrollAction={{ isScroll: option === hoverdOption }}>
				<button
					on:click={() => {
						handleOptionClick(option)
					}}
					on:keydown={(e) => {
						if (e.key != 'Tab') e.preventDefault()
					}}
					class:hoverd-option={hoverdOption?.value === option.value}
					class="option"
					class:selected-option={value.includes(option.value)}
					on:mouseenter={() => {
						hoverdOption = option
					}}
					on:mouseleave={() => {
						hoverdOption = undefined
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

<select hidden {multiple} {name} {id}>
	{#each options as o}
		<option value={o.value} selected={Array.isArray(value) ? value.includes(o.value) : value == o.value}></option>
	{/each}
</select>

{#if !noStyles}
	<style>
		.container {
			display: flex;
			flex-direction: column;
			justify-content: center;
			min-height: 2.5rem;
			width: var(--width);
			background-color: var(--color-fields);
			border-radius: 2px;
			position: relative;

			&:focus-within {
				outline: 1px solid color-mix(in srgb, var(--color-fields) 80%, var(--color-text-alt));
			}
		}

		.tags-container {
			background-color: var(--color-fields);
			padding: 12px;
			display: flex;
			flex-flow: row wrap;
			gap: var(--spacing-8);
		}

		.tag {
			text-align: center;
			background-color: var(--color-primary);
			color: var(--color-text-on-primary);
			padding: 6px var(--spacing-16);
			border-radius: 4px;
			font-size: var(--fs-small);
			font-weight: 500;

			&:hover {
				background-color: var(--color-semantic-red);
				color: var(--color-text-alt);
			}
		}

		.hoverd-tag {
			background-color: var(--color-semantic-red);
			color: var(--color-text-alt);
		}

		.input-caret-container {
			height: 100%;
			background-color: var(--color-fields);
			display: flex;
			justify-content: space-between;
			align-items: center;
		}

		p {
			padding: 0 1rem;
			font-size: var(--fs-base);
		}

		svg {
			margin-right: var(--spacing-16);
			color: var(--caret-color, var(--color-grey-70));
		}

		input:focus {
			outline: none;
		}

		ul {
			width: 100%;
			display: none;
			border-radius: 2px;
			max-height: 10rem;
			overflow: auto;
			position: absolute;
			z-index: 1;

			outline: 1px solid color-mix(in srgb, var(--color-fields) 80%, var(--color-text-alt));
		}

		ul::-webkit-scrollbar {
			width: 0;
		}

		li {
			width: 100%;
			display: block;
			/* border-bottom: 2px solid hsl(150, 3%, 20%); */
		}

		.option {
			width: 100%;
			font-size: var(--fs-small);
			font-weight: normal;
			padding: 0.67rem;
			border-radius: 0;

			background-color: var(--color-fields);
			color: var(--color-text-alt);

			&:focus {
				outline: none;
			}

			/* &:hover {
			background-color: hsl(144, 65%, 42%);
		} */
		}

		.selected-option {
			background-color: color-mix(in srgb, var(--color-primary) 15%, var(--color-fields));
		}

		.hoverd-option {
			background-color: color-mix(in srgb, var(--color-fields) 88%, white);
		}

		.selected-option.hoverd-option {
			background-color: color-mix(in srgb, var(--color-primary) 30%, var(--color-fields));
		}

		.show {
			display: block;
		}

		.hidden {
			display: none;
		}
	</style>
{/if}

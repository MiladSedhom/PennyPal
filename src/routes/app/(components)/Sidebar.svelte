<script lang="ts">
	import { page } from '$app/stores'
	import AddPaymentForm from './PaymentForm.svelte'
	import FiltersForm from './FiltersForm.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import { DropdownMenu } from 'bits-ui'
	import { slide } from 'svelte/transition'
	import { themeSwitcher } from '$lib/themeSwitcher/themeSwitcher'

	const theme = themeSwitcher('theme')
	const color = themeSwitcher('color', 'green')

	let isFilters: boolean
	let isAdd: boolean
</script>

<div class="border-bg border-r-solid h-auto sm:h-screen">
	<aside class="gutter-stable bg-bg flex h-auto w-full flex-col overflow-auto p-8 sm:h-[calc(100vh-42px)]">
		<div class="flex items-center justify-between">
			<span class="text-6 fw-bold inline-block font-[var(--serif)]">
				<a href="/" class="text-text decoration-none">
					<span class="text-primary">Penny</span>Pal
				</a>
			</span>
			<div class="flex items-center gap-2">
				<p class="text-3 text-text-90">{$page.data.user.username}</p>

				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="hover:bg-muted rounded-1 p-1">
						<div class="i-tabler-dots-vertical text-5"></div>
					</DropdownMenu.Trigger>

					<DropdownMenu.Content class="bg-bg border-border text-3 rounded-1 w-60 border p-1">
						<DropdownMenu.Group class="sm:hidden">
							<DropdownMenu.Item
								class="text-text hover:bg-muted flex h-10 items-center p-2"
								on:click={() => {
									isFilters = !isFilters
								}}
							>
								<div class="i-tabler-filter text-5 bg-text-90 m-r-2"></div>
								Filters
							</DropdownMenu.Item>

							<DropdownMenu.Item
								class="text-text hover:bg-muted flex h-10 items-center p-2"
								on:click={() => {
									isAdd = true
								}}
							>
								<div class="i-tabler-circle-plus text-5 bg-text-90 m-r-2"></div>
								Add a New Payment
							</DropdownMenu.Item>
							<DropdownMenu.Separator class="bg-border h-1px w-80% m-a " />
						</DropdownMenu.Group>
						<DropdownMenu.Group>
							<DropdownMenu.Item
								class="text-text hover:bg-muted flex h-10 items-center p-2"
								on:click={() => {
									$theme = $theme === 'dark' ? 'light' : 'dark'
								}}
							>
								<div class="i-tabler-moon-stars text-5 bg-text-90 m-r-2"></div>
								Change Theme
							</DropdownMenu.Item>

							<DropdownMenu.Item
								class="text-text  hover:bg-muted flex h-10 items-center p-2"
								on:click={() => {
									const colors = ['green', 'blue', 'orange', 'pink']
									const newColorIndex = $color ? (colors.indexOf($color) + 1) % colors.length : 0
									$color = colors.at(newColorIndex)
								}}
							>
								<div class="i-tabler-color-filter text-5 bg-text-90 m-r-2"></div>
								Change Color
							</DropdownMenu.Item>
						</DropdownMenu.Group>
						<DropdownMenu.Separator class="bg-border h-1px w-80% m-a " />

						<DropdownMenu.Item class="text-text  hover:bg-muted  h-10 p-2">
							<a href="/logout" class="flex size-full items-center">
								<div
									class="i-tabler-logout-2 text-5 bg-text-90
bg-text-90 m-r-2"
								></div>
								Log Out</a
							>
						</DropdownMenu.Item>

						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger />
							<DropdownMenu.SubContent />
						</DropdownMenu.Sub>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</div>

		{#key isFilters}
			<div class=" m-block-4 grow {isFilters || 'hidden'} sm:block" transition:slide={{ duration: 350 }}>
				<h3 class="text-14px fw-500 m-t-4 m-b-2">
					Choose Your Filters <span class="i-tabler-adjustments-horizontal text-5 float-right"></span>
				</h3>

				<FiltersForm />
				<button class=" h-8 w-full sm:hidden" on:click={() => (isFilters = !isFilters)}>
					<div class="i-tabler-caret-up text-6 m-a"></div>
				</button>
			</div>
		{/key}
		<button
			class="rounded-50% m-r--2px bg-primary text-text-alt transition-duration-200 active:(scale-95 filter-brightness-85 ) hover:(translate-y--1 filter-brightness-110 ) hidden size-12 translate-y-1 self-end justify-self-end p-2 shadow-lg transition-all sm:block"
			on:click={() => {
				isAdd = true
			}}
			><div class="i-tabler-plus text-5"></div>
		</button>

		<Modal
			showModal={isAdd}
			onClose={() => {
				isAdd = false
			}}
		>
			<AddPaymentForm
				action="/app/?/addPayment"
				onSubmit={() => {
					isAdd = false
				}}
			/>
		</Modal>
	</aside>

	<nav class="m-inline-auto bg-bg w-full">
		<ul class="gap-2px p-b-2px h-42px flex w-full">
			<li class="w-full">
				<a
					href={`/app${$page.url.search}`}
					class="h-40px text-3 fw-500 decoration-none grid w-full place-content-center p-1
						{$page.route.id === '/app' ? 'bg-bg2 text-text border-b-solid border-primary border-b-2' : 'bg-bg1 text-text-60'}"
				>
					Payments view
				</a>
			</li>
			<li class="w-full">
				<a
					href={`/app/graphs${$page.url.search}`}
					class="h-40px text-3 fw-500 decoration-none grid w-full place-content-center p-1
						{$page.route.id === '/app/graphs'
						? 'bg-bg2 text-text border-b-solid border-primary border-b-2'
						: 'bg-bg1 text-text-60'}"
				>
					Graphs view
				</a>
			</li>
			<li class="w-full">
				<a
					href={`/app/table${$page.url.search}`}
					class="h-40px text-3 fw-500 decoration-none grid w-full place-content-center p-1
							{$page.route.id === '/app/table' ? 'bg-bg2 text-text border-b-solid border-primary border-b-2' : 'bg-bg1 text-text-60'}"
				>
					Table view
				</a>
			</li>
		</ul>
	</nav>
</div>

<script lang="ts">
	import { page } from '$app/stores'
	import AddPaymentForm from './AddPaymentForm.svelte'
	import FiltersForm from './FiltersForm.svelte'
	import Modal from '$lib/components/Modal.svelte'
	import ThemeSwitchers from '$lib/components/ThemeSwitchers.svelte'
	import { slide } from 'svelte/transition'

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
			<ThemeSwitchers />
			<div class="sm:hidden">
				<button
					on:click={() => {
						isFilters = !isFilters
					}}
				>
					filters
				</button>
				<button
					on:click={() => {
						isAdd = true
					}}
				>
					add
				</button>
			</div>
			<div class="">
				<p class="text-3 text-text-90">{$page.data.user.username}</p>
				<a href="/logout" class="text-3 text-text-70">logout</a>
			</div>
		</div>

		{#key isFilters}
			<div class=" m-b-4 grow {isFilters || 'hidden'} sm:block" transition:slide={{ duration: 300 }}>
				<h3 class="text-4 fw-400 m-t-4 m-b-2">Choose Your Filters</h3>

				<FiltersForm />
			</div>
		{/key}
		<button
			class=" p-x-4 p-y-2 bg-primary text-text-alt text-14px hidden self-end justify-self-end sm:block"
			on:click={() => {
				isAdd = true
			}}
		>
			New Payment
			<div class="i-tabler-plus text-5 m-l-2"></div>
		</button>

		{#if isAdd}
			<Modal
				showModal
				onClose={() => {
					isAdd = false
				}}
			>
				<AddPaymentForm
					onSubmit={() => {
						isAdd = false
					}}
				/>
			</Modal>
		{/if}
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

<script lang="ts">
	import ThemeSwitchers from '$lib/components/ThemeSwitchers.svelte'
	import { page } from '$app/stores'
	import { getContext } from 'svelte'

	const showModal: Function = getContext('showModal')
</script>

<header class="p-x-4 sm:p-x-12 bg-bg pos-relative flex h-20 items-center justify-between">
	<span class="text-6 text-text font-[var(--serif)] font-bold"><span class="text-primary">Penny</span>Pal</span>
	<ThemeSwitchers />
	<nav class="flex flex-col items-end sm:flex-row sm:items-center sm:gap-4">
		{#if !$page.data.user}
			<button
				class="bg-primary p-x-4 p-y-1 rounded-1 text-text-alt text-14px font-500 hover:(filter-brightness-110)"
				on:click={() => showModal('login')}>Login</button
			>
			<button
				class="bg-primary p-x-4 p-y-1 rounded-1 text-text-alt text-14px font-500 hover:(filter-brightness-110)"
				on:click={() => showModal('signup')}>Signup</button
			>
		{:else if $page.data.user}
			<span class="text-3 sm:text-14px text-text/90">{$page.data.user.username}</span>
			<div class="bg-text/70 w-1px hidden h-8 sm:block"></div>
			<div class="flex gap-2">
				<a class="text-3 sm:text-14px hover:text-primary decoration-underline" href="/app">App</a>
				<a class="text-3 sm:text-14px hover:text-primary decoration-underline" href="/logout">Logout</a>
			</div>
		{/if}
	</nav>
	<div
		class="pos-absolute left-50% translate-x--50% border-b-1 border-text/30 rounded-1 bottom-0 w-[calc(100%-6rem)] border"
	></div>
</header>

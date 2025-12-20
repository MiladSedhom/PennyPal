<script>
	import { Button } from '$lib/components/ui/button'
	import { getLoggedInUser, logout } from './(auth)/auth.remote'

	const user = $derived(await getLoggedInUser())
</script>

<div class="bg-[#101211] text-[#ADEFE6] p-4 w-screen h-screen">
	<h1 class="text-[2rem] font-black">Welcome to SvelteKit</h1>
	<p>
		Visit <a class="underline hover:text-white active:text-amber-100" href="https://svelte.dev/docs/kit"
			>svelte.dev/docs/kit</a
		> to read the documentation
	</p>
	<Button variant="default">Click Me</Button>
	<Button variant="outline">Click Me</Button>
	<Button variant="destructive">Click Me</Button>
	<Button variant="link">Click Me</Button>
	<Button>Click Me</Button>

	<h1>Hi, {user?.username}!</h1>
	<p>Your user ID is {user?.id}.</p>
	<form {...logout}>
		<Button type="submit">Log out</Button>
	</form>
</div>

<section>
	<main>
		<h1>Penny<span class="primary">Pal </span></h1>
	</main>
	<div class="left">
		<slot />
	</div>
</section>

<style>
	section {
		display: grid;
		grid-template-columns: auto 40%;
		height: 100vh;
	}

	main {
		display: grid;
		place-content: center left;
		padding: 3rem;
		background-color: var(--color-background);

		opacity: 1;
		background-image: radial-gradient(var(--color-primary) 2px, var(--color-background) 2px);
		background-size: 40px 40px;

		& h1 {
			font-size: 7rem;
		}

		& .primary {
			color: var(--color-primary);
		}
	}

	.left {
		display: grid;
		place-content: center;
		background-color: var(--color-primary);
	}
</style>

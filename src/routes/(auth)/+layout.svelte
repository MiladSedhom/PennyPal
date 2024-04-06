<section>
	<main>
		<a href="/">
			<h1>Penny<span class="primary">Pal </span></h1>
		</a>
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

	h1 {
		font-size: 7rem;
	}

	a {
		text-decoration: none;
	}

	main {
		display: grid;
		place-content: center left;
		padding: 3rem;
		background-color: var(--color-background);

		opacity: 1;
		background-image: radial-gradient(var(--color-primary) 2px, var(--color-background) 2px);
		background-size: 40px 40px;

		& .primary {
			color: var(--color-primary);
		}
	}

	.left {
		display: grid;
		place-content: center;
		background-color: var(--color-primary);
	}

	@media (max-width: 640px) {
		main {
			place-content: center center;
		}

		h1 {
			font-size: 3rem;
		}

		section {
			grid-template-columns: auto;
			grid-template-rows: auto 1fr;
		}
	}
</style>

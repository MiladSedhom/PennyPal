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
		background-color: var(--color-dark);

		--s: 100px; /* control the size */
		--c1: #484c4b;
		--c2: var(--color-dark);

		background: linear-gradient(-26.56deg, var(--c1) 33%, var(--c2) 33.3% 66.6%, var(--c1) 67%) 0 / var(--s) var(--s);
		/* 26.56deg = arctan(0.5) */

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

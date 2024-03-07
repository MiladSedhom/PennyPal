<script lang="ts">
	import { page } from '$app/stores'
</script>

<form action="?/addPayment" method="post">
	<div class="field">
		<label for="amount">Amount</label>
		<input type="number" name="amount" id="amount" placeholder="amount" />
		{#if $page.form?.errors?.amount}
			<p class="error">{$page.form.errors.amount}</p>
		{/if}
	</div>

	<div class="field">
		<label for="">Tags</label>
		<select name="tags" id="tags" multiple>
			<option value="food">food</option>
			<option value="drink">drink</option>
			<option value="fun">fun</option>
			<option value="fuck">fuck</option>
		</select>
		{#if $page.form?.error?.tags}
			<div class="error">{$page.form.error.tags}</div>
		{/if}
	</div>

	<div class="field">
		<label for="date">Date</label>
		<input type="date" name="date" id="date" value={new Date().toISOString().substring(0, 10)} />
		{#if $page.form?.error?.date}
			<div class="error">{$page.form.error.date}</div>
		{/if}
	</div>

	<div class="field">
		<label for="note">Note</label>
		<textarea name="note" id="note" />
		{#if $page.form?.errors?.note}
			<p class="error">{$page.form.errors.note}</p>
		{/if}
	</div>

	<button type="submit">Add Payment</button>
</form>

<style>
	form {
		/* not using margin cuz it doesnt work with the transition */
		padding-bottom: var(--spacing-48);
	}

	.field {
		margin-bottom: var(--spacing-16);
	}

	button {
		height: 2rem;
		padding: 0 1rem;
		background-color: var(--color-primary);
		color: var(--color-text);
		font-size: var(--fs-base);
		font-weight: normal;
		float: right;
	}
</style>

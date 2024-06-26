<script lang="ts">
	import TableCell from './TableCell.svelte'
	import { page } from '$app/stores'
	import { getLastWeeksDate } from '$lib/utils'

	$: payments = $page.data.payments

	$: oldestDate = payments
		? new Date(Math.min(...[...payments.map((p: any) => new Date(p.createdAt)), Number(getLastWeeksDate())]))
		: getLastWeeksDate()
	$: latestDate = payments ? new Date(Math.max(...payments.map((p: any) => new Date(p.createdAt)))) : new Date()

	$: days = getDayInRange(oldestDate, latestDate)
	$: shownTags = $page.url.searchParams.get('tags') ? $page.url.searchParams.get('tags')?.split(',') : $page.data.tags

	let table: any = {}
	$: {
		days.forEach((day) => {
			// @ts-ignore
			table[day] = {}
			shownTags.forEach((tag: string) => {
				table[tag] = {}
				// @ts-ignore
				table[day][tag] = sumPayments(filterPayments(payments, { tag, day }))
				// @ts-ignore
				table[tag].tagSum = sumPayments(filterPayments(payments, { tag }))
			})
			// @ts-ignore
			table[day].dailySum = sumPayments(filterPayments(payments, { day }))
		})
		table.sum = sumPayments(payments)
	}

	//functions
	function getDayInRange(startDate: string | number | Date, endDate: string | number | Date) {
		const days: (string | number | Date)[] = []
		for (var d = new Date(startDate); new Date(startDate) <= d && d <= new Date(endDate); d.setDate(d.getDate() + 1)) {
			days.push(d.toLocaleDateString())
		}
		return days
	}

	function filterPayments(payments: any, { tag = null, day = null }) {
		if (tag) payments = payments.filter((payment: any) => payment.tags.includes(tag))
		if (day)
			payments = payments.filter(
				(payment: any) => new Date(payment.createdAt).toDateString() === new Date(day).toDateString()
			)
		return payments
	}

	function sumPayments(payments: any) {
		return payments.reduce((total: any, curr: any) => total + curr.amount, 0)
	}
</script>

<div class="container">
	<table>
		<tr class="title-row">
			<th>Date</th>
			{#each shownTags as tag}
				<th>{tag}</th>
			{/each}
			<th>Daily sum</th>
		</tr>
		{#key $page.data.theme}
			{#each days as day}
				<tr
					><th>{day}</th>
					{#each shownTags as tag}
						<TableCell --_color-percentage={`${(table[String(day)][tag] * 70) / table.sum}%`}
							>{table[String(day)][tag]}</TableCell
						>
					{/each}
					<TableCell --_color-percentage={`${(table[String(day)]?.dailySum * 70) / table.sum}%`}
						>{table[String(day)].dailySum}</TableCell
					>
				</tr>
			{/each}
			<th>Tag sum</th>
			{#each shownTags as tag}
				<TableCell --_color-percentage={`${(table[tag]?.tagSum * 70) / table.sum}%`}
					>{table[tag]?.tagSum || 0}</TableCell
				>
			{/each}
			<TableCell --_color-percentage="80%">{table.sum}</TableCell>
		{/key}
	</table>
</div>

<style>
	.container {
		min-height: 100%;
		width: 100%;
		color: var(--color-text);
		padding: 2rem;
		display: flex;
		justify-content: start;
		align-items: start;
	}

	table {
		border-collapse: collapse;
		font-size: var(--fs-base);
		width: fit-content;
	}

	th {
		width: 5rem;
		padding: 0.4rem 1rem;
		white-space: nowrap;
		text-align: center;
		background-color: var(--color-background);
		border: 1px solid var(--color-background-2);
		font-weight: 500;
	}

	.title-row {
		position: sticky;
		top: -1px;

		& th {
			padding: 0.6rem 1rem;
		}
	}

	:global(tr:hover td) {
		filter: contrast(1.1);
	}
</style>

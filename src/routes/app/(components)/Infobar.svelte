<script lang="ts">
	import type { Payment } from '@prisma/client'
	export let payments: Payment[]

	$: sum = roundNumber(
		payments.reduce((total: any, currentValue: any) => total + currentValue.amount, 0),
		2
	)
	$: avg = roundNumber(sum / payments.length, 2)
	$: dailyAvg = roundNumber(sum / getDayCount(payments), 2)

	const getDayCount = (payments: any) => {
		const daysSet = new Set()
		payments.forEach((payment: any) => {
			daysSet.add(new Date(payment.createdAt).toLocaleDateString())
		})
		return daysSet.size
	}

	function roundNumber(num: any, scale: any) {
		if (!('' + num).includes('e')) {
			// @ts-ignore
			return +(Math.round(num + 'e+' + scale) + 'e-' + scale)
		} else {
			var arr = ('' + num).split('e')
			var sig = ''
			if (+arr[1] + scale > 0) {
				sig = '+'
			}
			// @ts-ignore
			return +(Math.round(+arr[0] + 'e' + sig + (+arr[1] + scale)) + 'e-' + scale)
		}
	}
</script>

<div class="infobar">
	<span>
		Sum: {sum}
	</span>
	<span>
		Average: {avg}
	</span>
	<span>
		Average Per Day: {dailyAvg}
	</span>
</div>

<style>
	.infobar {
		width: 100%;
		height: 2rem;
		padding: 0 2rem;
		line-height: 2rem;
		font-size: var(--fs-base);

		background-color: hsl(var(--color-background));
		color: var(--color-text-70);
	}

	span {
		margin-right: 1rem;
	}
</style>

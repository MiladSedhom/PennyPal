<script lang="ts">
	import { afterUpdate, onMount } from 'svelte'
	import Chart from 'chart.js/auto'
	import Select from '$lib/components/Select.svelte'
	import { page } from '$app/stores'

	let chartCanvasRef: any
	let graphType = 'doughnut'
	$: chartLabels = (
		$page.url.searchParams.get('tags') ? $page.url.searchParams.get('tags')?.split(',') : $page.data.tags
	) as string[]

	$: chartData =
		$page.data.payments &&
		chartLabels.map((t) =>
			$page.data.payments
				.filter((p: any) => p.tags.includes(t))
				.reduce((total: any, next: any) => {
					return total + next.amount
				}, 0)
		)

	let chartConfig: any
	$: chartConfig = {
		type: graphType,
		data: {
			labels: chartLabels,
			datasets: [
				{
					label: 'Amount',
					backgroundColor: ['#05ad5c', '#ef9995', '#f49a25', '#1864f2'],
					data: chartData
				}
			]
		},
		options:
			graphType != 'polarArea'
				? {}
				: {
						scales: {
							r: {
								grid: {
									color: 'hsla(0,0%,100%,.4)'
								},
								ticks: {
									backgroundColor: 'red',
									color: 'hsl(0,0%,0%)'
								}
							}
						}
					}
	}

	Chart.defaults.color = $page.data.theme === 'dark' ? 'white' : 'black'
	Chart.defaults.borderColor = 'hsla(0,0%,100%,.4)'

	let chart: any

	onMount(async () => {
		chart = new Chart(chartCanvasRef, chartConfig)
	})

	afterUpdate(async () => {
		if (chart.config.type != graphType) {
			chart.destroy()
			chart = new Chart(chartCanvasRef, chartConfig)
			return
		}
		chart.data.labels = chartLabels
		chart.data.datasets[0].data = chartData
		chart.update()
	})
</script>

<section>
	<div class="canvas-wrapper">
		<canvas bind:this={chartCanvasRef} id="myChart" />
	</div>

	<Select
		bind:value={graphType}
		options={['pie', 'doughnut', 'polarArea', 'bar'].map((e) => {
			return { label: e[0].toUpperCase() + e.slice(1) + ' Graph', value: e }
		})}
		placeholder="Select Graph Type"
	/>
</section>

<style>
	section {
		padding: 4rem 4rem 0 4rem;
		color: white;
		display: grid;
		place-content: center;
		gap: 2rem;
		width: 100%;
		min-height: 100%;
	}

	.canvas-wrapper {
		width: 500px;
		height: 500px;
		display: grid;
		place-content: center;
	}

	@media screen and (max-width: 600px) {
		.canvas-wrapper {
			width: 300px;
			height: 300px;
		}
	}
</style>

<script lang="ts">
	import type { DateValue } from '@internationalized/date'
	import { DatePicker } from 'bits-ui'
	import { fade } from 'svelte/transition'

	export let label: string = 'Date'
	export let value: DateValue
</script>

<DatePicker.Root weekdayFormat="short" fixedWeeks={true} bind:value portal={null}>
	<div class="flex w-full flex-col gap-1.5">
		<DatePicker.Label class="text-3 text-text-90 block select-none ">{label}</DatePicker.Label>
		<DatePicker.Input
			let:segments
			class="bg-fields focus-within:(outline-primary outline) hover:(outline-grey outline) hover:focus-within:outline-primary rounded-1 outline-offset-3
			flex h-12 w-full select-none items-center px-2 py-3 text-sm outline-2 outline-2  "
		>
			{#each segments as { part, value }}
				<div class="inline-block select-none">
					{#if part === 'literal'}
						<DatePicker.Segment {part} class="p-1">
							{value}
						</DatePicker.Segment>
					{:else}
						<DatePicker.Segment
							{part}
							class="rounded-5px hover:bg-grey-2 focus:bg-grey-2 aria-[valuetext=Empty]:text-text-60 px-1 py-1 focus-visible:!outline-none "
						>
							{value}
						</DatePicker.Segment>
					{/if}
				</div>
			{/each}
			<DatePicker.Trigger
				class="text-text-90 active:bg-primary hover:bg-muted rounded-1 focus-visible:(bg-muted !outline-0) ml-auto inline-flex size-8 items-center justify-center !ring-0 transition-colors"
			>
				<div class="i-tabler-calendar text-6"></div>
			</DatePicker.Trigger>
		</DatePicker.Input>
		<DatePicker.Content sideOffset={6} transition={fade} class=" z-50">
			<DatePicker.Calendar class="bg-bg rounded-2 border-grey-2 border p-4" let:months let:weekdays>
				<DatePicker.Header class="flex items-center justify-between">
					<DatePicker.PrevButton
						class="rounded-1 bg-background-alt hover:bg-muted active:scale-98 inline-flex size-10 items-center justify-center transition-all"
					>
						<div class="i-tabler-caret-left-filled text-6"></div>
					</DatePicker.PrevButton>
					<DatePicker.Heading class="text-14px font-medium" />
					<DatePicker.NextButton
						class="rounded-1 hover:bg-muted active:scale-98 inline-flex size-10 items-center justify-center transition-all"
					>
						<div class="i-tabler-caret-right-filled text-6"></div>
					</DatePicker.NextButton>
				</DatePicker.Header>
				<div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
					{#each months as month}
						<DatePicker.Grid class="w-full border-collapse select-none space-y-1">
							<DatePicker.GridHead>
								<DatePicker.GridRow class="mb-1 flex w-full justify-between">
									{#each weekdays as day}
										<DatePicker.HeadCell class="text-text-70 w-10 rounded-md text-xs !font-normal">
											<div>{day.slice(0, 2)}</div>
										</DatePicker.HeadCell>
									{/each}
								</DatePicker.GridRow>
							</DatePicker.GridHead>
							<DatePicker.GridBody>
								{#each month.weeks as weekDates}
									<DatePicker.GridRow class="flex w-full">
										{#each weekDates as date}
											<DatePicker.Cell {date} class="relative size-10 !p-0 text-center text-sm">
												<DatePicker.Day
													{date}
													month={month.value}
													class="rounded-1 text-6 hover:bg-muted data-[selected]:bg-primary data-[disabled]:text-text-60 data-[selected]:text-text-alt data-[unavailable]:text-text-60 hover:border-border group relative inline-flex size-8 items-center justify-center whitespace-nowrap border border-transparent bg-transparent p-0 text-sm font-normal transition-all data-[disabled]:pointer-events-none data-[outside-month]:pointer-events-none data-[selected]:font-medium data-[unavailable]:line-through"
												>
													<div
														class="bg-text group-data-[selected]:bg-bg absolute top-0 hidden size-1 rounded-full transition-all group-data-[today]:block"
													/>
													{date.day}
												</DatePicker.Day>
											</DatePicker.Cell>
										{/each}
									</DatePicker.GridRow>
								{/each}
							</DatePicker.GridBody>
						</DatePicker.Grid>
					{/each}
				</div>
			</DatePicker.Calendar>
		</DatePicker.Content>
	</div>
</DatePicker.Root>

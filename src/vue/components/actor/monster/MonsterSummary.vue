<template>
	<section class="monster-summary">
		<!-- Biography (enriched, read-only) -->
		<div class="summary-bio" v-html="context.editors['system.biography']?.enriched || ''"></div>

		<hr />

		<!-- Traits and Moves side by side -->
		<div class="summary-columns">
			<div class="summary-column">
				<ul class="summary-traits">
					<li v-for="(t, i) in context.system.traits" :key="`trait-${i}`" class="item-trait">
						<i class="fas fa-asterisk" aria-hidden="true"></i>
						<span>{{ t }}</span>
					</li>
				</ul>
			</div>
			<div class="summary-column">
				<ul class="summary-moves">
					<li v-for="(m, i) in context.system.moves" :key="`move-${i}`" class="item-move">
						<i class="far fa-dot-circle" aria-hidden="true"></i>
						<span>{{ m }}</span>
					</li>
				</ul>
			</div>
		</div>

		<!-- Desires -->
		<div class="summary-desires" v-if="context.system.desires && context.system.desires.length">
			<p v-if="context.system.desires[0]?.value"><strong>Wants</strong> {{ context.system.desires[0].value }}</p>
			<p v-if="context.system.desires[1]?.value"><strong>Doesn't want</strong> {{ context.system.desires[1].value }}</p>
		</div>

		<hr />

		<!-- Sensories -->
		<ul class="summary-sensories">
			<li v-if="context.system.sensories?.sights"><span class="label">Sights</span> {{ context.system.sensories.sights }}</li>
			<li v-if="context.system.sensories?.sounds"><span class="label">Sounds</span> {{ context.system.sensories.sounds }}</li>
			<li v-if="context.system.sensories?.smells"><span class="label">Smells</span> {{ context.system.sensories.smells }}</li>
		</ul>

		<!-- Tables -->
		<div class="summary-tables" v-if="context.system.tables && context.system.tables.length">
			<div class="summary-table" v-for="(table, tKey) in context.system.tables" :key="`table-${tKey}`">
				<div class="summary-table-title">{{ table.name }}</div>
				<div v-if="table.instructions" class="summary-table-instructions">{{ table.instructions }}</div>
				<div class="summary-table-columns">
					<ol class="summary-table-col" v-for="(col, cKey) in table.table" :key="`col-${cKey}`">
						<li v-for="(row, rKey) in col" :key="`row-${rKey}`">{{ row }}</li>
					</ol>
				</div>
			</div>
		</div>
	</section>
</template>

<script setup>
const props = defineProps(['context']);
</script>

<template>
	<div class="quest-fields">
		<!-- Quest meta: completed, abandoned, size -->
		<fieldset class="quest-meta-fieldset">
			<legend>{{ context.item.name || "Quest" }}</legend>
			<div class="flexrow quest-meta-row">
				<label class="checkbox quest-completed">
					<input type="checkbox"
						name="system.completed"
						v-model="context.system.completed" />
					<span>{{ context.systemFields.completed.label }}</span>
				</label>
				<label class="checkbox quest-abandoned">
					<input type="checkbox"
						name="system.abandoned"
						v-model="context.system.abandoned" />
					<span>{{ context.systemFields.abandoned.label }}</span>
				</label>
				<div class="quest-size">
					<label>{{ context.systemFields.size.label }}</label>
					<select
						name="system.size"
						v-model="context.system.size">
						<option value="short">Short</option>
						<option value="medium">Medium</option>
						<option value="long">Long</option>
					</select>
				</div>
			</div>
		</fieldset>

		<!-- Milestones -->
		<fieldset class="quest-milestones-fieldset add-another-entries">
			<legend>{{ context.systemFields.milestones.label }}</legend>
			<button
				class="legend-control entry-create"
				title="Add milestone"
				data-action="createArrayEntry"
				data-field="milestones">
				<i class="fas fa-plus"></i>
			</button>
			<div class="quests entries form-group stacked">
				<div
					class="quest entry form-group stacked"
					v-for="(milestone, key) in context.system.milestones"
					:key="key">
					<div class="flexrow" style="gap: 8px; align-items: center;">
						<!-- Active milestone (radio group) -->
						<input
							type="radio"
							class="milestone-active"
							name="system.activeMilestone"
							:value="key"
							v-model.number="context.system.activeMilestone" />

						<!-- Milestone label -->
						<input
							type="text"
							:name="`system.milestones.${key}.label`"
							v-model="context.system.milestones[key].label"
							:placeholder="`Milestone ${key + 1}`" />

						<!-- Done checkbox -->
						<label
							class="milestone-done-label"
							:for="`milestone-done-${key}`">
							<input
								:id="`milestone-done-${key}`"
								type="checkbox"
								:name="`system.milestones.${key}.done`"
								v-model="context.system.milestones[key].done" />
							<span>done</span>
						</label>

						<!-- Delete -->
						<a
							class="entry-delete"
							title="Delete milestone"
							data-action="deleteArrayEntry"
							data-field="milestones"
							:data-key="key">
							<i class="fas fa-trash"></i>
						</a>
					</div>
				</div>
			</div>
		</fieldset>
	</div>
</template>

<script setup>
const props = defineProps(["context"]);
const context = props.context;
</script>

<template>
	<div class="grid grid-2col">
		<!-- Backgrounds as items -->
	    <section class="details-left-col">
	        <CharBackgrounds :actor="actor" :context="context" />
	    </section>
		<!-- Right Column: conditions, flaws, assets, bonds -->
		<div class="details-right-col grid-span-1 grid-start-2">
		<!-- Conditions -->
		<fieldset class="conditions-fieldset">
			<legend>{{ context.systemFields.conditions.label }}</legend>
			<button class="condition-control condition-create"
				title="Add condition"
				data-action="createArrayEntry"
				data-field="conditions"
			><i class="fas fa-plus"></i></button>
			<div class="conditions form-group stacked">
				<div class="condition form-group stacked" v-for="(condition, key) in context.system.conditions" :key="key">
					<!-- Duration -->
					<div class="condition-duration">
						<RollPoolInput v-if="condition.severity !== 'permanent'"
							button-action="rollPool"
							field="conditions"
							:field-key="key"
							:field-name="`system.conditions.${key}.pool.diceNum`"
							:pool="condition.pool"
							min="0"
						/>
						<select :name="`system.conditions.${key}.severity`" v-model="condition.severity">
							<option v-for="(choice, choiceKey) in context.systemFields.conditions.element.fields.severity.choices"
								:key="choiceKey"
								:value="choiceKey"
							>{{ choice }}</option>
						</select>
					</div>
					<!-- Name with tooltip -->
					<div class="tooltip-wrapper">
						<input type="text"
							:name="`system.conditions.${key}.name`"
							v-model="condition.name"
							placeholder="Condition name"
						/>
						<div class="tooltip">{{ condition.name }}</div>
					</div>
					<!-- Remove -->
					<a class="condition-control condition-delete"
						title="Delete condition"
						data-action="deleteArrayEntry"
						data-field="conditions"
						:data-key="key"
					><i class="fas fa-trash"></i></a>
				</div>
			</div>
		</fieldset>
    <!-- Flaws -->
    <fieldset class="flaws-fieldset">
      <legend>{{ context.systemFields.flaws?.label ?? 'Flaws' }}</legend>
      <div class="flaws form-group stacked">
        <ul class="active-flaws" v-if="activeBackgroundFlaws.length">
          <li v-for="(flaw, i) in activeBackgroundFlaws" :key="`af-${i}`">
            <span class="flaw-icon">!</span>{{ flaw }}
          </li>
        </ul>
        <p v-else class="flaws-empty">No active flaws</p>
      </div>
    </fieldset>

    <!-- Special Assets -->
    <fieldset class="special-assets-fieldset">
      <legend>{{ context.systemFields.specialAssets?.label ?? 'Special Assets' }}</legend>
      <div class="special-assets form-group stacked">
        <input type="text"
               name="system.specialAssets.0"
               v-model="context.system.specialAssets[0]"
               placeholder="Asset 1"/>
        <input type="text"
               name="system.specialAssets.1"
               v-model="context.system.specialAssets[1]"
               placeholder="Asset 2"/>
        <input type="text"
               name="system.specialAssets.2"
               v-model="context.system.specialAssets[2]"
               placeholder="Asset 3"/>
        <input type="text"
               name="system.specialAssets.3"
               v-model="context.system.specialAssets[3]"
               placeholder="Asset 4"/>
      </div>
    </fieldset>

    <!-- Bonds -->
		<fieldset class="bonds-fieldset">
			<legend>{{ context.systemFields.bonds.label }}</legend>
			<button class="bond-control bond-create"
				title="Add bond"
				data-action="createArrayEntry"
				data-field="bonds"
			><i class="fas fa-plus"></i></button>
			<div class="bonds form-group stacked">
				<div class="bond form-group stacked" v-for="(bond, key) in context.system.bonds" :key="key">
					<input type="text"
						:name="`system.bonds.${key}.name`"
						v-model="bond.name"
						placeholder="Character"/>
					<input type="text"
						:name="`system.bonds.${key}.description`"
						v-model="bond.description"
						placeholder="Bond description"/>
					<a class="bond-control bond-delete"
						title="Delete bond"
						data-action="deleteArrayEntry"
						data-field="bonds"
						:data-key="key"
					><i class="fas fa-trash"></i></a>
				</div>
			</div>
		</fieldset>
		</div>
	</div>
</template>

<script setup>
import {
	RollPoolInput,
	CharBackgrounds
} from '@/components';
import { computed } from "vue";
const props = defineProps(['actor', 'context']);

const activeBackgroundFlaws = computed(() => {
	const backgrounds = props.context?.itemTypes?.background ?? [];
	return backgrounds.flatMap((bg) => {
		const flaws = bg.system?.flaws ?? [];
		return flaws
			.filter((f) => !!f?.active && !!f?.label)
			.map((f) => f.label);
	});
});
</script>

<style scoped>
.active-flaws {
  margin: 0;
  padding-left: 18px;
  color: var(--gw-danger, #e74c3c);
}

.active-flaws li {
  font-size: inherit;
}

.flaw-icon {
  font-weight: 700;
  margin-right: 6px;
}

.flaws-empty {
  opacity: 0.8;
  margin: 0;
}
</style>

<template>
  <div class="items-grid">
    <div class="items-col">
      <!-- Resources -->
      <fieldset class="resources-fieldset">
        <legend>{{ context.systemFields.resources?.label || 'Resources' }}</legend>
        <button
          class="resource-control resource-create"
          type="button"
          title="Add resource"
          data-action="createArrayEntry"
          data-field="resources"
        >
          <i class="fas fa-plus"></i>
        </button>
        <div class="resources form-group stacked">
          <div class="resource" v-for="(resource, key) in resources" :key="key">
            <RollPoolInput
              class="resource-pool"
              button-action="rollPool"
              field="resources"
              :field-key="key"
              :field-name="`system.resources.${key}.pool.diceNum`"
              :pool="resource?.pool ?? { diceNum: 0 }"
              min="0"
            />
            <div class="tooltip-wrapper resource-label">
              <input
                type="text"
                :name="`system.resources.${key}.label`"
                v-model="resource.label"
                placeholder="Resource label"
              />
              <span class="tooltip">{{ resource.label }}</span>
            </div>
            <a
              class="resource-control resource-delete"
              title="Delete resource"
              data-action="deleteArrayEntry"
              data-field="resources"
              :data-key="key"
            >
              <i class="fas fa-trash"></i>
            </a>
          </div>
        </div>
      </fieldset>
    </div>

    <div class="items-col">
      <!-- Treasure -->
      <fieldset class="treasure-fieldset">
        <legend>{{ context.systemFields.treasure?.label ?? 'Treasure' }}</legend>
        <div class="treasure-rows">
          <!-- Few -->
          <div class="treasure-label">{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.treasure.FIELDS.few.label') || 'a few coins' }}</div>
          <div class="treasure-checks">
            <template v-for="(val, idx) in treasure.few" :key="`few-${idx}`">
              <input type="checkbox" :name="`system.treasure.few.${idx}`" v-model="treasure.few[idx]" />
            </template>
          </div>
          <!-- Pouch -->
          <div class="treasure-label">{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.treasure.FIELDS.pouch.label') || 'a pouch of coins' }}</div>
          <div class="treasure-checks">
            <template v-for="(val, idx) in treasure.pouch" :key="`pouch-${idx}`">
              <input type="checkbox" :name="`system.treasure.pouch.${idx}`" v-model="treasure.pouch[idx]" />
            </template>
          </div>
          <!-- Bag -->
          <div class="treasure-label">{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.treasure.FIELDS.bag.label') || 'a bag of coins' }}</div>
          <div class="treasure-checks">
            <template v-for="(val, idx) in treasure.bag" :key="`bag-${idx}`">
              <input type="checkbox" :name="`system.treasure.bag.${idx}`" v-model="treasure.bag[idx]" />
            </template>
          </div>
          <!-- Chest -->
          <div class="treasure-label">{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.treasure.FIELDS.chest.label') || 'a chest of coins' }}</div>
          <div class="treasure-checks">
            <template v-for="(val, idx) in treasure.chest" :key="`chest-${idx}`">
              <input type="checkbox" :name="`system.treasure.chest.${idx}`" v-model="treasure.chest[idx]" />
            </template>
          </div>
        </div>
      </fieldset>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RollPoolInput } from '@/components';

const props = defineProps(['context']);

const resources = computed(() => props.context?.system?.resources ?? []);
const treasure = computed(() => ({
  few: props.context?.system?.treasure?.few ?? [],
  pouch: props.context?.system?.treasure?.pouch ?? [],
  bag: props.context?.system?.treasure?.bag ?? [],
  chest: props.context?.system?.treasure?.chest ?? []
}));
</script>

<style scoped>
.items-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: flex-start;
}

.items-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.resources-fieldset {
  position: relative;
}

.resource-create {
  position: absolute;
  top: -20px;
  right: 16px;
  width: 20px;
  height: 20px;
  text-align: center;
  line-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resources {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.resource {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding-right: 28px;
}

.resource-pool .roll-pool {
  margin: 0;
}

.resource-label {
  flex: 0 0 60%;
  max-width: 60%;
  min-width: 0;
}

.resource-label input {
  width: 100%;
}

.resource-delete {
  display: none;
  position: absolute;
  right: -16px;
  top: 0;
  bottom: 0;
  margin: auto;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border: 1px solid;
  border-radius: 4px;
  background: black;
}

.resource:hover .resource-delete {
  display: flex;
  align-items: center;
  justify-content: center;
}

.treasure-checks {
  display: inline-flex;
  gap: 6px;
  flex-wrap: wrap;
}
</style>

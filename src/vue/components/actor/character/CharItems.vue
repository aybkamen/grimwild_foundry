<template>
  <div class="items-grid">
    <div class="items-col">
      <!-- Backpack (left column, top) -->
      <fieldset class="backpack-fieldset">
        <legend>{{ context.systemFields.backpack?.label ?? 'Backpack' }}</legend>
        <div class="form-group stacked">
          <template v-for="i in 10" :key="i">
            <div class="tooltip-wrapper bp-slot">
              <input
                type="text"
                class="backpack-slot"
                :name="`system.backpack.${i-1}`"
                v-model="context.system.backpack[i-1]"
                :placeholder="`Backpack Slot ${i}`"
              />
              <span class="tooltip">{{ context.system.backpack[i-1] }}</span>
            </div>
          </template>
        </div>
      </fieldset>

      <!-- Resources (left column, bottom) -->
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
          <div class="resource" v-for="(resource, key) in context.system.resources" :key="key">
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
      <!-- Treasure (right column, top) -->
      <fieldset class="treasure-fieldset">
        <legend>{{ context.systemFields.treasure?.label ?? 'Treasure' }}</legend>
        <div class="treasure-rows">
          <!-- Few -->
          <div class="treasure-label">{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.treasure.FIELDS.few.label') || 'a few coins' }}</div>
          <div class="treasure-checks">
            <template v-for="(val, idx) in context.system.treasure.few" :key="`few-${idx}`">
              <input type="checkbox" :name="`system.treasure.few.${idx}`" v-model="context.system.treasure.few[idx]" />
            </template>
          </div>
          <!-- Pouch -->
          <div class="treasure-label">{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.treasure.FIELDS.pouch.label') || 'a pouch of coins' }}</div>
          <div class="treasure-checks">
            <template v-for="(val, idx) in context.system.treasure.pouch" :key="`pouch-${idx}`">
              <input type="checkbox" :name="`system.treasure.pouch.${idx}`" v-model="context.system.treasure.pouch[idx]" />
            </template>
          </div>
          <!-- Bag -->
          <div class="treasure-label">{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.treasure.FIELDS.bag.label') || 'a bag of coins' }}</div>
          <div class="treasure-checks">
            <template v-for="(val, idx) in context.system.treasure.bag" :key="`bag-${idx}`">
              <input type="checkbox" :name="`system.treasure.bag.${idx}`" v-model="context.system.treasure.bag[idx]" />
            </template>
          </div>
          <!-- Chest -->
          <div class="treasure-label">{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.treasure.FIELDS.chest.label') || 'a chest of coins' }}</div>
          <div class="treasure-checks">
            <template v-for="(val, idx) in context.system.treasure.chest" :key="`chest-${idx}`">
              <input type="checkbox" :name="`system.treasure.chest.${idx}`" v-model="context.system.treasure.chest[idx]" />
            </template>
          </div>
        </div>
      </fieldset>

      <!-- Arcana (right column, bottom) -->
      <fieldset class="arcana-fieldset">
        <legend>Arcana</legend>
        <div class="arcana-header">
          <span class="arcana-col arcana-col-name">Name</span>
          <span class="arcana-col arcana-col-formula">Formula</span>
          <div class="arcana-col arcana-col-actions">
            <button
              v-if="context.editable"
              class="item-control item-create"
              type="button"
              title="Create arcana"
              data-action="createDoc"
              data-document-class="Item"
              data-type="arcana"
            >
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
        <div class="arcana-list">
          <div
            v-for="(item, idx) in arcana"
            :key="item._id || idx"
            class="arcana-row"
            data-document-class="Item"
            data-drag="true"
            draggable="true"
            :data-item-id="item._id"
          >
            <div class="arcana-name">
              <a
                class="arcana-roll rollable"
                title="Roll arcana"
                data-action="roll"
                data-roll-type="item"
              >
                <i class="fas fa-dice-d6"></i>
              </a>
              <span class="arcana-title">{{ item.name }}</span>
            </div>
            <div class="arcana-formula">
              {{ item.system?.formula || '-' }}
            </div>
            <div class="arcana-actions">
              <a
                class="item-control item-edit"
                title="Open arcana"
                data-action="viewDoc"
              >
                <i class="fas fa-edit"></i>
              </a>
              <a
                v-if="context.editable"
                class="item-control item-delete"
                title="Delete arcana"
                data-action="deleteDoc"
              >
                <i class="fas fa-trash"></i>
              </a>
            </div>
          </div>
          <p v-if="arcana.length === 0" class="arcana-empty">No arcana added yet.</p>
        </div>
      </fieldset>
    </div>
  </div>
  
</template>

<script setup>
import { computed } from 'vue';
import { RollPoolInput } from '@/components';
const props = defineProps(['actor', 'context']);

const arcana = computed(() => props.context?.itemTypes?.arcana ?? props.context?.arcana ?? []);
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

.arcana-fieldset {
  position: relative;
}

.arcana-header {
  display: grid;
  grid-template-columns: 1fr max-content max-content;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.arcana-col {
  font-variant: small-caps;
  letter-spacing: 0.5px;
}

.arcana-col-actions {
  justify-self: end;
}

.arcana-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.arcana-row {
  display: grid;
  grid-template-columns: 1fr max-content max-content;
  align-items: center;
  column-gap: 10px;
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--gw-faint, rgba(255, 255, 255, 0.15));
}

.arcana-name {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.arcana-roll {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  border-radius: 4px;
  background: black;
  font-size: 12px;
  line-height: 1;
}

.arcana-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arcana-formula {
  font-family: var(--font-monospace, monospace);
  font-size: 0.95em;
  opacity: 0.9;
}

.arcana-actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-self: end;
}

.arcana-empty {
  opacity: 0.8;
  font-style: italic;
  margin: 0;
}
</style>

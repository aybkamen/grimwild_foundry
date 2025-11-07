<template>
  <section class="items challenges flexcol">
    <div class="flexrow items-header">
      <div class="item-name">{{ header }}</div>
      <div class="item-controls">
        <template v-if="context.editable">
          <button class="item-control item-create"
                  title="Create item"
                  data-action="createDoc"
                  data-document-class="Item"
                  data-type="challenge"
                  v-bind="{ 'data-system.group': group }"
                  type="button">
            <i class="fas fa-plus"></i><span>Add</span>
          </button>
        </template>
      </div>
    </div>
    <ol class="items-list grid-span-3">
      <li v-for="(item, id) in filteredChallenges" :key="id"
          :class="`item challenge flexcol ${context.activeItems?.[item._id] ? 'active' : ''}`"
          :data-item-id="item._id"
          data-drag="true"
          draggable="true"
          data-document-class="Item">
        <div class="item-summary flexcol">
          <div class="item-name flexrow">
            <div class="challenge-pool">
              <RollPoolInput
                button-action="roll"
                button-roll-type="item"
                input-action="updateChallengePool"
                :item-id="item.id"
                :pool="item.system.pool"
                :no-input="true"
                min="0"/>
            </div>
            <div class="challenge-name">{{ item.name }}</div>
          </div>
          <div class="suspense-controls flexrow">
            <div class="suspense form-group stacked">
              <div class="form-inputs">
                <input type="checkbox" data-action-change="updateItemField" data-field="system.suspense.steps" data-key="0" :data-item-id="item.id" v-model="item.system.suspense.steps[0]"/>
                <input type="checkbox" data-action-change="updateItemField" data-field="system.suspense.steps" data-key="1" :data-item-id="item.id" v-model="item.system.suspense.steps[1]"/>
              </div>
            </div>
            <div class="item-controls">
              <a class="item-control item-edit" data-action="viewDoc"><i class="fas fa-edit"></i></a>
              <a class="item-control item-delete" v-if="context.editable" data-action="deleteDoc"><i class="fas fa-trash"></i></a>
            </div>
          </div>
        </div>

        <div class="challenge-fields-wrapper">
          <div class="item-description flexcol">
            <div v-if="item.system.description.length" class="item-description-content" v-html="context.editors[`items.${item.id}.system.description`].enriched"></div>
            <ul v-if="item.system.traits.length > 0" class="item-traits">
              <li v-for="(trait, traitKey) in item.system.traits" :key="traitKey" class="item-trait">{{ trait }}</li>
            </ul>
            <template v-if="item.system.moves.length > 0">
              <hr/>
              <ul class="item-moves">
                <li v-for="(move, moveKey) in item.system.moves" :key="moveKey" class="item-move">{{ move }}</li>
              </ul>
            </template>
            <template v-if="item.system.failure.length > 0">
              <hr/>
              <ul class="item-failure">
                <li v-for="(fail, failKey) in item.system.failure" :key="failKey" class="item-fail form-group">
                  <RollPoolInput v-if="fail.pool.diceNum > 0"
                                 button-action="rollPool"
                                 button-roll-type="item"
                                 field="failure"
                                 :field-key="failKey"
                                 :no-input="true"
                                 :item-id="item.id"
                                 :pool="fail.pool"
                                 min="0"/>
                  <span>{{ fail.value }}</span>
                </li>
              </ul>
            </template>
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { RollPoolInput } from '@/components';
const props = defineProps(["context", "group"]);

const filteredChallenges = computed(() => {
  const all = props.context.itemTypes?.challenge ?? [];
  return all.filter(i => (i.system?.group ?? '') === (props.group ?? ''));
});

const header = computed(() => props.group === 'pressure' ? 'Pressure' : 'Challenges');
</script>

<style scoped>
.items-list {
  columns: 3;
  column-gap: 8px;
  padding: 8px 0;
}
.challenge { break-inside: avoid-column; background: #dbd2bca9; border-radius: 4px; padding: 4px; }
body.theme-dark .challenge { background: var(--background); }
.item-summary { background: #ffffff44; padding: 0 2px; }
body.theme-dark .item-summary { background: #ffffff11; }
.item-summary .item-name { border-bottom: 1px solid; padding: 4px 0; gap: 2px; cursor: inherit; }
.item-description-content { padding: 4px 8px; margin: 4px; background: var(--color-dark-2); border-radius: 4px; }
.suspense-controls { padding: 4px 2px 2px; }
</style>

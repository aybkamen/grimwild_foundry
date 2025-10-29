<template>
  <section class="battleground-enemies flexcol">
    <fieldset class="enemies-fieldset">
      <legend>Enemies</legend>
      <button class="enemy-control enemy-create"
              title="Add enemy"
              data-action="createArrayEntry"
              data-field="enemies"><i class="fas fa-plus"></i></button>

      <div class="enemies form-group stacked">
        <div class="enemy" v-for="(enemy, key) in context.system.enemies" :key="key">
          <div class="enemy-line">
            <!-- Type -->
            <select class="enemy-type" :name="`system.enemies.${key}.type`" v-model="enemy.type">
              <option value="fixed">Fixed</option>
              <option value="pool">Pool</option>
              <option value="challenge">Challenge</option>
            </select>

            <!-- Fixed count -->
            <template v-if="enemy.type === 'fixed'">
              <input class="enemy-count" type="number" min="1"
                     :name="`system.enemies.${key}.count`" v-model.number="enemy.count" />
            </template>

            <!-- Pool (pool and challenge both show pool dice) -->
            <template v-else>
              <RollPoolInput
                class="enemy-pool"
                button-action="rollPool"
                field="enemies"
                :field-key="key"
                :field-name="`system.enemies.${key}.pool.diceNum`"
                :pool="enemy.pool"
                :min="0"/>
            </template>

            <!-- Name -->
            <input type="text" class="enemy-name" :name="`system.enemies.${key}.name`" v-model="enemy.name" placeholder="Monster"/>

            <!-- Delete -->
            <a class="enemy-control enemy-delete"
               title="Delete enemy"
               data-action="deleteArrayEntry"
               data-field="enemies"
               :data-key="key"><i class="fas fa-trash"></i></a>
          </div>
        </div>
      </div>
    </fieldset>
  </section>
</template>

<script setup>
import { RollPoolInput } from '@/components';
const props = defineProps(['context']);
</script>


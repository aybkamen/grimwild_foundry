<template>
  <section class="faction-goals flexcol">
    <fieldset class="goals-fieldset">
      <legend>Goals</legend>
      <button class="goal-control goal-create"
              title="Add goal"
              data-action="createArrayEntry"
              data-field="goals"><i class="fas fa-plus"></i></button>

      <div class="goals form-group stacked">
        <div class="goal" v-for="(goal, key) in context.system.goals" :key="key">
          <div class="goal-line">
            <RollPoolInput
              class="goal-pool"
              button-action="rollPool"
              field="goals"
              :field-key="key"
              :field-name="`system.goals.${key}.pool.diceNum`"
              :pool="goal.pool"
              :min="0"/>

            <input type="text" class="goal-name"
                   :name="`system.goals.${key}.name`"
                   v-model="goal.name"
                   placeholder="Goal name"/>

            <a class="goal-control goal-delete"
               title="Delete goal"
               data-action="deleteArrayEntry"
               data-field="goals"
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


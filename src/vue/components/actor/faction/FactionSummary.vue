<template>
  <section class="faction-summary flexcol">
    <strong>Resources</strong>
    <!-- Resources line -->
    <div class="summary-line">
      <ul class="summary-bullets">
        <li v-for="(res, i) in (context.system.resources || []).filter(r=>r?.length)" :key="i">{{ res }}</li>
      </ul>
    </div>

    <!-- Goals -->
    <strong>Goals</strong>
    <div class="summary-line">  
      <ul class="summary-goals">
        <li class="summary-goal" v-for="(goal, key) in context.system.goals" :key="key">
          <RollPoolInput
            button-action="rollPool"
            input-action="updateGoalPool"
            field="goals"
            :field-key="key"
            :field-name="''"
            :pool="goal.pool"
            :min="0"/>
          <span class="goal-sep">-</span>
          <span class="goal-text">{{ goal.name }}<span v-if="goal.term"> ({{ termLabel(goal.term) }})</span></span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup>
import { RollPoolInput } from '@/components';
const props = defineProps(['context']);

function termLabel(val) {
  const map = {
    short: 'Short Term',
    medium: 'Medium Term',
    long: 'Long Term'
  };
  return map[val] ?? val;
}
</script>

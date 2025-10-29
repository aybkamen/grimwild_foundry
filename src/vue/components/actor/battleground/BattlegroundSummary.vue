<template>
  <section class="battleground-summary flexcol">
    <!-- Features line -->
    <div class="summary-line">
      <strong>Features</strong>
      <span class="summary-values">{{ (context.system.features || []).filter(f=>f?.length).join(', ') }}</span>
    </div>

    <!-- Threats lines -->
    <div class="summary-line">
      <strong>Threats</strong>
      <div class="summary-threats">
        <template v-for="(threat, key) in context.system.threats" :key="key">
          <div class="summary-threat">
            <!-- Suspense -->
            <template v-if="threat.type === 'suspense'">
              <input type="checkbox"
                     :name="`system.threats.${key}.suspense.steps.0`"
                     v-model="threat.suspense.steps[0]"/>
              <input type="checkbox"
                     :name="`system.threats.${key}.suspense.steps.1`"
                     v-model="threat.suspense.steps[1]"/>
              <span class="threat-name">{{ threat.name }}</span>
            </template>
            <!-- Timer -->
            <template v-else>
              <RollPoolInput
                button-action="rollPool"
                field="threats"
                :field-key="key"
                :field-name="`system.threats.${key}.pool.diceNum`"
                :pool="threat.pool"
                :min="0"/>
              <span class="threat-name">{{ threat.name }}</span>
            </template>
          </div>
        </template>
      </div>
    </div>

    <hr/>

    <!-- Enemies -->
    <div class="summary-enemies">
      <div class="summary-enemy" v-for="(enemy, key) in context.system.enemies" :key="key">
        <!-- Fixed count controls -->
        <template v-if="enemy.type === 'fixed'">
          <button type="button" class="enemy-minus" data-action="adjustEnemyCount" :data-key="key" data-delta="-1">-</button>
          <input class="enemy-count" type="number" min="1"
                 :name="`system.enemies.${key}.count`" v-model.number="enemy.count" />
          <button type="button" class="enemy-plus" data-action="adjustEnemyCount" :data-key="key" data-delta="1">+</button>
        </template>
        <!-- Pool/Challenge group pool -->
        <template v-else>
          <RollPoolInput
            button-action="rollPool"
            field="enemies"
            :field-key="key"
            :field-name="`system.enemies.${key}.pool.diceNum`"
            :pool="enemy.pool"
            :min="0"/>
        </template>
        <span class="enemy-name">{{ enemy.name }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { RollPoolInput } from '@/components';
const props = defineProps(['context']);
</script>


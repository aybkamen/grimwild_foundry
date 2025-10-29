<template>
  <section class="battleground-features-threats flexcol">
    <!-- Features -->
    <fieldset class="features-fieldset">
      <legend>Features</legend>
      <button class="feature-control feature-create"
              title="Add feature"
              data-action="createArrayEntry"
              data-field="features"><i class="fas fa-plus"></i></button>
      <div class="features form-group stacked">
        <div class="feature form-group stacked" v-for="(feature, key) in context.system.features" :key="key">
          <input type="text"
                 :name="`system.features.${key}`"
                 v-model="context.system.features[key]"
                 placeholder="Feature"/>
          <a class="feature-control feature-delete"
             title="Delete feature"
             data-action="deleteArrayEntry"
             data-field="features"
             :data-key="key"><i class="fas fa-trash"></i></a>
        </div>
      </div>
    </fieldset>

    <!-- Threats -->
    <fieldset class="threats-fieldset">
      <legend>Threats</legend>
      <button class="threat-control threat-create"
              title="Add threat"
              data-action="createArrayEntry"
              data-field="threats"><i class="fas fa-plus"></i></button>

      <div class="threats form-group stacked">
        <div class="threat form-group" v-for="(threat, key) in context.system.threats" :key="key">
          <!-- Name -->
          <div class="form-group stacked">
            <label>Name</label>
            <input type="text"
                   :name="`system.threats.${key}.name`"
                   v-model="threat.name"
                   placeholder="Threat name"/>
          </div>
          <!-- Type -->
          <div class="form-group stacked">
            <label>Type</label>
            <select :name="`system.threats.${key}.type`" v-model="threat.type">
              <option value="suspense">Suspense</option>
              <option value="timer">Timer</option>
            </select>
          </div>
          <!-- Suspense controls -->
          <div v-if="threat.type === 'suspense'" class="suspense form-group stacked">
            <label>Suspense</label>
            <div class="form-inputs">
              <input type="checkbox"
                     :name="`system.threats.${key}.suspense.steps.0`"
                     v-model="threat.suspense.steps[0]"/>
              <input type="checkbox"
                     :name="`system.threats.${key}.suspense.steps.1`"
                     v-model="threat.suspense.steps[1]"/>
            </div>
          </div>
          <!-- Timer controls -->
          <div v-else class="timer form-group stacked">
            <label>Timer</label>
            <RollPoolInput
              button-action="rollPool"
              field="threats"
              :field-key="key"
              :field-name="`system.threats.${key}.pool.diceNum`"
              :pool="threat.pool"
              :min="0"/>
          </div>
          <!-- Remove threat -->
          <div class="form-group">
            <a class="threat-control threat-delete"
               title="Delete threat"
               data-action="deleteArrayEntry"
               data-field="threats"
               :data-key="key"><i class="fas fa-trash"></i></a>
          </div>
          <hr/>
        </div>
      </div>
    </fieldset>
  </section>
</template>

<script setup>
import { RollPoolInput } from '@/components';
const props = defineProps(['context']);
</script>


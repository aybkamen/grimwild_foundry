<template>
  <!-- Wises -->
  <fieldset class="wises-fieldset add-another-entries">
    <legend>{{ context.systemFields.wises.label }}</legend>
    <button class="legend-control entry-create"
            title="Add wise"
            data-action="createArrayEntry"
            data-field="wises">
      <i class="fas fa-plus"></i>
    </button>
    <div class="wises entries form-group stacked">
      <div class="wise entry form-group stacked" v-for="(wise, key) in context.system.wises" :key="key">
        <div class="flexrow" style="gap: 8px; align-items: center;">
          <input type="checkbox"
                 class="wise-active"
                 :name="`system.wises.${key}.active`"
                 v-model="context.system.wises[key].active" />
          <input type="text"
                 :name="`system.wises.${key}.label`"
                 v-model="context.system.wises[key].label"
                 placeholder="Wise" />
          <a class="entry-delete"
             title="Delete wise"
             data-action="deleteArrayEntry"
             data-field="wises"
             :data-key="key"><i class="fas fa-trash"></i></a>
        </div>
      </div>
    </div>
  </fieldset>

  <!-- Flaws -->
  <fieldset class="flaws-fieldset add-another-entries">
    <legend>{{ context.systemFields.flaws.label }}</legend>
    <button class="legend-control entry-create"
            title="Add flaw"
            data-action="createArrayEntry"
            data-field="flaws">
      <i class="fas fa-plus"></i>
    </button>
    <div class="flaws entries form-group stacked">
      <div class="flaw entry form-group stacked" v-for="(flaw, key) in context.system.flaws" :key="key">
        <div class="flexrow" style="gap: 8px; align-items: center;">
          <input type="checkbox"
                 class="flaw-active"
                 :name="`system.flaws.${key}.active`"
                 v-model="context.system.flaws[key].active" />
          <input type="text"
                 :name="`system.flaws.${key}.label`"
                 v-model="context.system.flaws[key].label"
                 placeholder="Flaw" />
          <a class="entry-delete"
             title="Delete flaw"
             data-action="deleteArrayEntry"
             data-field="flaws"
             :data-key="key"><i class="fas fa-trash"></i></a>
        </div>
      </div>
    </div>
  </fieldset>

  <!-- Quests -->
  <fieldset class="quests-fieldset add-another-entries">
    <legend>{{ context.systemFields.quests.label }}</legend>
    <button class="legend-control entry-create"
            title="Add quest"
            data-action="createArrayEntry"
            data-field="quests">
      <i class="fas fa-plus"></i>
    </button>
    <div class="quests entries form-group stacked">
      <div class="quest entry form-group stacked" v-for="(quest, key) in context.system.quests" :key="key">
        <div class="flexcol" style="gap: 6px;">
          <div class="flexrow" style="gap: 8px; align-items: center;">
            <input type="checkbox"
                   class="quest-active"
                   :name="`system.quests.${key}.active`"
                   v-model="context.system.quests[key].active" />
            <input type="text"
                   :name="`system.quests.${key}.label`"
                   v-model="context.system.quests[key].label"
                   placeholder="Quest" />
            <a class="entry-delete"
               title="Delete quest"
               data-action="deleteArrayEntry"
               data-field="quests"
               :data-key="key"><i class="fas fa-trash"></i></a>
          </div>
          <div class="flexrow" style="gap: 12px; align-items: center;">
            <label style="min-width: 80px;">Milestones</label>
            <input type="checkbox"
                   :name="`system.quests.${key}.milestones.0`"
                   v-model="context.system.quests[key].milestones[0]" />
            <input type="checkbox"
                   :name="`system.quests.${key}.milestones.1`"
                   v-model="context.system.quests[key].milestones[1]" />
            <input type="checkbox"
                   :name="`system.quests.${key}.milestones.2`"
                   v-model="context.system.quests[key].milestones[2]" />
          </div>
        </div>
      </div>
    </div>
  </fieldset>
</template>

<script setup>
const props = defineProps(["context"]);
</script>


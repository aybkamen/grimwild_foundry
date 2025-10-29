<template>
  <div :class="`grimwild-vue standard-form flexcol`">
    <div class="grimwild-sheet-layout flexcol">
      <MonsterHeader :context="context" />

      <div class="section--main flexcol">
        <Tabs :tabs="tabs.primary" no-span="true"/>
        <section class="section--fields flexcol">
          <!-- Features / Threats -->
          <Tab group="primary" :tab="tabs.primary.featuresThreats">
            <BattlegroundFeaturesThreats :context="context"/>
          </Tab>

          <!-- Challenges -->
          <Tab group="primary" :tab="tabs.primary.challenges">
            <MonsterChallenges :context="context"/>
          </Tab>

          <!-- Notes -->
          <Tab group="primary" :tab="tabs.primary.notes">
            <fieldset class="fieldset-prose-mirror">
              <legend>{{ context.systemFields.notes.label }}</legend>
              <Prosemirror :editable="context.editable" :field="context.editors['system.notes']"/>
            </fieldset>
          </Tab>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Tabs,
  Tab,
  MonsterHeader,
  MonsterChallenges,
  Prosemirror,
} from '@/components';
import BattlegroundFeaturesThreats from '@/components/actor/battleground/BattlegroundFeaturesThreats.vue';
import { reactive, toRaw } from 'vue';

const props = defineProps(['context']);
const rawTabs = toRaw(props.context.tabs);
const tabs = reactive({ ...rawTabs });
</script>


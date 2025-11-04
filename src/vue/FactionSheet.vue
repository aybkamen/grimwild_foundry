<template>
  <div :class="`grimwild-vue standard-form flexcol`">
    <div class="grimwild-sheet-layout flexcol">
      <MonsterHeader :context="context" />

      <div class="section--main flexcol">
        <Tabs :tabs="tabs.primary" no-span="true"/>
        <section class="section--fields flexcol">
          <!-- Summary (blank for now) -->
          <Tab group="primary" :tab="tabs.primary.summary">
            <FactionSummary :context="context" />
          </Tab>

          <!-- Resources -->
          <Tab group="primary" :tab="tabs.primary.resources">
            <FactionResources :context="context"/>
          </Tab>

          <!-- Goals -->
          <Tab group="primary" :tab="tabs.primary.goals">
            <FactionGoals :context="context"/>
          </Tab>

          <!-- Challenges (same component used by monsters) -->
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
import FactionResources from '@/components/actor/faction/FactionResources.vue';
import FactionGoals from '@/components/actor/faction/FactionGoals.vue';
import FactionSummary from '@/components/actor/faction/FactionSummary.vue';
import { reactive, toRaw } from 'vue';

const props = defineProps(['context']);
const rawTabs = toRaw(props.context.tabs);
const tabs = reactive({ ...rawTabs });
</script>


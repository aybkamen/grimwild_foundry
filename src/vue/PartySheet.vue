<template>
  <div :class="`grimwild-vue standard-form flexcol`">
    <div class="grimwild-sheet-layout flexcol">
      <MonsterHeader :context="context" />

      <div class="section--main flexcol">
        <Tabs :tabs="tabs.primary" no-span="true"/>
        <section class="section--fields flexcol">
          <!-- Group Members -->
          <Tab group="primary" :tab="tabs.primary.members">
            <PartyMembers :context="context" />
          </Tab>

          <!-- Items -->
          <Tab group="primary" :tab="tabs.primary.items">
            <PartyItems :context="context" />
          </Tab>

          <!-- Story Arcs / Quests -->
          <Tab group="primary" :tab="tabs.primary.storyArcs">
            <PartyStoryArcs :context="context" />
          </Tab>

          <!-- Details -->
          <Tab group="primary" :tab="tabs.primary.details">
            <PartyDetails :context="context" />
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
  Prosemirror,
} from '@/components';
import PartyMembers from '@/components/actor/party/PartyMembers.vue';
import PartyDetails from '@/components/actor/party/PartyDetails.vue';
import PartyStoryArcs from '@/components/actor/party/PartyStoryArcs.vue';
import PartyItems from '@/components/actor/party/PartyItems.vue';
import { reactive, toRaw } from 'vue';

const props = defineProps(['context']);
const rawTabs = toRaw(props.context.tabs);
const tabs = reactive({ ...rawTabs });
</script>

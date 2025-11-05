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
import { reactive, toRaw } from 'vue';

const props = defineProps(['context']);
const rawTabs = toRaw(props.context.tabs);
const tabs = reactive({ ...rawTabs });
</script>


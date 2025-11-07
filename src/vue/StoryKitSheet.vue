<template>
  <div :class="`grimwild-vue standard-form flexcol`">
    <div class="grimwild-sheet-layout flexcol">
      <MonsterHeader :context="context" />

      <div class="section--main flexcol">
        <Tabs :tabs="tabs.primary" no-span="true"/>
        <section class="section--fields flexcol">
          <!-- Description -->
          <Tab group="primary" :tab="tabs.primary.description">
            <StoryKitDescription :context="context" />
          </Tab>

          <!-- Pressure -->
          <Tab group="primary" :tab="tabs.primary.pressure">
            <StoryKitChallenges group="pressure" :context="context" />
          </Tab>

          <!-- Useful Pieces -->
          <Tab group="primary" :tab="tabs.primary.pieces">
            <StoryKitPieces :context="context" />
          </Tab>

          <!-- Set it Up -->
          <Tab group="primary" :tab="tabs.primary.setups">
            <StoryKitSetups :context="context" />
          </Tab>

          <!-- Challenges -->
          <Tab group="primary" :tab="tabs.primary.challenges">
            <StoryKitChallenges group="challenge" :context="context" />
          </Tab>

          <!-- Mix it up -->
          <Tab group="primary" :tab="tabs.primary.mix">
            <StoryKitMixItUp :context="context" />
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
import { Tabs, Tab, MonsterHeader, Prosemirror } from '@/components';
import StoryKitDescription from '@/components/actor/storykit/StoryKitDescription.vue';
import StoryKitChallenges from '@/components/actor/storykit/StoryKitChallenges.vue';
import StoryKitPieces from '@/components/actor/storykit/StoryKitPieces.vue';
import StoryKitSetups from '@/components/actor/storykit/StoryKitSetups.vue';
import StoryKitMixItUp from '@/components/actor/storykit/StoryKitMixItUp.vue';
import { reactive, toRaw } from 'vue';

const props = defineProps(['context']);
const rawTabs = toRaw(props.context.tabs);
const tabs = reactive({ ...rawTabs });
</script>


<template>
  <div :class="`grimwild-vue standard-form flexcol`">
    <div class="grimwild-sheet-layout flexcol">
      <MonsterHeader :context="context" />

      <div class="section--main flexcol">
        <Tabs :tabs="tabs.primary" no-span="true"/>
        <section class="section--fields flexcol">
          <!-- Summary -->
          <Tab group="primary" :tab="tabs.primary.summary">
            <StoryKitSummary :context="context" />
          </Tab>

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
            <fieldset class="hooks-fieldset form-group stacked">
              <legend>{{ game.i18n.localize('GRIMWILD.Actor.StoryKit.Tabs.MixItUp') }}</legend>
              <button class="hook-control hook-create" type="button" title="Add"
                      @click="addMix" :disabled="!context.editable"><i class="fas fa-plus"></i></button>
              <div class="hooks form-group stacked">
                <div class="hook form-group" v-for="(mix, key) in context.system.mixItUp" :key="key">
                  <input type="text"
                         :name="`system.mixItUp.${key}`"
                         v-model="context.system.mixItUp[key]"
                         :readonly="!context.editable"
                         @change="persistMixes"
                         @blur="persistMixes"
                         placeholder="Mix it up"/>
                  <a v-if="context.editable" class="hook-control hook-delete" title="Delete"
                     @click.prevent="removeMix(key)"><i class="fas fa-trash"></i></a>
                </div>
              </div>
            </fieldset>
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
import StoryKitSummary from '@/components/actor/storykit/StoryKitSummary.vue';
import StoryKitDescription from '@/components/actor/storykit/StoryKitDescription.vue';
import StoryKitChallenges from '@/components/actor/storykit/StoryKitChallenges.vue';
import StoryKitSetups from '@/components/actor/storykit/StoryKitSetups.vue';
import StoryKitPieces from '@/components/actor/storykit/StoryKitPieces.vue';
import { reactive, toRaw, inject } from 'vue';

const props = defineProps(['context']);
const rawTabs = toRaw(props.context.tabs);
const tabs = reactive({ ...rawTabs });
const actor = inject('rawDocument', null);

const addMix = async () => {
  if (!actor || !props.context?.editable) return;
  props.context.system.mixItUp.push("");
  await persistMixes();
};

const removeMix = async (index) => {
  if (!actor || !props.context?.editable) return;
  props.context.system.mixItUp.splice(index, 1);
  await persistMixes();
};

const persistMixes = async () => {
  if (!actor || !props.context?.editable) return;
  const hooks = (props.context.system?.hooks ?? []).map((h) => h ?? "");
  const mixes = (props.context.system?.mixItUp ?? []).map((m) => m ?? "");
  await actor.update({
    "system.hooks": hooks,
    "system.mixItUp": mixes
  }, { render: false });
};
</script>

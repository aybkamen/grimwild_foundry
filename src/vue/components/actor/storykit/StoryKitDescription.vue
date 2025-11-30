<template>
  <section class="storykit-description flexcol">
    <fieldset class="hooks-fieldset form-group stacked">
      <legend>{{ game.i18n.localize('GRIMWILD.Actor.StoryKit.FIELDS.hooks.label') }}</legend>
      <button class="hook-control hook-create" type="button" title="Add hook"
              @click="addHook" :disabled="!context.editable"><i class="fas fa-plus"></i></button>
      <div class="hooks form-group stacked">
        <div class="hook form-group" v-for="(hook, key) in context.system.hooks" :key="key">
          <input type="text"
                 :name="`system.hooks.${key}`"
                 v-model="context.system.hooks[key]"
                 :readonly="!context.editable"
                 @change="persistBoth"
                 @blur="persistBoth"
                 placeholder="Hook"/>
          <a v-if="context.editable" class="hook-control hook-delete" title="Delete hook"
             @click.prevent="removeHook(key)"><i class="fas fa-trash"></i></a>
        </div>
      </div>
    </fieldset>

    <fieldset class="fieldset-prose-mirror">
      <legend>{{ context.systemFields.biography.label }}</legend>
      <Prosemirror :editable="context.editable" :field="context.editors['system.biography']"/>
    </fieldset>
  </section>
</template>

<script setup>
import { Prosemirror } from '@/components';
import { inject } from 'vue';

const props = defineProps(['context']);
const actor = inject('rawDocument', null);

const addHook = async () => {
  if (!actor || !props.context?.editable) return;
  props.context.system.hooks.push("");
  await persistBoth();
};

const removeHook = async (index) => {
  if (!actor || !props.context?.editable) return;
  props.context.system.hooks.splice(index, 1);
  await persistBoth();
};

const persistBoth = async () => {
  if (!actor || !props.context?.editable) return;
  const hooks = (props.context.system?.hooks ?? []).map((h) => h ?? "");
  const mixes = (props.context.system?.mixItUp ?? []).map((m) => m ?? "");
  await actor.update({
    "system.hooks": hooks,
    "system.mixItUp": mixes
  }, { render: false });
};
</script>

<template>
  <section class="storykit-description flexcol">
    <fieldset class="hooks-fieldset form-group stacked">
      <legend>{{ game.i18n.localize('GRIMWILD.Actor.StoryKit.FIELDS.hooks.label') }}</legend>
      <button class="hook-control hook-create" type="button" title="Add hook"
              @click="addHook" :disabled="!canEdit"><i class="fas fa-plus"></i></button>
      <div class="hooks form-group stacked">
        <div class="hook form-group" v-for="(hook, key) in hooks" :key="key">
          <input type="text"
                 :name="`system.hooks.${key}`"
                 v-model="hooks[key]"
                 :readonly="!canEdit"
                 @change="saveHooks"
                 @blur="saveHooks"
                 placeholder="Hook"/>
          <a v-if="canEdit" class="hook-control hook-delete" title="Delete hook"
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
import { inject, ref, watch, computed } from 'vue';

const props = defineProps(['context']);
const actor = inject('rawDocument', null);
const hooks = ref([]);

const syncHooks = () => {
  const value = props.context?.system?.hooks;
  hooks.value = Array.isArray(value) ? [...value] : [];
};

syncHooks();
watch(() => props.context?._renderKey, syncHooks);
watch(() => props.context?.system?.hooks, syncHooks, { deep: true });

const canEdit = computed(() => !!props.context?.editable && !!actor);

const saveHooks = async () => {
  if (!canEdit.value || !actor) return;
  const clean = hooks.value.map((h) => h ?? "");
  try {
    await actor.update({ "system.hooks": clean }, { render: false });
  } catch (err) {
    console.warn("Failed to save hooks", err);
  }
};

const addHook = async () => {
  hooks.value = [...hooks.value, ""];
  await saveHooks();
};

const removeHook = async (index) => {
  hooks.value.splice(index, 1);
  hooks.value = [...hooks.value];
  await saveHooks();
};
</script>

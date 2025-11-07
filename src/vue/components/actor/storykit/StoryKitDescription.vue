<template>
  <section class="storykit-description flexcol">
    <fieldset class="hooks-fieldset form-group stacked">
      <legend>{{ $t?.('GRIMWILD.Actor.StoryKit.FIELDS.hooks.label') ?? 'Hooks' }}</legend>
      <button class="hook-control hook-create" title="Add hook"
              data-action="createArrayEntry" data-field="system.hooks"><i class="fas fa-plus"></i></button>
      <div class="hooks form-group stacked">
        <div class="hook form-group" v-for="(hook, key) in context.system.hooks" :key="key">
          <input type="text"
                 :name="`system.hooks.${key}`"
                 v-model="context.system.hooks[key]"
                 placeholder="Hook"/>
          <a class="hook-control hook-delete" title="Delete hook"
             data-action="deleteArrayEntry" data-field="system.hooks" :data-key="key"><i class="fas fa-trash"></i></a>
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
const props = defineProps(['context']);
</script>


<template>
  <section class="storykit-description flexcol">
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

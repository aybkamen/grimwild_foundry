<template>
  <section class="faction-description flexcol">
    <fieldset class="fieldset-prose-mirror">
      <legend>{{ context.systemFields.description.label }}</legend>
      <Prosemirror :editable="context.editable" :field="context.editors['system.description']"/>
    </fieldset>
  </section>
</template>

<script setup>
import { Prosemirror } from '@/components';
const props = defineProps(['context']);
</script>


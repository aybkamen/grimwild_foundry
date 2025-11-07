<template>
  <section class="storykit-mix flexcol">
    <fieldset class="mix-fieldset">
      <legend>{{ game.i18n.localize('GRIMWILD.Actor.StoryKit.Tabs.MixItUp') }}</legend>
      <button class="mix-control mix-create" title="Add" data-action="createArrayEntry" data-field="system.mixItUp"><i class="fas fa-plus"></i></button>
      <div class="mix-list form-group stacked">
        <div class="mix form-group" v-for="(m, key) in context.system.mixItUp" :key="key">
          <input type="text" :name="`system.mixItUp.${key}`" v-model="context.system.mixItUp[key]" placeholder="Idea"/>
          <a class="mix-control mix-delete" title="Delete" data-action="deleteArrayEntry" data-field="system.mixItUp" :data-key="key"><i class="fas fa-trash"></i></a>
        </div>
      </div>
    </fieldset>
  </section>
</template>

<script setup>
const props = defineProps(['context']);
</script>

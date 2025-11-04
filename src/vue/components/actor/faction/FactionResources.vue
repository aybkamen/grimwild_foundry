<template>
  <section class="faction-resources flexcol">
    <fieldset class="resources-fieldset">
      <legend>Resources</legend>
      <button class="resource-control resource-create"
              title="Add resource"
              data-action="createArrayEntry"
              data-field="resources"><i class="fas fa-plus"></i></button>
      <div class="resources form-group stacked">
        <div class="resource form-group stacked" v-for="(resource, key) in context.system.resources" :key="key">
          <input type="text"
                 :name="`system.resources.${key}`"
                 v-model="context.system.resources[key]"
                 placeholder="Resource"/>
          <a class="resource-control resource-delete"
             title="Delete resource"
             data-action="deleteArrayEntry"
             data-field="resources"
             :data-key="key"><i class="fas fa-trash"></i></a>
        </div>
      </div>
    </fieldset>
  </section>
</template>

<script setup>
const props = defineProps(['context']);
</script>


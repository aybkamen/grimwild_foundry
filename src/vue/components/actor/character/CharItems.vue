<template>
  <div class="grid grid-2col">
    <!-- Backpack (left column) -->
    <fieldset class="backpack-fieldset grid-span-1 grid-start-1">
      <legend>{{ context.systemFields.backpack?.label ?? 'Backpack' }}</legend>
      <div class="form-group stacked">
        <template v-for="i in 10" :key="i">
          <div class="tooltip-wrapper bp-slot">
            <input
              type="text"
              class="backpack-slot"
              :name="`system.backpack.${i-1}`"
              v-model="context.system.backpack[i-1]"
              :placeholder="`Backpack Slot ${i}`"
            />
            <span class="tooltip">{{ context.system.backpack[i-1] }}</span>
          </div>
        </template>
      </div>
    </fieldset>
  </div>
  
</template>

<script setup>
const props = defineProps(['actor', 'context']);
</script>

<style lang="scss">

</style>

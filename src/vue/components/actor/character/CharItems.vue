<template>
  <div class="grid grid-2col">
    <!-- Backpack -->
    <fieldset class="backpack-fieldset grid-span-2">
      <legend>{{ context.systemFields.backpack?.label ?? 'Backpack' }}</legend>
      <div class="form-group stacked">
        <template v-for="i in 10" :key="i">
          <input
            type="text"
            :name="`system.backpack.${i-1}`"
            v-model="context.system.backpack[i-1]"
            :placeholder="`Backpack Slot ${i}`"
          />
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

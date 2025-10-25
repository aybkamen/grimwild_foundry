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

    <!-- Treasure (right column) -->
    <fieldset class="treasure-fieldset grid-span-1 grid-start-2">
      <legend>{{ context.systemFields.treasure?.label ?? 'Treasure' }}</legend>
      <div class="treasure-rows">
        <!-- Few -->
        <div class="treasure-label">{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.treasure.FIELDS.few.label') || 'a few coins' }}</div>
        <div class="treasure-checks">
          <template v-for="(val, idx) in context.system.treasure.few" :key="`few-${idx}`">
            <input type="checkbox" :name="`system.treasure.few.${idx}`" v-model="context.system.treasure.few[idx]" />
          </template>
        </div>
        <!-- Pouch -->
        <div class="treasure-label">{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.treasure.FIELDS.pouch.label') || 'a pouch of coins' }}</div>
        <div class="treasure-checks">
          <template v-for="(val, idx) in context.system.treasure.pouch" :key="`pouch-${idx}`">
            <input type="checkbox" :name="`system.treasure.pouch.${idx}`" v-model="context.system.treasure.pouch[idx]" />
          </template>
        </div>
        <!-- Bag -->
        <div class="treasure-label">{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.treasure.FIELDS.bag.label') || 'a bag of coins' }}</div>
        <div class="treasure-checks">
          <template v-for="(val, idx) in context.system.treasure.bag" :key="`bag-${idx}`">
            <input type="checkbox" :name="`system.treasure.bag.${idx}`" v-model="context.system.treasure.bag[idx]" />
          </template>
        </div>
        <!-- Chest -->
        <div class="treasure-label">{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.treasure.FIELDS.chest.label') || 'a chest of coins' }}</div>
        <div class="treasure-checks">
          <template v-for="(val, idx) in context.system.treasure.chest" :key="`chest-${idx}`">
            <input type="checkbox" :name="`system.treasure.chest.${idx}`" v-model="context.system.treasure.chest[idx]" />
          </template>
        </div>
      </div>
    </fieldset>
  </div>
  
</template>

<script setup>
const props = defineProps(['actor', 'context']);
</script>

<style lang="scss">

</style>

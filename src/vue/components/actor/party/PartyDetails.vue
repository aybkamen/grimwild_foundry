<template>
  <section class="party-details">
    <div class="grid grid-2col">
      <!-- Left column: Concept -->
      <div class="col-left">
        <fieldset class="concepts-fieldset form-group stacked">
          <legend>{{ $t?.('GRIMWILD.Actor.Party.FIELDS.concepts.label') ?? 'Concept' }}</legend>
          <p class="hint">Choose 2 that you see your party as and 1 that you definitely aren't.</p>
          <div class="form-group stacked">
            <div :class="`concept form-group ${c.are ? 'are' : 'not'}`" v-for="(c, i) in context.system.concepts" :key="i">
              <input type="checkbox" :name="`system.concepts.${i}.are`" v-model="c.are" readonly/>
              <input type="text" :name="`system.concepts.${i}.value`" v-model="c.value" list="concepts-list"/>
            </div>
            <datalist id="concepts-list">
              <option v-for="(opt, key) in CONFIG.GRIMWILD.concepts" :key="key" :value="game.i18n.localize(opt)">{{ game.i18n.localize(opt) }}</option>
            </datalist>
          </div>
        </fieldset>
      </div>

      <!-- Right column: reserved for future details -->
      <div class="col-right"></div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps(['context']);
</script>

<style scoped>
.hint { opacity: 0.8; margin: 0 0 6px; }
.concept.are { }
.concept.not { }
</style>


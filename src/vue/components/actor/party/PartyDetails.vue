<template>
  <section class="party-details">
    <div class="grid grid-2col">
      <!-- Left column: Concept -->
      <div class="col-left">
        <fieldset class="concepts-fieldset form-group stacked">
          <legend>{{ $t?.('GRIMWILD.Actor.Party.FIELDS.concepts.label') ?? 'Concept' }}</legend>
          <p class="hint">Choose 2 that you see your party as and 1 that you definitely aren't.</p>
          <div class="form-group stacked">
            <div class="concept form-group" v-for="(c, i) in context.system.concepts" :key="i">
              <span class="concept-icon" :class="i < 2 ? 'are' : 'not'" aria-hidden="true">
                <i class="fas" :class="i < 2 ? 'fa-check' : 'fa-xmark fa-times'"></i>
              </span>
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
.concept { display: flex; align-items: center; gap: 8px; }
.concept-icon { flex: 0 0 20px; width: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 16px; }
.concept-icon.are { color: var(--color-level-success); }
.concept-icon.not { color: var(--color-level-error); }
</style>

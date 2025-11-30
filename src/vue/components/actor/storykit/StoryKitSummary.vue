<template>
  <section class="storykit-summary flexcol">
    <header class="summary-header">
      <h1 class="summary-title">{{ context.actor?.name || game.i18n.localize('GRIMWILD.Actor.StoryKit.Tabs.Description') }}</h1>
      <div class="summary-biography" v-html="context.editors['system.biography']?.enriched || ''"></div>
    </header>

    <div class="summary-grid">
      <section class="summary-card">
        <h3>{{ game.i18n.localize('GRIMWILD.Actor.StoryKit.FIELDS.hooks.label') }}</h3>
        <ul>
          <li v-for="(hook, idx) in hooks" :key="idx">{{ hook || '—' }}</li>
          <li v-if="!hooks.length" class="summary-empty">—</li>
        </ul>
      </section>

      <section class="summary-card">
        <h3>{{ game.i18n.localize('GRIMWILD.Actor.StoryKit.Tabs.MixItUp') }}</h3>
        <ul>
          <li v-for="(mix, idx) in mixes" :key="idx">{{ mix || '—' }}</li>
          <li v-if="!mixes.length" class="summary-empty">—</li>
        </ul>
      </section>

      <section class="summary-card summary-pieces">
        <h3>{{ game.i18n.localize('GRIMWILD.Actor.StoryKit.Tabs.Pieces') }}</h3>
        <div class="pieces-grid">
          <div class="piece-card" v-for="(piece, idx) in pieces" :key="idx">
            <div class="piece-title">{{ piece.title || game.i18n.localize('Title') }}</div>
            <div class="piece-description" v-html="context.editors[`system.pieces.${idx}.description`]?.enriched || piece.description || ''"></div>
          </div>
          <div v-if="!pieces.length" class="summary-empty">—</div>
        </div>
      </section>
    </div>

    <section class="summary-card summary-challenges">
      <h3>{{ game.i18n.localize('GRIMWILD.Actor.StoryKit.Tabs.Pressure') }}</h3>
      <div class="mini-cards">
        <div class="mini-card" v-for="item in pressure" :key="item.id">
          <div class="mini-title">{{ item.name }}</div>
          <div class="mini-body" v-html="context.editors[`items.${item.id}.system.description`]?.enriched || ''"></div>
        </div>
        <div v-if="!pressure.length" class="summary-empty">—</div>
      </div>
    </section>

    <section class="summary-card summary-setups">
      <h3>{{ game.i18n.localize('GRIMWILD.Actor.StoryKit.Tabs.Setups') }}</h3>
      <div class="mini-cards">
        <div class="mini-card" v-for="item in setups" :key="item.id">
          <div class="mini-title">{{ item.name }}</div>
          <div class="mini-body" v-html="context.editors[`items.${item.id}.system.description`]?.enriched || ''"></div>
        </div>
        <div v-if="!setups.length" class="summary-empty">—</div>
      </div>
    </section>

    <section class="summary-card summary-challenges">
      <h3>{{ game.i18n.localize('GRIMWILD.Actor.Tabs.Challenges') }}</h3>
      <div class="mini-cards">
        <div class="mini-card" v-for="item in challenges" :key="item.id">
          <div class="mini-title">{{ item.name }}</div>
          <div class="mini-body" v-html="context.editors[`items.${item.id}.system.description`]?.enriched || ''"></div>
        </div>
        <div v-if="!challenges.length" class="summary-empty">—</div>
      </div>
    </section>
  </section>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps(['context']);

const hooks = computed(() => Array.isArray(props.context.system?.hooks) ? props.context.system.hooks : []);
const mixes = computed(() => Array.isArray(props.context.system?.mixItUp) ? props.context.system.mixItUp : []);
const pieces = computed(() => Array.isArray(props.context.system?.pieces) ? props.context.system.pieces : []);
const pressure = computed(() => {
  const challenges = props.context.itemTypes?.challenge ?? [];
  return challenges.filter(c => (c.system?.group ?? '') === 'pressure');
});
const challenges = computed(() => {
  const challenges = props.context.itemTypes?.challenge ?? [];
  return challenges.filter(c => (c.system?.group ?? '') === 'challenge');
});
const setups = computed(() => props.context.itemTypes?.setup ?? []);
</script>

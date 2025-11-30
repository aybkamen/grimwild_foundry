<template>
  <section class="storykit-pieces flexcol">
    <fieldset class="items-fieldset">
      <legend>{{ game.i18n.localize('GRIMWILD.Actor.StoryKit.Tabs.Pieces') }}</legend>
      <div class="flexrow items-header">
        <div class="item-name">{{ game.i18n.localize('GRIMWILD.Actor.StoryKit.Tabs.Pieces') }}</div>
        <div class="item-controls" v-if="context.editable">
          <button class="item-control item-create" type="button" title="Add piece"
                  @click="addPiece" :disabled="!canEdit">
            <i class="fas fa-plus"></i><span>Add</span>
          </button>
        </div>
      </div>
      <div class="items-list grid-span-3">
        <div v-for="(piece, key) in context.system.pieces" :key="key" class="item flexcol piece-card">
          <div class="item-name">
            <div class="piece-title">{{ piece.title || game.i18n.localize('Title') }}</div>
            <div class="item-controls" v-if="context.editable">
              <a class="item-control" title="Edit piece" data-action="editPiece" :data-key="key"><i class="fas fa-pen-to-square"></i></a>
              <a class="item-control item-delete" title="Delete piece" @click.prevent="removePiece(key)"><i class="fas fa-trash"></i></a>
            </div>
          </div>
          <div class="item-description">
            <div class="prosemirror-preview" v-html="context.editors[`system.pieces.${key}.description`]?.enriched || ''"></div>
          </div>
        </div>
      </div>
    </fieldset>
  </section>
</template>

<script setup>
import { inject, computed } from 'vue';
const props = defineProps(['context']);
const actor = inject('rawDocument', null);
const canEdit = computed(() => !!props.context?.editable && !!actor);

const buildArrays = () => {
  const hooks = Array.isArray(props.context.system?.hooks) ? props.context.system.hooks.map((h) => h ?? "") : [];
  const mixes = Array.isArray(props.context.system?.mixItUp) ? props.context.system.mixItUp.map((m) => m ?? "") : [];
  const pieces = Array.isArray(props.context.system?.pieces) ? foundry.utils.duplicate(props.context.system.pieces) : [];
  return { hooks, mixes, pieces };
};

const addPiece = async () => {
  if (!canEdit.value) return;
  const { hooks, mixes, pieces } = buildArrays();
  pieces.push({ title: "", description: "" });
  // Keep local context in sync to avoid stale submits overwriting pieces
  props.context.system.pieces = pieces;
  await actor.update({
    "system.pieces": pieces,
    "system.hooks": hooks,
    "system.mixItUp": mixes
  }, { render: true });
};

const removePiece = async (index) => {
  if (!canEdit.value) return;
  const { hooks, mixes, pieces } = buildArrays();
  pieces.splice(index, 1);
  props.context.system.pieces = pieces;
  await actor.update({
    "system.pieces": pieces,
    "system.hooks": hooks,
    "system.mixItUp": mixes
  }, { render: true });
};
</script>

<template>
  <section class="storykit-pieces flexcol">
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
      <div v-for="(piece, key) in context.system.pieces" :key="key" class="item flexcol">
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
  </section>
</template>

<script setup>
import { inject, computed } from 'vue';
const props = defineProps(['context']);
const actor = inject('rawDocument', null);
const canEdit = computed(() => !!props.context?.editable && !!actor);

const addPiece = async () => {
  if (!canEdit.value) return;
  const current = Array.isArray(actor.system?.pieces) ? foundry.utils.duplicate(actor.system.pieces) : [];
  current.push({ title: "", description: "" });
  await actor.update({ "system.pieces": current }, { render: true });
};

const removePiece = async (index) => {
  if (!canEdit.value) return;
  const current = Array.isArray(actor.system?.pieces) ? foundry.utils.duplicate(actor.system.pieces) : [];
  current.splice(index, 1);
  await actor.update({ "system.pieces": current }, { render: true });
};
</script>

<template>
  <section class="storykit-pieces flexcol">
    <div class="flexrow items-header">
      <div class="item-name">{{ game.i18n.localize('GRIMWILD.Actor.StoryKit.Tabs.Pieces') }}</div>
      <div class="item-controls" v-if="context.editable">
        <button class="item-control item-create" title="Add piece"
                data-action="createArrayEntry" data-field="pieces">
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
            <a class="item-control item-delete" title="Delete piece" data-action="deleteArrayEntry" data-field="pieces" :data-key="key"><i class="fas fa-trash"></i></a>
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
const props = defineProps(['context']);
</script>

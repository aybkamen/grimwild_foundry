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
    <ol class="items-list grid-span-3">
      <li v-for="(piece, key) in context.system.pieces" :key="key" class="item flexcol">
        <div class="item-name">
          <input type="text" :name="`system.pieces.${key}.title`" v-model="piece.title" placeholder="Title"/>
          <a class="item-control item-delete" title="Delete piece" data-action="deleteArrayEntry" data-field="pieces" :data-key="key"><i class="fas fa-trash"></i></a>
        </div>
        <div class="item-description">
          <Prosemirror :editable="context.editable" :field="context.editors[`system.pieces.${key}.description`]"/>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup>
import { Prosemirror } from '@/components';
const props = defineProps(['context']);
</script>

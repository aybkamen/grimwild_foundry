<template>
  <section class="storykit-setups flexcol">
    <div class="flexrow items-header">
      <div class="item-name">{{ game.i18n.localize('GRIMWILD.Actor.StoryKit.Tabs.Setups') }}</div>
      <div class="item-controls" v-if="context.editable">
        <button class="item-control item-create"
                title="Create setup"
                data-action="createDoc"
                data-document-class="Item"
                data-type="setup"
                type="button">
          <i class="fas fa-plus"></i><span>Add</span>
        </button>
      </div>
    </div>
    <ol class="items-list grid-span-3">
      <li v-for="(item, id) in (context.itemTypes.setup || [])"
          :key="id"
          class="item flexcol"
          :data-item-id="item.id"
          data-document-class="Item">
        <div class="item-name">
          <span>{{ item.name }}</span>
          <div class="item-controls">
            <a class="item-control item-edit" data-action="viewDoc"><i class="fas fa-edit"></i></a>
            <a class="item-control item-delete" v-if="context.editable" data-action="deleteDoc"><i class="fas fa-trash"></i></a>
          </div>
        </div>
        <div class="item-description" v-if="item.system.description?.length">
          <div class="item-description-content" v-html="context.editors[`items.${item.id}.system.description`].enriched"></div>
        </div>
      </li>
    </ol>
  </section>
</template>

<script setup>
const props = defineProps(['context']);
</script>

<template>
  <section class="storykit-setups flexcol">
    <fieldset class="setups-fieldset">
      <legend>{{ game.i18n.localize('GRIMWILD.Actor.StoryKit.Tabs.Setups') }}</legend>
      <button v-if="context.editable"
              class="setup-control setup-create"
              title="Create setup"
              data-action="createDoc"
              data-document-class="Item"
              data-type="setup"
              type="button">
        <i class="fas fa-plus"></i>
      </button>

      <ol class="items-list grid-span-3">
        <li v-for="(item, id) in (context.itemTypes.setup || [])"
            :key="id"
            class="item flexcol"
            :data-item-id="item.id"
            data-document-class="Item">
          <div class="item-name">
            <span class="setup-title">{{ item.name }}</span>
            <div class="item-controls">
              <a class="item-control item-edit" data-action="viewDoc"><i class="fas fa-edit"></i></a>
              <a class="item-control item-delete" v-if="context.editable" data-action="deleteDoc"><i class="fas fa-trash"></i></a>
            </div>
          </div>
          <div class="item-description" v-if="item.system.description?.length">
            <div class="item-description-content" v-html="context.editors[`items.${item.id}.system.description`].enriched"></div>
          </div>
          <ul class="setup-elements" v-if="(item.system.elements?.length ?? 0) > 0">
            <li v-for="(el, key) in (item.system.elements || [])"
                :key="key"
                :class="(el?.state === 'yes' || el?.state === 'no') ? el.state : 'maybe'">
              <i :class="el?.state === 'yes' ? 'fas fa-square-check' : (el?.state === 'no' ? 'fas fa-square-xmark' : 'fas fa-square')" aria-hidden="true"></i>
              <span>{{ el.label }}</span>
            </li>
          </ul>
        </li>
      </ol>
    </fieldset>
  </section>
</template>

<script setup>
const props = defineProps(['context']);
</script>

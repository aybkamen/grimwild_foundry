<template>
  <section>
    <div class="items">
      <!-- Header row -->
      <div class="flexrow items-header stroke stroke-bottom">
        <div class="item-name">{{ context.systemFields.backgrounds.label }}</div>
        <div class="item-controls">
          <template v-if="context.editable">
            <button class="item-control item-create"
                    title="Create background"
                    data-action="createDoc"
                    data-document-class="Item"
                    data-type="background"
                    type="button">
              <i class="fas fa-plus"></i><span>Add</span>
            </button>
          </template>
        </div>
      </div>
      <!-- Background mini-cards -->
      <div v-for="(item, id) in (context.itemTypes.background || [])" :key="id"
           :class="`item background flexcol`"
           :data-item-id="item._id"
           data-drag="true"
           draggable="true"
           data-document-class="Item">
        <!-- Summary -->
        <div class="item-summary flexcol">
          <div class="item-name">
            <div data-action="toggleItem" :data-item-id="item._id">{{ item.name }}</div>
          </div>
          <ul class="wise-list">
            <li v-for="(wise, i) in (item.system?.wises ?? []).filter(w => !!w?.active && !!w?.label)" :key="i">
              {{ wise.label }}
            </li>
          </ul>
          <ul class="flaw-list">
            <li v-for="(flaw, i) in (item.system?.flaws ?? []).filter(f => !!f?.active && !!f?.label)" :key="`f-${i}`">
              <span class="flaw-icon">!</span>{{ flaw.label }}
            </li>
          </ul>
        </div>
        <div class="item-controls" data-controls="background">
          <a class="item-control item-edit"
             :title="game.i18n.format('DOCUMENT.Edit', {type: 'background'})"
             data-action="viewDoc"
          ><i class="fas fa-edit"></i></a>
          <a class="item-control item-delete"
             v-if="context.editable"
             :title="game.i18n.format('DOCUMENT.Delete', {type: 'background'})"
             data-action="deleteBackground"
          ><i class="fas fa-trash"></i></a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const props = defineProps(['actor', 'context']);
</script>

<style scoped>
.item-summary {
  gap: 4px;
}

.item-name {
  font-variant: small-caps;
  letter-spacing: 0.5px;
}

.wise-list,
.flaw-list {
  margin: 0;
  padding-left: 18px;
  font-size: 0.8em;
}

.flaw-list {
  color: var(--gw-danger, #e74c3c);
}

.wise-list {
  color: var(--gw-accent2, #34db85);
}

.flaw-icon {
  font-weight: 700;
  margin-right: 6px;
}
</style>

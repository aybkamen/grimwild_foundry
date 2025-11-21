<template>
  <section class="party-story-arcs">
    <fieldset>
      <legend>{{ $t?.('GRIMWILD.Actor.Character.FIELDS.storyArcs.label') ?? 'Story Arcs' }}</legend>
      <div class="party-story-arcs-header">
        <p class="hint">Track this party's ongoing quests and progress. Drag quests here or click "Add quest".</p>
        <button
          v-if="context.editable"
          class="item-control item-create"
          type="button"
          title="Add quest"
          data-action="createDoc"
          data-document-class="Item"
          data-type="quest"
        >
          <i class="fas fa-plus"></i>
          <span>Add quest</span>
        </button>
      </div>

      <div v-if="quests.length === 0" class="empty-hint">
        No quests added yet. Click "Add quest" to create one for this party.
      </div>

      <ul v-else class="quests-list">
        <li
          v-for="q in quests"
          :key="q.id"
          class="quest-row"
          data-document-class="Item"
          :data-item-id="q.id"
        >
          <div class="quest-main">
            <div class="quest-name">
              <strong>{{ q.name }}</strong>
            </div>
            <div class="quest-fields">
              <div class="quest-field">
                <span class="label">Next milestone</span>
                <span class="value">{{ q.nextMilestone || '—' }}</span>
              </div>
              <div class="quest-field">
                <span class="label">Milestones completed</span>
                <span class="value">{{ q.completed }} / {{ q.total }}</span>
              </div>
            </div>
          </div>
          <div class="quest-controls">
            <a
              class="item-control item-edit"
              title="Open quest"
              data-action="viewDoc"
            >
              <i class="fas fa-edit"></i>
            </a>
            <a
              v-if="context.editable"
              class="item-control item-delete"
              title="Remove quest"
              data-action="deleteQuest"
            >
              <i class="fas fa-trash"></i>
            </a>
          </div>
        </li>
      </ul>
    </fieldset>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps(["context"]);
const context = props.context;

const quests = computed(() => {
  const items = context?.itemTypes?.quest ?? [];
  return items.map((item) => {
    const system = item.system ?? {};
    const milestones = Array.isArray(system.milestones) ? system.milestones : [];
    const activeIndex =
      typeof system.activeMilestone === "number" && system.activeMilestone >= 0
        ? system.activeMilestone
        : null;

    let nextMilestone = null;
    if (activeIndex !== null && milestones[activeIndex]) {
      nextMilestone = milestones[activeIndex]?.label || `Milestone ${activeIndex + 1}`;
    }
    else {
      const firstIncompleteIndex = milestones.findIndex((m) => m?.done === false);
      if (firstIncompleteIndex >= 0) {
        const m = milestones[firstIncompleteIndex];
        nextMilestone = m?.label || `Milestone ${firstIncompleteIndex + 1}`;
   	  }
    }

    const completed = milestones.filter((m) => m?.done).length;

    return {
      id: item.id,
      name: item.name,
      nextMilestone,
      completed,
      total: milestones.length
    };
  });
});
</script>

<style scoped>
.party-story-arcs fieldset {
  width: 100%;
}

.party-story-arcs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.hint {
  opacity: 0.8;
  margin: 0;
}

.quests-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quest-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--gw-faint, rgba(255, 255, 255, 0.15));
}

.quest-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quest-name {
  font-size: 1.1em;
}

.quest-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.9em;
}

.quest-field .label {
  opacity: 0.8;
  margin-right: 4px;
}

.quest-controls {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-control {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  border-radius: 4px;
  background: black;
  font-size: 12px;
  line-height: 1;
}

.empty-hint {
  opacity: 0.8;
  font-style: italic;
}
</style>

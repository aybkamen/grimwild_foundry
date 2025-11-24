<template>
  <section class="character-story-arcs">
    <fieldset class="story-arcs-frame">
      <button
        v-if="context.editable"
        class="item-control item-create add-quest"
        type="button"
        title="Add quest"
        data-action="createDoc"
        data-document-class="Item"
        data-type="quest"
      >
        <i class="fas fa-plus"></i>
      </button>

      <div v-if="quests.length === 0" class="empty-hint">
        No quests added yet. Drag a quest here or click "Add quest".
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
                <span class="label">Next</span>
                <span class="value">{{ q.nextMilestone || "-" }}</span>
              </div>
              <div class="quest-field">
                <span class="label">Completed</span>
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
          <div class="quest-tooltip">
            <div class="quest-tooltip-header">
              <div class="quest-tooltip-title">{{ q.name }}</div>
              <div class="quest-tooltip-progress">
                <span class="label">Completed</span>
                <span class="value">{{ q.completed }} / {{ q.total }}</span>
              </div>
            </div>
            <div
              v-if="q.description"
              class="quest-tooltip-description"
              v-html="q.description"
            ></div>
            <div v-else class="quest-tooltip-description muted">
              No description provided.
            </div>
            <ul v-if="q.milestones.length" class="quest-tooltip-milestones">
              <li
                v-for="(m, i) in q.milestones"
                :key="i"
                :class="['milestone', { done: m.done, active: m.active }]"
              >
                <span class="milestone-marker" aria-hidden="true">
                  <i v-if="m.done" class="fas fa-check"></i>
                  <i v-else-if="m.active" class="fas fa-flag"></i>
                  <i v-else class="far fa-circle"></i>
                </span>
                <span class="milestone-label">
                  <strong class="milestone-index">M{{ i + 1 }}</strong>
                  {{ m.label }}
                </span>
              </li>
            </ul>
            <div v-else class="quest-tooltip-empty">
              No milestones added yet.
            </div>
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
    const descriptionKey = `items.${item.id}.system.description`;
    const rawDescription = system.description || "";
    const description =
      context?.editors?.[descriptionKey]?.enriched ||
      (foundry?.utils?.escapeHTML
        ? foundry.utils.escapeHTML(rawDescription)
        : rawDescription);
    const milestoneDetails = milestones.map((m, idx) => ({
      label: m?.label?.length ? m.label : `Milestone ${idx + 1}`,
      done: !!m?.done,
      active: idx === activeIndex
    }));

    return {
      id: item.id,
      name: item.name,
      nextMilestone,
      completed,
      total: milestones.length,
      description,
      milestones: milestoneDetails
    };
  });
});
</script>

<style scoped>
.story-arcs-frame {
  width: 100%;
  position: relative;
  padding-top: 10px;
}

.add-quest {
  position: absolute;
  top: -10px;
  right: 8px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
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
  position: relative;
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
  color: #aaaaaa;
  font-style: italic;
  margin-right: 4px;
}

.quest-field .value {
  font-weight: 700;
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

.quest-tooltip {
  position: absolute;
  left: 0;
  top: calc(100% + 6px);
  width: min(440px, 90vw);
  padding: 10px 12px;
  background: rgba(7, 6, 10, 0.94);
  border: 1px solid var(--gw-faint, rgba(255, 255, 255, 0.25));
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  border-radius: 8px;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-6px);
  transition: opacity 160ms ease, transform 160ms ease;
  z-index: 20;
  color: inherit;
  max-height: 420px;
  overflow-y: auto;
}

body.theme-light .quest-tooltip {
  background: #ffffff;
  color: #1c1c1c;
}

.quest-row:hover .quest-tooltip,
.quest-row:focus-within .quest-tooltip {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.quest-tooltip-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
  margin-bottom: 6px;
}

.quest-tooltip-title {
  font-family: var(--font-display, inherit);
  font-size: 1.05em;
  font-weight: 700;
}

.quest-tooltip-progress .label {
  font-style: italic;
  opacity: 0.7;
  margin-right: 4px;
}

.quest-tooltip-description {
  line-height: 1.3;
}

.quest-tooltip-description.muted,
.quest-tooltip-empty {
  opacity: 0.75;
  font-style: italic;
}

.quest-tooltip-milestones {
  list-style: none;
  padding: 0;
  margin: 10px 0 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.quest-tooltip-milestones .milestone {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.quest-tooltip-empty {
  margin-top: 10px;
}

.milestone-marker {
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid var(--gw-faint, rgba(255, 255, 255, 0.3));
  background: rgba(255, 255, 255, 0.04);
}

.milestone.done .milestone-marker {
  background: var(--gw-success, #1b8a3b);
  color: #fff;
}

.milestone.active .milestone-marker {
  background: var(--gw-accent, #e38e3a);
  color: #fff;
  border-color: transparent;
}

.milestone-label {
  flex: 1 1 auto;
}

.milestone-index {
  margin-right: 6px;
}

.milestone.done .milestone-label {
  opacity: 0.8;
  text-decoration: line-through;
}
</style>

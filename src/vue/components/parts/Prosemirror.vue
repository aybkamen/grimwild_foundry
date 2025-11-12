<template>
  <div class="prose-mirror-wrapper" ref="wrapper"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps(['field', 'editable']);
const wrapper = ref(null);
let previewDiv = null;
let observer = null;

function isEditorOpen(el) {
  if (!el) return false;
  // One‑time override from creator (sheet can set dataset.startOpen)
  if (el.dataset && typeof el.dataset.startOpen !== 'undefined') {
    const wantOpen = el.dataset.startOpen === 'true';
    // consume the hint so subsequent checks follow the element state
    delete el.dataset.startOpen;
    return wantOpen;
  }
  // Foundry often toggles 'inactive' class when collapsed
  if (el.classList?.contains('inactive')) return false;
  if (el.hasAttribute?.('open')) return true;
  // fallback: if it has 'active' treat as open
  if (el.classList?.contains('active')) return true;
  // Default to closed if unsure to prevent editors staying open
  return false;
}

function updateVisibility() {
  if (!wrapper.value || !props.field) return;
  const el = props.field.element;
  if (!el) return;
  const open = isEditorOpen(el);
  if (previewDiv) previewDiv.style.display = open ? 'none' : '';
  el.style.display = open ? '' : 'none';
}

function attachObserver() {
  const el = props.field.element;
  if (!el) return;
  if (observer) { observer.disconnect(); observer = null; }
  observer = new MutationObserver(updateVisibility);
  observer.observe(el, { attributes: true, attributeFilter: ['open', 'class'] });
}

function openEditor() {
  const el = props.field?.element;
  if (!el) return;
  el.setAttribute?.('open', '');
  el.classList?.remove('inactive');
  el.classList?.add('active');
  updateVisibility();
  try { el.focus?.(); } catch (_) {}
}

function renderContent() {
  if (!wrapper.value || !props.field) return;
  // Clear previous content
  wrapper.value.innerHTML = '';
  previewDiv = document.createElement('div');
  previewDiv.className = 'prosemirror-preview';
  previewDiv.innerHTML = props.field.enriched ?? '';
  // Allow clicking preview or empty area to edit
  previewDiv.addEventListener('click', openEditor);
  // Also make the wrapper clickable (covers empty previews)
  wrapper.value.addEventListener('click', (ev) => {
    // If the editor is visible, ignore
    const el = props.field?.element;
    if (!el) return;
    const open = isEditorOpen(el) && el.style.display !== 'none';
    if (!open) openEditor();
  });
  wrapper.value.appendChild(previewDiv);

  if (props.editable && props.field.element) {
    // Insert the live ProseMirror custom element so it keeps state
    wrapper.value.appendChild(props.field.element);
    attachObserver();
    // Update immediately and also on the next tick once the element upgrades
    updateVisibility();
    nextTick(updateVisibility);
  } else {
    // Render enriched HTML when not editable
    previewDiv.innerHTML = props.field.enriched ?? '';
  }
}

onMounted(renderContent);
watch(() => [props.field, props.editable], renderContent);
watch(() => props.field?.enriched, (v) => { if (previewDiv) previewDiv.innerHTML = v ?? ''; });
onBeforeUnmount(() => { if (observer) observer.disconnect(); if (wrapper.value) wrapper.value.innerHTML = ''; });
</script>

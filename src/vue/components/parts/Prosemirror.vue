<template>
  <div class="prose-mirror-wrapper" ref="wrapper"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';

const props = defineProps(['field', 'editable']);
const wrapper = ref(null);
let previewDiv = null;
let editButton = null;
let observer = null;
let detachEditorListeners = null;
let inserted = false; // whether the editor element is in the DOM
let enrichTimeout = null;

function isEditorOpen(el) {
  if (!el) return false;
  // One-time override from creator (sheet can set dataset.startOpen)
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
  if (editButton) editButton.style.display = open ? 'none' : '';
  // Only attach the editor element when open; remove it when closed
  if (open) {
    if (!inserted) {
      try { wrapper.value.appendChild(el); inserted = true; } catch (_) {}
    }
    el.style.display = '';
  } else {
    if (inserted) {
      try { wrapper.value.removeChild(el); inserted = false; } catch (_) {}
    }
  }
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
  // Ensure the element is attached before toggling open states
  if (!inserted && wrapper.value) {
    try { wrapper.value.appendChild(el); inserted = true; } catch (_) {}
  }
  el.setAttribute?.('open', '');
  el.classList?.remove('inactive');
  el.classList?.add('active');
  updateVisibility();
  try { el.focus?.(); } catch (_) {}
}

function renderContent() {
  if (!wrapper.value || !props.field) return;
  // Clear previous content and references
  wrapper.value.innerHTML = '';
  if (detachEditorListeners) { detachEditorListeners(); detachEditorListeners = null; }
  previewDiv = document.createElement('div');
  previewDiv.className = 'prosemirror-preview';
  previewDiv.innerHTML = props.field.enriched ?? '';
  wrapper.value.appendChild(previewDiv);

  // Only show edit affordances when the field is editable
  if (props.editable && props.field.element) {
    editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.className = 'prosemirror-edit-button';
    editButton.setAttribute('aria-label', 'Edit text');
    editButton.innerHTML = '<i class="fas fa-pen-to-square"></i>';
    editButton.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      openEditor();
    });
    wrapper.value.appendChild(editButton);

    // Do not insert the editor element until opened by the user
    inserted = false;
    attachObserver();
    // Force the editor to start closed even if the element requests open.
    try {
      const el = props.field.element;
      el.dataset.startOpen = 'false';
    } catch (_) {}
    // Force it to start closed regardless of its internal default
    try {
      const el = props.field.element;
      el.removeAttribute?.('open');
      el.classList?.remove('active');
      el.classList?.add('inactive');
    } catch (_) {}
    // Ensure preview shows and editor is not attached
    updateVisibility();
    nextTick(updateVisibility);
    attachEditorListeners();
  } else {
    // Render enriched HTML when not editable
    previewDiv.innerHTML = props.field.enriched ?? '';
  }
}

onMounted(renderContent);
watch(() => [props.field, props.editable], renderContent);
watch(() => props.field?.enriched, (v) => { if (previewDiv) previewDiv.innerHTML = v ?? ''; });
onBeforeUnmount(() => { if (observer) observer.disconnect(); if (wrapper.value) wrapper.value.innerHTML = ''; inserted = false; });

function attachEditorListeners() {
  const el = props.field?.element;
  if (!el) return;
  if (detachEditorListeners) { detachEditorListeners(); detachEditorListeners = null; }
  const updatePreview = () => {
    if (enrichTimeout) { clearTimeout(enrichTimeout); enrichTimeout = null; }
    // Debounce enrichment to avoid hammering while typing
    enrichTimeout = setTimeout(async () => {
      const raw = el.value ?? el.innerHTML ?? '';
      try {
        const enriched = await foundry.applications.ux.TextEditor.implementation.enrichHTML(raw, { async: true });
        if (previewDiv) previewDiv.innerHTML = enriched ?? raw;
      } catch (_) {
        if (previewDiv) previewDiv.innerHTML = raw;
      }
    }, 120);
  };
  el.addEventListener('input', updatePreview);
  el.addEventListener('change', updatePreview);
  detachEditorListeners = () => {
    el.removeEventListener('input', updatePreview);
    el.removeEventListener('change', updatePreview);
  };
}
</script>

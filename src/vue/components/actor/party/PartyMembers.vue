<template>
  <section class="party-members flexcol">
    <fieldset>
      <legend>{{ $t?.('GRIMWILD.Actor.Tabs.GroupMembers') ?? 'Group Members' }}</legend>
      <p class="hint">Drag a character or token onto this sheet to add them.</p>
      <ul class="members-list">
        <li
          class="member"
          v-for="(m, key) in members"
          :key="m.uuid"
          :title="`${m.name}; ${m.path}${m.backgrounds.length ? ` (${m.backgrounds.join(', ')})` : ''}${m.flaws.length ? ` | Flaws: ${m.flaws.join(', ')}` : ''}`"
        >
          <a class="member-open" title="Open" data-action="openMember" :data-uuid="m.uuid">
            <img class="member-img" :src="m.img" width="64" height="64"/>
          </a>
          <div class="member-text">
            <div class="member-row member-name-row">
              <strong class="member-title">{{ m.name }}</strong>
              <div class="member-meta">
                <span class="member-path">{{ m.path }}</span>
              </div>
            </div>
            <div class="member-subline member-backgrounds" :class="{ empty: !m.backgrounds.length }">
              {{ m.backgrounds.length ? m.backgrounds.join(', ') : '-' }}
            </div>
            <div class="member-subline member-flaws" :class="{ empty: !m.flaws.length }">
              {{ m.flaws.length ? m.flaws.join(', ') : '-' }}
            </div>
          </div>
          <a class="member-remove" title="Remove" data-action="removeMember" :data-key="key">
            <i class="fas fa-trash"></i>
          </a>
        </li>
      </ul>
    </fieldset>
  </section>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps(['context']);

const members = computed(() => {
  const uuids = props.context.system.members ?? [];
  return uuids.map((u) => {
    /** @type {any} */
    const doc = (globalThis.fromUuidSync ? fromUuidSync(u) : null);
    const actor = doc?.documentName === 'Actor' ? doc : (doc?.actor ?? null);
    const path = actor?.system?.path ?? '';
    const systemBackgrounds = Array.isArray(actor?.system?.backgrounds)
      ? actor.system.backgrounds.map((b) => (b?.name ?? '').trim()).filter(Boolean)
      : [];
    const itemBackgrounds = Array.isArray(actor?.itemTypes?.background)
      ? actor.itemTypes.background.map((b) => (b?.name ?? '').trim()).filter(Boolean)
      : [];
    const backgrounds = systemBackgrounds.length ? systemBackgrounds : itemBackgrounds;

    const backgroundFlaws = Array.isArray(actor?.itemTypes?.background)
      ? actor.itemTypes.background.flatMap((bg) => {
        const flaws = Array.isArray(bg?.system?.flaws) ? bg.system.flaws : [];
        return flaws
          .filter((f) => !!f?.active && !!f?.label)
          .map((f) => f.label);
      })
      : [];
    const freeformFlaws = Array.isArray(actor?.system?.flaws)
      ? actor.system.flaws.map((f) => (f ?? '').trim()).filter(Boolean)
      : [];
    const flaws = backgroundFlaws.length ? backgroundFlaws : freeformFlaws;

    return {
      uuid: u,
      name: actor?.name ?? u,
      path,
      backgrounds,
      flaws,
      img: actor?.img ?? 'icons/svg/mystery-man.svg'
    };
  });
});
</script>

<style scoped>
.members-list { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 8px; width: 100%; }
.member { display: grid; grid-template-columns: 64px 1fr 24px; gap: 8px; align-items: flex-start; min-height: 70px; width: 100%; padding: 4px 8px; border-radius: 6px; background: rgba(255,255,255,0.06); border: 1px solid var(--gw-faint, rgba(255,255,255,0.15)); box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05); }
.member-open { display: block; height: 64px; width: 64px; }
.member-img { border-radius: 4px; width: 64px; height: 64px; object-fit: cover; cursor: pointer; }
.member-text { min-width: 0; overflow: hidden; display: flex; flex-direction: column; gap: 6px; }
.member-row { display: flex; align-items: center; gap: 16px; min-width: 0; flex-wrap: wrap; }
.member-title { font-weight: 700; font-size: 1.6em; line-height: 1; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
.member-meta { opacity: 0.9; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
.member-path { white-space: nowrap; }
.member-subline { font-size: 0.75em; line-height: 1.2; min-width: 0; word-break: break-word; }
.member-backgrounds { color: inherit; }
.member-flaws { color: var(--gw-danger, #e74c3c); }
.member-subline.empty { opacity: 0.75; font-style: italic; color: inherit; }
.member-remove { display: inline-flex; width: 24px; height: 24px; align-items: center; justify-content: center; border: 1px solid; border-radius: 4px; background: black; font-size: 12px; line-height: 1; }
.hint { opacity: 0.8; margin: 0 0 6px; }
</style>

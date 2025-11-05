<template>
  <section class="party-members flexcol">
    <fieldset>
      <legend>{{ $t?.('GRIMWILD.Actor.Tabs.GroupMembers') ?? 'Group Members' }}</legend>
      <p class="hint">Drag a character or token onto this sheet to add them.</p>
      <ul class="members-list" style="list-style:none; padding:0; margin:8px 0 0; display:flex; flex-direction:column; gap:8px; width:100%;">
        <li class="member" v-for="(m, key) in members" :key="m.uuid" :title="`${m.name}; ${m.path}${m.bgList ? ` (${m.bgList})` : ''}`" :style="{ display:'grid', gridTemplateColumns:'64px 1fr 24px', gap:'8px', alignItems:'center', height:'70px', width:'100%', padding:'4px 8px', borderRadius:'6px', background:'rgba(255,255,255,0.06)', border:'1px solid var(--gw-faint, rgba(255,255,255,0.15))', boxShadow:'inset 0 0 0 1px rgba(255,255,255,0.05)' }">
          <img class="member-img" :src="m.img" width="64" height="64" style="border-radius:4px; object-fit:cover;"/>
          <div class="member-text">
            <div class="member-row">
              <strong class="member-title" style="font-weight:700; font-size:1.6em; line-height:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">{{ m.name }}</strong>
              <div class="member-meta" style="opacity:.9; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                <span class="member-path">{{ m.path }}</span>
                <span v-if="m.bgList" class="member-bgs"> ({{ m.bgList }})</span>
              </div>
            </div>
          </div>
          <a class="member-remove" title="Remove" data-action="removeMember" :data-key="key" style="display:inline-flex; width:24px; height:24px; align-items:center; justify-content:center; border:1px solid; border-radius:4px; background:black; font-size:12px; line-height:1;">
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
    const bgTitles = Array.isArray(actor?.system?.backgrounds)
      ? actor.system.backgrounds.map(b => (b?.name ?? '')).filter(Boolean)
      : [];
    return {
      uuid: u,
      name: actor?.name ?? u,
      path,
      bgList: bgTitles.join(', '),
      img: actor?.img ?? 'icons/svg/mystery-man.svg'
    };
  });
});
</script>

<style scoped>
.members-list { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 8px; width: 100%; }
.member { display: grid; grid-template-columns: 64px 1fr 24px; gap: 8px; align-items: center; height: 70px; width: 100%; padding: 4px 8px; border-radius: 6px; }
.member-img { border-radius: 4px; width: 64px; height: 64px; object-fit: cover; }
.member-text { min-width: 0; overflow: hidden; }
.member-row { display: flex; align-items: center; gap: 16px; min-width: 0; }
.member-title { font-weight: 700; font-size: 1.6em; line-height: 1; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
.member-meta { opacity: 0.9; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; }
.member-remove { display: inline-flex; width: 24px; height: 24px; align-items: center; justify-content: center; border: 1px solid; border-radius: 4px; background: black; font-size: 12px; line-height: 1; }
.hint { opacity: 0.8; margin: 0 0 6px; }
</style>

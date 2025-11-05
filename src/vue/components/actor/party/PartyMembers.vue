<template>
  <section class="party-members flexcol">
    <fieldset>
      <legend>{{ $t?.('GRIMWILD.Actor.Tabs.GroupMembers') ?? 'Group Members' }}</legend>
      <p class="hint">Drag a character or token onto this sheet to add them.</p>
      <ul class="members-list">
        <li class="member" v-for="(m, key) in members" :key="m.uuid">
          <img class="member-img" :src="m.img" width="24" height="24"/>
          <span class="member-name">{{ m.name }}</span>
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
    return {
      uuid: u,
      name: actor?.name ?? u,
      img: actor?.img ?? 'icons/svg/mystery-man.svg'
    };
  });
});
</script>

<style scoped>
.members-list { list-style: none; padding: 0; margin: 8px 0 0; display: flex; flex-direction: column; gap: 6px; }
.member { display: grid; grid-template-columns: 24px 1fr max-content; gap: 8px; align-items: center; }
.member-img { border-radius: 3px; }
.member-remove { display: inline-flex; width: 22px; height: 22px; align-items: center; justify-content: center; border: 1px solid; border-radius: 4px; background: black; }
.hint { opacity: 0.8; margin: 0 0 6px; }
</style>


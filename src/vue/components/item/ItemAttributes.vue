<template>
	<TalentTrackers v-if="context.item.type === 'talent'" :context="context"/>
	<ChallengeTraitsMoves v-if="context.item.type === 'challenge'" :context="context" />
	<SetupElements v-if="context.item.type === 'setup'" :context="context" />
    <BackgroundFields v-if="context.item.type === 'background'" :context="context" />
</template>

<script setup>
import { inject } from 'vue';
import {
	TalentTrackers,
	ChallengeTraitsMoves,
	SetupElements,
    BackgroundFields
} from '@/components';
const props = defineProps(['context']);
const actor = inject('rawDocument');
</script>

<template>
	<ArcanaDetails v-if="context.item.type === 'arcana'" :context="context" />
	<TalentTrackers v-if="['talent', 'arcana'].includes(context.item.type)" :context="context"/>
	<ChallengeTraitsMoves v-if="context.item.type === 'challenge'" :context="context" />
	<SetupElements v-if="context.item.type === 'setup'" :context="context" />
    <BackgroundFields v-if="context.item.type === 'background'" :context="context" />
	<QuestFields v-if="context.item.type === 'quest'" :context="context" />
</template>

<script setup>
import { inject } from 'vue';
import {
	TalentTrackers,
	ArcanaDetails,
	ChallengeTraitsMoves,
	SetupElements,
    BackgroundFields,
	QuestFields
} from '@/components';
const props = defineProps(['context']);
const actor = inject('rawDocument');
</script>

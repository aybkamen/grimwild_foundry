<template>
	<div :class="`grimwild-vue standard-form flexcol`">
		<div class="grimwild-sheet-layout grid grid-4col">
			<CharSidebar :context="context" />
	
			<!-- Header -->
			 <section class="grimwild-main flexcol grid-span-3">
				<CharHeader :context="context" />
				
				<div class="section--main flexcol">
					<!-- Tab links -->
					<Tabs :tabs="tabs.primary" no-span="true"/>

					<section class="section--fields flexcol">
						<!-- Biography / Story Arcs / Advancements -->
						<Tab group="primary" :tab="tabs.primary.biography">
							<section class="bio-layout">
								<!-- Row 1: Story Arcs / Quests -->
								<section class="bio-section bio-story-arcs">
									<h3 class="bio-section-title">
										{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.storyArcs.label') }}
									</h3>
									<div class="bio-section-body">
										<div class="story-arcs-wrapper">
											<button
												class="story-arc-control story-arc-create"
												type="button"
												title="Add story arc"
												data-action="createArrayEntry"
												data-field="storyArcs"
											>
												<i class="fas fa-plus"></i><span>Add</span>
											</button>
											<div class="story-arcs">
												<div
													class="story-arc-card"
													v-for="(arc, arcIndex) in (context.system.storyArcs || [])"
													:key="arcIndex"
												>
													<div class="story-arc-grid">
														<div class="story-arc-row story-arc-title-row">
															<input
																type="text"
																:name="`system.storyArcs.${arcIndex}.title`"
																v-model="arc.title"
																placeholder="Title"
															/>
														</div>
														<div
															class="story-arc-row story-arc-milestone-row"
															v-for="mIndex in [0,1,2]"
															:key="mIndex"
														>
															<input
																type="text"
																class="story-arc-milestone-label"
																:name="`system.storyArcs.${arcIndex}.milestones.${mIndex}.label`"
																v-model="arc.milestones[mIndex].label"
																:placeholder="`Milestone ${mIndex + 1}`"
															/>
															<label class="story-arc-milestone-check">
																<input
																	type="checkbox"
																	:name="`system.storyArcs.${arcIndex}.milestones.${mIndex}.done`"
																	v-model="arc.milestones[mIndex].done"
																/>
																<span>done</span>
															</label>
														</div>
													</div>
													<a
														class="story-arc-control story-arc-delete"
														title="Delete story arc"
														data-action="deleteArrayEntry"
														data-field="storyArcs"
														:data-key="arcIndex"
													>
														<i class="fas fa-trash"></i>
													</a>
												</div>
											</div>
										</div>
									</div>
								</section>

								<!-- Row 2: Biography + Advancements -->
								<section class="bio-row-bottom">
									<section class="bio-section bio-biography">
										<h3 class="bio-section-title">
											{{ context.systemFields.biography.label }}
										</h3>
										<div class="bio-section-body fieldset-prose-mirror">
											<Prosemirror :editable="context.editable" :field="context.editors['system.biography']"/>
										</div>
									</section>

									<section class="bio-section bio-advancements">
										<h3 class="bio-section-title">
											{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.advancements.label') }}
										</h3>
										<div class="bio-section-body">
											<div class="advancements-wrapper">
												<button
													class="advancement-control advancement-create"
													type="button"
													title="Add advancement"
													data-action="createArrayEntry"
													data-field="advancements"
												>
													<i class="fas fa-plus"></i><span>Add</span>
												</button>
												<div class="advancements form-group stacked">
													<div
														class="advancement form-group"
														v-for="(advancement, key) in (context.system.advancements || [])"
														:key="key"
													>
														<select
															:name="`system.advancements.${key}`"
															v-model="context.system.advancements[key]"
														>
															<option :value="'newBackground'">
																{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.advancements.choices.newBackground') }}
															</option>
															<option :value="'wises2'">
																{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.advancements.choices.wises2') }}
															</option>
															<option :value="'extraSpark'">
																{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.advancements.choices.extraSpark') }}
															</option>
															<option :value="'extraStory'">
																{{ game.i18n.localize('GRIMWILD.Actor.Character.FIELDS.advancements.choices.extraStory') }}
															</option>
														</select>
														<a
															class="advancement-control advancement-delete"
															title="Delete advancement"
															data-action="deleteArrayEntry"
															data-field="advancements"
															:data-key="key"
														>
															<i class="fas fa-trash"></i>
														</a>
													</div>
												</div>
											</div>
										</div>
									</section>
								</section>
							</section>
						</Tab>

						<!-- Notes fields -->
						<Tab group="primary" :tab="tabs.primary.notes">
							<fieldset class="fieldset-prose-mirror">
								<legend>{{ context.systemFields.notes.label }}</legend>
								<Prosemirror :editable="context.editable" :field="context.editors['system.notes']"/>
							</fieldset>
						</Tab>

						<!-- Details fields -->
						<Tab group="primary" :tab="tabs.primary.details">
							<CharDetails :actor="context.actor" :context="context"/>
						</Tab>
				
						<!-- Attack fields -->
						<Tab v-if="context.actor.type === 'character'" group="primary" :tab="tabs.primary.talents">
							<CharTalents :actor="context.actor" :context="context"/>
						</Tab>


						<!-- Items fields -->
						<Tab v-if="context.actor.type === 'character'" group="primary" :tab="tabs.primary.items">
							<CharItems :actor="context.actor" :context="context" />
						</Tab>
		
						<!-- @todo Active effects disabled for now. -->
						<!-- Active Effect Fields -->
						<!-- <Tab group="primary" :tab="tabs.primary.effects">
							<CharEffects :actor="context.actor" :context="context" :key="context._renderKey"/>
						</Tab> -->
					</section>
				</div>
			 </section>
		</div>

	</div>
</template>

<script setup>
import {
	Tabs,
	Tab,
	CharSidebar,
	CharHeader,
	CharDetails,
	CharTalents,
	CharEffects,
	CharItems,
	Prosemirror
} from '@/components';
import { reactive, toRaw } from 'vue';

const props = defineProps(['context']);
// Convert the tabs into a new reactive variable so that they
// don't change every time the item is updated.
const rawTabs = toRaw(props.context.tabs);
const tabs = reactive({...rawTabs});
// Retrieve a copy of the full item document instance provided by
// the VueApplicationMixin.
// const actor = inject('rawDocument');
</script>

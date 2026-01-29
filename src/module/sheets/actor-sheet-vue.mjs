import VueRenderingMixin from "./_vue/_vue-application-mixin.mjs";
import { GrimwildBaseVueActorSheet } from "./_vue/_base-vue-actor-sheet.mjs";
import { DocumentSheetVue } from "../../vue/components.vue.es.mjs";

const { DOCUMENT_OWNERSHIP_LEVELS } = CONST;

export class GrimwildActorSheetVue extends VueRenderingMixin(GrimwildBaseVueActorSheet) {
	vueParts = {
		"document-sheet": {
			component: DocumentSheetVue,
			template: "<document-sheet :context=\"context\">Vue rendering for sheet failed.</document-sheet>"
		}
	};

	enrichmentOptions = {
		documentFields: [
			"biography",
			"notes"
		],
		itemFields: {
			talent: [
				"description",
				"notes.description"
			],
			arcana: [
				"description",
				"notes.description",
				"limitations"
			]
		}
	};

	_arrayEntryKey = 0;

	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["grimwild", "actor", "character"],
		document: null,
		viewPermission: DOCUMENT_OWNERSHIP_LEVELS.LIMITED,
		editPermission: DOCUMENT_OWNERSHIP_LEVELS.OWNER,
		position: {
			width: 820,
			height: 750
		},
		window: {
			resizable: true
		},
		tag: "form",
		actions: {
			onEditImage: this._onEditImage,
			viewDoc: this._viewDoc,
			createDoc: this._createDoc,
			deleteDoc: this._deleteDoc,
			deleteBackground: this._deleteBackground,
			editEffect: this._viewEffect,
			createEffect: this._createEffect,
			deleteEffect: this._deleteEffect,
			toggleEffect: this._toggleEffect,
			deleteQuest: this._deleteQuest,
			openPack: this._openPack,
			createArrayEntry: this._createArrayEntry,
			deleteArrayEntry: this._deleteArrayEntry,
			changeXp: this._changeXp,
			updateTalentTracker: this._updateTalentTracker,
			updateItemTracker: this._updateItemTracker,
			rollPool: this._rollPool,
			roll: this._onRoll
		},
		changeActions: {
			updateTalentTracker: this._updateTalentTracker,
			updateItemTracker: this._updateItemTracker
		},
		// Custom property that's merged into `this.options`
		dragDrop: [{ dragSelector: "[data-drag]", dropSelector: null }],
		form: {
			submitOnChange: true,
			submitOnClose: true
		}
	};

	/**
	 * Actions performed after any render of the Application.
	 * Post-render steps are not awaited by the render process.
	 * @param {ApplicationRenderContext} context      Prepared context data
	 * @param {RenderOptions} options                 Provided render options
	 * @protected
	 */
	_onRender(context, options) {
		super._onRender(context, options);
		// @todo figure out how to attach this to the application frame rather than
		// using render key to prevent redundant events.
	}

    // (debug submit override removed; rely on DataModel guard in _preUpdate)

	/**
	 * Attach listeners to the application frame.
	 */
	_attachFrameListeners() {
		super._attachFrameListeners();
		// Attach event listeners in here to prevent duplicate calls.
		const change = this.#onChange.bind(this);
		this.element.addEventListener("change", change);

		// Prevent Enter from submitting the form (which can wipe items due to empty payloads).
		this._enterHandler = (event) => {
			if (event.key !== "Enter") return;
			const target = event.target;
			// Allow Enter in textareas and contenteditable elements (e.g., ProseMirror).
			if (target?.tagName === "TEXTAREA" || target?.isContentEditable) return;
			// Allow explicit submit/buttons.
			const type = target?.type?.toLowerCase?.();
			if (type === "submit" || type === "button") return;
			event.preventDefault();
			event.stopPropagation();
		};
		this.element.addEventListener("keydown", this._enterHandler, true);
	}

	/**
	 * Handle dropping quest items onto the character sheet to add them as tracked arcs.
	 *
	 * @param {DragEvent} event
	 * @returns {Promise<Item[]|boolean>}
	 */
	async _onDrop(event) {
		const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
		if (!this.actor.isOwner) return false;

		if (data.type === "Item") {
			const quest = await this._onDropQuest(data);
			if (quest) return quest;
		}

		return super._onDrop(event);
	}

	/**
	 * Create a quest item on the actor when dropped from elsewhere.
	 *
	 * @param {object} data Drag data from Foundry
	 * @returns {Promise<Item[]|boolean>}
	 * @private
	 */
	async _onDropQuest(data) {
		try {
			const item = await Item.implementation.fromDropData(data);
			if (!item || item.type !== "quest") return false;

			// If the quest already belongs to this actor, ignore the drop.
			if (item.parent?.uuid === this.actor.uuid) return false;

			const created = await this.actor.createEmbeddedDocuments("Item", [item]);
			this.render();
			return created;
		} catch (err) {
			console.warn("Failed to drop quest onto character sheet", err);
			return false;
		}
	}

	/**
	 * Change event actions in this.options.changeActions.
	 *
	 * Functionally similar to this.options.actions and fires callbacks
	 * specified in data-action-change on the element(s).
	 *
	 * @param {ChangeEvent} event Change event that triggered the call.
	 */
	async #onChange(event) {
		const target = event.target;
		const changeElement = target.closest("[data-action-change]");
		if (changeElement) {
			const { actionChange } = changeElement.dataset;
			if (actionChange) {
				this.options.changeActions?.[actionChange]?.call(
					this,
					event,
					changeElement
				);
			}
		}
	}

	async _prepareContext(options) {
		// Output initialization
		const context = {
			// Validates both permissions and compendium status
			editable: this.isEditable,
			owner: this.document.isOwner,
			limited: this.document.limited,
			// Add the actor document.
			actor: this.actor.toObject(),
			// Add a POJO copy of system data for form binding to avoid
			// reactive mutations wiping fields on unrelated updates (e.g., after rolls)
			system: this.actor.toObject().system,
			flags: this.actor.flags,
			// Roll data.
			rollData: this.actor.getRollData() ?? {},
			// Adding a pointer to CONFIG.GRIMWILD
			config: CONFIG.GRIMWILD,
			// Force re-renders. Defined in the vue mixin.
			_renderKey: this._renderKey ?? 0,
			_arrayEntryKey: this._arrayEntryKey ?? 0,
			// tabs: this._getTabs(options.parts),
			// Necessary for formInput and formFields helpers
			fields: this.document.schema.fields,
			systemFields: this.document.system.schema.fields
		};

		// Handle embedded documents.
		this._prepareItems(context);

		// Handle tabs.
		this._prepareTabs(context);

		// Handle enriched fields.
		const enrichmentOptions = {
			// Whether to show secret blocks in the finished html
			secrets: this.document.isOwner,
			// Data to fill in for inline rolls
			rollData: this.actor.getRollData() ?? {},
			// Relative UUID resolution
			relativeTo: this.actor
		};

		const editorOptions = {
			toggled: true,
			collaborate: true,
			documentUUID: this.document.uuid,
			height: 300
		};

		// Handle enriching fields.
		context.editors = {};
		await this._enrichFields(context, enrichmentOptions, editorOptions);

		// Make another pass through the editors to fix the element contents.
		for (let [field, editor] of Object.entries(context.editors)) {
			if (context.editors[field].element) {
				context.editors[field].element.innerHTML = context.editors[field].enriched;
			}
		}

		// Handle the custom harm homebrew.
		if (game.settings.get("grimwild-action", "enableHarmPools")) {
			context.enableHarm = true;
			context.maxBloodied = game.settings.get("grimwild-action", "maxBloodied");
			context.maxRattled = game.settings.get("grimwild-action", "maxRattled");
		}

		Hooks.callAll("grimwildActorSheetVuePrepareContext", this, context);

		return context;
	}

	/**
	 * Enrich values for action fields.
	 *
	 * @param {object} context
	 * @param {object} enrichmentOptions
	 * @param {object} editorOptions
	 */
	async _enrichFields(context, enrichmentOptions, editorOptions) {
		// Enrich other fields.
		const fields = this.enrichmentOptions.documentFields;
		const itemTypes = this.enrichmentOptions.itemFields;

		// Enrich actor fields.
		for (let field of fields) {
			const editorValue = this.actor.system?.[field] ?? foundry.utils.getProperty(this.actor.system, field);
			context.editors[`system.${field}`] = {
				enriched: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
					editorValue,
					enrichmentOptions
				),
				element: foundry.applications.elements.HTMLProseMirrorElement.create({
					...editorOptions,
					name: `system.${field}`,
					value: editorValue ?? ""
				})
			};
		}

		// Enrich item fields.
		for (let [type, itemFields] of Object.entries(itemTypes)) {
			if (this.document.itemTypes[type]) {
				// Iterate over the items.
				for (let item of this.document.itemTypes[type]) {
					// Handle enriched fields.
					const itemEnrichmentOptions = {
						secrets: item.isOwner,
						rollData: item.getRollData() ?? this.actor.getRollData(),
						relativeTo: item
					};
					// Iterate over each field within those items.
					for (let itemField of itemFields) {
						// Retrieve and enrich the field. Ignore creating prosemirror editors
						// since those should be edited directly on the item.
						const editorValue = item.system?.[itemField]
							?? foundry.utils.getProperty(item.system, itemField);
						// Add editor settings.
						context.editors[`items.${item.id}.system.${itemField}`] = {
							enriched: await foundry.applications.ux.TextEditor.implementation.enrichHTML(
								editorValue,
								itemEnrichmentOptions
							),
							element: null
						};
					}
				}
			}
		}
	}

	/**
	 * Prepare tabs for Vue.
	 *
	 * @param {object} context
	 */
	_prepareTabs(context) {
		// Initialize tabs.
		context.tabs = {
			primary: {}
		};

		// Tabs limited to characters.
		if (this.actor.type === "character") {
			context.tabs.primary.details = {
				key: "details",
				label: game.i18n.localize("GRIMWILD.Actor.Tabs.Details"),
				active: true
			};

			context.tabs.primary.talents = {
				key: "talents",
				label: game.i18n.localize("GRIMWILD.Actor.Tabs.Talents"),
				active: false
			};

			context.tabs.primary.arcana = {
				key: "arcana",
				label: game.i18n.localize("GRIMWILD.Actor.Tabs.Arcana"),
				active: false
			};

			// New: Items tab (empty content for now)
			context.tabs.primary.items = {
				key: "items",
				label: game.i18n.localize("GRIMWILD.Actor.Tabs.Items"),
				active: false
			};
		}

		// Tabs available to all actors.
		context.tabs.primary.biography = {
			key: "biography",
			label: game.i18n.localize("GRIMWILD.Actor.Tabs.Biography"),
			active: false
		};

		context.tabs.primary.notes = {
			key: "notes",
			label: game.i18n.localize("GRIMWILD.Actor.Tabs.Notes"),
			active: false
		};

		// @todo Active Effects disabled for now. Will revisit in the
		// future.

		// More tabs available to all actors.
		// context.tabs.primary.effects = {
		// 	key: "effects",
		// 	label: game.i18n.localize("GRIMWILD.Actor.Tabs.Effects"),
		// 	active: false,
		// };

		// Ensure we have a default tab.
		if (this.actor.type !== "character") {
			context.tabs.primary.details.active = true;
		}
	}

	/* -------------------------------------------- */

	/** ************
	 *
	 *   ACTIONS
	 *
	 **************/

    static async _openPack(event, target) {
        event.preventDefault();
        const { pack } = target.dataset;
        const compendium = game.packs.get(pack);
        if (!compendium) return;

        // Always render the compendium, creating the app if needed.
        compendium.render(true);

        // If an app instance exists, expand the character's path folder.
        const app = compendium?.apps?.[0];
        if (app) {
            const path = this.document.system.path;
            const folder = compendium.folders.find((f) => {
                return f.name.trim().toLocaleLowerCase() === path.trim().toLocaleLowerCase();
            });
            if (folder) {
                const otherFolders = compendium.folders.filter((f) => f.id !== folder.id);
                game.folders._expanded[folder.uuid] = true;
                otherFolders.forEach((f) => delete game.folders._expanded[f.uuid]);
            }
            app.render(true);
        }
    }

	/**
	 * Handle creating a new array entry (backgrounds, bonds, story arcs, etc.)
	 *
	 * @this GrimwildActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _createArrayEntry(event, target) {
		event.preventDefault();

		const {
			field,
			fieldType,
			count
		} = target.dataset;
		const schemaField = field?.startsWith("system.") ? field.slice("system.".length) : field;

		// StoryKits don't submit on change; commit current form values before
		// mutating arrays so in-flight edits (e.g., hooks) aren't lost.
		if (this.actor?.type === "storykit" || field === "system.hooks" || field === "hooks") {
			try {
				await this.submit({ preventRender: true });
			}
			catch (err) { /* ignore; continue with targeted update */ }
		}

		// Best-effort: commit in-flight changes only for Story Arcs,
		// to avoid wiping them when other arrays (like advancements)
		// are modified.
		if (field === "storyArcs") {
			try {
				await this.submit({ preventRender: true });
			}
			catch (err) { /* ignore; continue with targeted update */ }
		}

		// Retrieve the current field value.
		let entries = !field.startsWith("system.")
			? this.document.system[field]
			: foundry.utils.getProperty(this.document, field);
		if (!Array.isArray(entries)) entries = [];
		else entries = foundry.utils.duplicate(entries);

		// Retrieve the schema.
		const schema = this.document.system.schema.fields?.[schemaField];
		const fieldConstructor = fieldType ?? schema?.element?.constructor?.name;
		if (!fieldConstructor) return;

		// Determine the default value of the new entry.
		let defaultValue = {};

		// Helper to derive a sane default for a Field instance
		const defaultForField = (fld) => {
			const ctor = fld?.constructor?.name;
			switch (ctor) {
				case "StringField":
				case "HTMLField":
					return "";
				case "BooleanField":
					return false;
				case "NumberField":
					return 0;
				case "ArrayField":
					return Array.isArray(fld?.options?.initial) ? [...fld.options.initial] : [];
				case "SchemaField": {
					const out = {};
					for (const [k, sub] of Object.entries(fld.fields ?? {})) {
						out[k] = defaultForField(sub);
					}
					return out;
				}
				default:
					return null;
			}
		};

		switch (fieldConstructor) {
			case "StringField":
				defaultValue = "";
				break;

			case "ArrayField":
				// Create a default entry matching the element type of the array
				defaultValue = defaultForField(schema?.element);
				break;

			case "SchemaField":
				// Build object based on the field schema
				defaultValue = defaultForField(schema);
				break;

			default:
				defaultValue = null;
		}

		// If we're adding multiple entries at once, such as 6 strings,
		// handle that now.
		let entry = null;
		if (count) {
			entry = [];
			for (let i = 0; i < count; i++) {
				entry.push(defaultValue);
			}
		}
		else {
			entry = defaultValue;
		}

		// Push the new entry.
		entries.push(entry);

		// Build our final update payload.
		const update = {};
		const updatePath = field.startsWith("system.") ? field : `system.${field}`;
		update[updatePath] = entries;

		// When changing advancements, explicitly preserve the current storyArcs
		// stored on the document so they are not affected by this update.
		if (field === "advancements") {
			update["system.storyArcs"] = this.document.system.storyArcs;
		}

		// Perform the update.
		await this.document.update(update, { render: false });
		this._arrayEntryKey++;
		this.render(true);
	}

	/**
	 * Delete a Background item with confirmation.
	 *
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 */
	static async _deleteBackground(event, target) {
		const doc = this._getEmbeddedDocument(target);
		if (!doc) return;
		const name = foundry.utils.escapeHTML(doc.name ?? "Background");
		const confirmed = await Dialog.confirm({
			title: game.i18n.localize?.("Confirm") ?? "Confirm",
			content: `<p>${game.i18n.localize?.("AreYouSure") ?? "Are you sure?"} ${name}</p>`
		});
		if (!confirmed) return;
		await doc.delete();
	}

	/**
	 * Delete a quest item from the character sheet with confirmation.
	 *
	 * @param {PointerEvent} event
	 * @param {HTMLElement} target
	 */
	static async _deleteQuest(event, target) {
		event.preventDefault();
		const confirmed = await Dialog.confirm({
			title: game.i18n.localize?.("Confirm") ?? "Confirm",
			content: `<p>${game.i18n.localize?.("AreYouSure") ?? "Are you sure?"}</p>`
		});
		if (!confirmed) return;

		const doc = this._getEmbeddedDocument(target);
		if (!doc) return;
		await doc.delete();
	}

	/**
	 * Handle deleting an existing array entry.
	 *
	 * @this GrimwildActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _deleteArrayEntry(event, target) {
		event.preventDefault();

		const {
			field,
			key
		} = target.dataset;

		// StoryKits don't submit on change; commit current form values before
		// mutating arrays so in-flight edits (e.g., hooks) aren't lost.
		if (this.actor?.type === "storykit" || field === "system.hooks" || field === "hooks") {
			try {
				await this.submit({ preventRender: true });
			}
			catch (err) { /* ignore; continue with targeted update */ }
		}

		// Best-effort: commit in-flight changes only for Story Arcs,
		// to avoid wiping them when other arrays (like advancements)
		// are modified.
		if (field === "storyArcs") {
			try {
				await this.submit({ preventRender: true });
			}
			catch (err) { /* ignore; continue with targeted update */ }
		}

		// For destructive fields, ask for confirmation before deleting
		if (field === "storyArcs" || field === "resources") {
			const confirmed = await Dialog.confirm({
				title: game.i18n.localize?.("Confirm") ?? "Confirm",
				content: `<p>${game.i18n.localize?.("AreYouSure") ?? "Are you sure?"}</p>`
			});
			if (!confirmed) return;
		}

		// Retrieve the current field value.
		let entries = !field.startsWith("system.")
			? this.document.system[field]
			: foundry.utils.getProperty(this.document, field);
		if (!Array.isArray(entries)) entries = [];
		else entries = foundry.utils.duplicate(entries);
		entries.splice(key, 1);

		// Build our final update payload.
		const update = {};
		const updatePath = field.startsWith("system.") ? field : `system.${field}`;
		update[updatePath] = entries;

		// When changing advancements, explicitly preserve the current storyArcs
		// stored on the document so they are not affected by this update.
		if (field === "advancements") {
			update["system.storyArcs"] = this.document.system.storyArcs;
		}

		// Perform the update.
		await this.document.update(update, { render: false });
		this._arrayEntryKey++;
		this.render(true);
	}

	/**
	 * Handle changing XP via the checkbox pips.
	 *
	 * @param {PointerEvent} event The originating click event
	 * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _changeXp(event, target) {
		event.preventDefault();
		const dataset = target.dataset;
		if (dataset.xp) {
			// Retrieve incoming XP.
			const xp = Number(dataset.xp);
			// Determine if we should use the new XP value, or
			// decrement it so that it behaves like a toggle.
			const newXp = xp !== this.document.system.xp.value
				? xp
				: this.document.system.xp.value - 1;
			await this.document.update({ "system.xp.value": newXp });
		}
	}

	/**
	 * Handle updating talent trackers.
	 *
	 * @param {PointerEvent} event The originating click event
	 * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _updateTalentTracker(event, target) {
		event.preventDefault();
		// Retrieve props.
		const {
			itemId,
			trackerKey,
			value,
			trackerValue
		} = target.dataset;

		// Only push an update if we need one. Assume we don't.
		let changes = false;

		// Retrieve the item and tracker.
		const item = this.document.items.get(itemId);
		if (!item) return;
		const trackers = item.system.trackers;
		const tracker = trackers?.[trackerKey];
		if (!tracker) return;

		// Handle point tracker updates.
		if (tracker.type === "points") {
			if (!trackerValue || !value) {
				tracker.points.value = Number(target.value);
			}
			else {
				tracker.points.value = (value === trackerValue)
					? Number(value) - 1
					: Number(value);
			}
			if (tracker.points.value < 0) tracker.points.value = 0;
			changes = true;
		}
		// Handle pool tracker updates.
		else if (tracker.type === "pool") {
			tracker.pool.diceNum = Number(target.value);
			changes = true;
		}

		// Push the update if one is needed.
		if (changes) {
			trackers[trackerKey] = tracker;
			await item.update({ "system.trackers": trackers });
		}
	}

	/**
	 * Handle updating item trackers (arcana/talents).
	 *
	 * @param {PointerEvent} event The originating click event
	 * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _updateItemTracker(event, target) {
		return this._updateTalentTracker(event, target);
	}

	/**
	 * Handle rolling pools on the character sheet.
	 * @todo abstract this to the actor itself.
	 *
	 * @param {PointerEvent} event The originating click event
	 * @param {HTMLElement} target The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _rollPool(event, target) {
		event.preventDefault();
		// Retrieve props.
		const {
			itemId,
			field,
			key
		} = target.dataset;

		// Prepare variables.
		let item = null;
		let trackers = null;
		let tracker = null;
		let pool = null;
		let rollData = {};
		let fieldData = null;

		// Handle item pools (talents).
		if (itemId) {
			item = this.document.items.get(itemId);
			if (!item) return;
			trackers = item.system.trackers;
			tracker = trackers?.[key];
			if (!tracker) return;
			pool = tracker.pool;
			rollData = item.getRollData();
		}
		// Handle condition pools.
		else {
			fieldData = this.document.system?.[field] ?? null;
			if (!fieldData) return;
			pool = key !== undefined ? fieldData?.[key]?.pool : fieldData?.pool;
			if (!pool?.diceNum) return;
		}

		// Handle roll.
		if (pool.diceNum > 0) {
			const roll = new grimwild.diePools(`{${pool.diceNum}d6}`, rollData);
			const result = await roll.evaluate();
			const dice = result.dice[0].results;
			const dropped = dice.filter((die) => die.result < 4);

			// Initialize chat data.
			const speaker = ChatMessage.getSpeaker({ actor: this.actor });
			const rollMode = game.settings.get("core", "rollMode");
			const fieldLabel = key !== undefined
				? (fieldData?.[key]?.name ?? fieldData?.[key]?.label ?? "")
				: (fieldData?.name ?? fieldData?.label ?? "");
			const label = item
				? `[${item.type}] ${item.name}`
				: `[${field}] ${fieldLabel}`;
			// Send to chat.
			const msg = await roll.toMessage({
				speaker: speaker,
				rollMode: rollMode,
				flavor: label
			});
			// Wait for Dice So Nice if enabled.
			if (game.dice3d && msg?.id) {
				await game.dice3d.waitFor3DAnimationByMessageID(msg.id);
			}
			// Recalculate the pool value.
			pool.diceNum -= dropped.length;
			// Update the item.
			if (item) {
				trackers[key].pool = pool;
				await item.update({ "system.trackers": trackers });
			}
			// Otherwise, update the condition.
			else if (fieldData) {
				if (key !== undefined) {
					fieldData[key].pool = pool;
				}
				else {
					fieldData.pool = pool;
				}
				const update = {};
				update[`system.${field}`] = fieldData;
				await this.document.update({
					[`system.${field}`]: fieldData
				});
			}
		}
	}

	/**
	 * Handle clickable rolls.
	 *
	 * @this GrimwildActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @returns {Promise|void} The roll object, or void.
	 * @protected
	 */
	static async _onRoll(event, target) {
		event.preventDefault();
		const dataset = target.dataset;
		let item = null;

		// Handle item rolls.
		switch (dataset.rollType) {
			case "item":
				item = this._getEmbeddedDocument(target);
				if (item) return item.roll();
				break;
			case "stat":
				await this.document.system.roll({ stat: dataset.stat });
				break;
			case "story":
				await this.document.system.rollStory();
				break;
		}

		// Handle rolls that supply the formula directly.
		if (dataset.roll) {
			let label = dataset.label ? `[stat] ${dataset.label}` : "";
			let roll = new Roll(dataset.roll, this.actor.getRollData());
			await roll.toMessage({
				speaker: ChatMessage.getSpeaker({ actor: this.actor }),
				flavor: label,
				rollMode: game.settings.get("core", "rollMode")
			});
			return roll;
		}
	}
}

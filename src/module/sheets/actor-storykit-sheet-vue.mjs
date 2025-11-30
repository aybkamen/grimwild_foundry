import { StoryKitSheetVue } from "../../vue/components.vue.es.mjs";
import { StoryKitPieceDialog } from "../apps/storykit-piece-dialog.mjs";
import { GrimwildActorSheetVue } from "./actor-sheet-vue.mjs";

const { DOCUMENT_OWNERSHIP_LEVELS } = CONST;

export class GrimwildActorStoryKitSheetVue extends GrimwildActorSheetVue {
    enrichmentOptions = {
        documentFields: ["biography", "notes"],
        itemFields: {
            challenge: ["description"],
            setup: ["description"]
        }
    };
    vueParts = {
        "storykit-sheet": {
            component: StoryKitSheetVue,
            template: "<storykit-sheet :context=\"context\">Vue rendering for sheet failed.</storykit-sheet>"
        }
    };

    async _prepareContext(options) {
        const context = await super._prepareContext(options);

        // Add editors for pieces[].description for previews
        context.editors = context.editors || {};
        const enrichmentOptions = {
            secrets: this.document.isOwner,
            rollData: this.actor.getRollData() ?? {},
            relativeTo: this.actor
        };
        const pieces = this.document.system.pieces ?? [];
        for (let i = 0; i < pieces.length; i++) {
            const fieldPath = `system.pieces.${i}.description`;
            const value = pieces[i]?.description ?? "";
            context.editors[fieldPath] = {
                enriched: await foundry.applications.ux.TextEditor.implementation.enrichHTML(value, enrichmentOptions),
                element: null
            };
        }
        return context;
    }

    /** @override */
    async _processSubmitData(event, form, submitData) {
        // Prevent form submissions (which lack pieces inputs) from wiping arrays.
        const doc = this.document;
        if (!("system.pieces" in submitData)) {
            submitData["system.pieces"] = foundry.utils.duplicate(doc.system?.pieces ?? []);
        }
        if (!("system.hooks" in submitData)) {
            submitData["system.hooks"] = foundry.utils.duplicate(doc.system?.hooks ?? []);
        }
        if (!("system.mixItUp" in submitData)) {
            submitData["system.mixItUp"] = foundry.utils.duplicate(doc.system?.mixItUp ?? []);
        }
        return super._processSubmitData(event, form, submitData);
    }

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["grimwild", "actor", "storykit"],
        document: null,
        viewPermission: DOCUMENT_OWNERSHIP_LEVELS.LIMITED,
        editPermission: DOCUMENT_OWNERSHIP_LEVELS.OWNER,
        position: { width: 820, height: 750 },
        window: { resizable: true },
        tag: "form",
        actions: {
            onEditImage: this._onEditImage,
            createDoc: this._createDoc,
            deleteDoc: this._deleteDoc,
            viewDoc: this._viewDoc,
            rollPool: this._rollPool,
            createArrayEntry: this._createArrayEntry,
            deleteArrayEntry: this._deleteArrayEntry,
            editPiece: this._editPiece
        },
        changeActions: {
            updateItemField: this._updateItemField,
            updateChallengePool: this._updateChallengePool
        },
        dragDrop: [{ dragSelector: "[data-drag]", dropSelector: null }],
        // Avoid partial auto-submits clobbering arrays; rely on explicit updates and submit on close.
        form: { submitOnChange: false, submitOnClose: true }
    };

    _prepareTabs(context) {
        context.tabs = { primary: {} };
        context.tabs.primary.description = {
            key: "description",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.Description"),
            active: true
        };
        context.tabs.primary.pressure = {
            key: "pressure",
            label: game.i18n.localize("GRIMWILD.Actor.StoryKit.Tabs.Pressure"),
            active: false
        };
        context.tabs.primary.pieces = {
            key: "pieces",
            label: game.i18n.localize("GRIMWILD.Actor.StoryKit.Tabs.Pieces"),
            active: false
        };
        context.tabs.primary.setups = {
            key: "setups",
            label: game.i18n.localize("GRIMWILD.Actor.StoryKit.Tabs.Setups"),
            active: false
        };
        context.tabs.primary.challenges = {
            key: "challenges",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.Challenges"),
            active: false
        };
        context.tabs.primary.mix = {
            key: "mix",
            label: game.i18n.localize("GRIMWILD.Actor.StoryKit.Tabs.MixItUp"),
            active: false
        };
        context.tabs.primary.notes = {
            key: "notes",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.Notes"),
            active: false
        };
    }

    // Copied utility handlers from monster sheet for challenge editing
    static async _updateItemField(event, target) {
        event.preventDefault();
        const { field, itemId, key } = target.dataset;
        if (!this.isEditable) return;
        const item = this.document.items.get(itemId);
        if (!item) return;
        let value = null;
        switch (target.type) {
            case "checkbox": value = target.checked; break;
            default: value = target.value; break;
        }
        let update = null;
        if (key !== undefined) {
            update = foundry.utils.getProperty(item.toObject(), field);
            update[Number(key)] = value;
        } else {
            update = value;
        }
        await item.update({ [field]: update });
    }

    static async _updateChallengePool(event, target) {
        event.preventDefault();
        if (!this.isEditable) return;
        const { itemId } = target.dataset;
        const item = this.document.items.get(itemId);
        if (!item) return;
        await item.update({ "system.pool.diceNum": Number(target.value) });
    }

    static async _editPiece(event, target) {
        event.preventDefault();
        if (!this.isEditable) return;
        const key = Number(target.dataset.key);
        const pieces = foundry.utils.duplicate(this.document.system.pieces ?? []);
        const piece = pieces[key] ?? { title: "", description: "" };
        const result = await StoryKitPieceDialog.open({ piece });
        if (!result || typeof result !== "object" || !("title" in result) || !("description" in result)) return;
        pieces[key] = { title: result.title ?? "", description: result.description ?? "" };

        // Preserve hooks and mixItUp alongside pieces to avoid clobbering unsaved form state.
        const hooks = Array.isArray(this.document.system?.hooks) ? this.document.system.hooks.map((h) => h ?? "") : [];
        const mixes = Array.isArray(this.document.system?.mixItUp) ? this.document.system.mixItUp.map((m) => m ?? "") : [];

        await this.document.update({
            "system.pieces": pieces,
            "system.hooks": hooks,
            "system.mixItUp": mixes
        }, { render: false });
        this.render(true);
    }

}

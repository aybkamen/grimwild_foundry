import { StoryKitSheetVue } from "../../vue/components.vue.es.mjs";
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
            deleteArrayEntry: this._deleteArrayEntry
        },
        changeActions: {
            updateItemField: this._updateItemField,
            updateChallengePool: this._updateChallengePool
        },
        dragDrop: [{ dragSelector: "[data-drag]", dropSelector: null }],
        // Avoid auto-submit on every change; we handle critical fields manually
        // and rely on submit-on-close for the rest.
        form: { submitOnChange: true, submitOnClose: true }
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

}

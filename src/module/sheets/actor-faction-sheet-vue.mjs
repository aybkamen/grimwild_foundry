import { FactionSheetVue } from "../../vue/components.vue.es.mjs";
import { GrimwildActorSheetVue } from "./actor-sheet-vue.mjs";

const { DOCUMENT_OWNERSHIP_LEVELS } = CONST;

export class GrimwildActorFactionSheetVue extends GrimwildActorSheetVue {
    vueParts = {
        "faction-sheet": {
            component: FactionSheetVue,
            template: "<faction-sheet :context=\"context\">Vue rendering for sheet failed.</faction-sheet>"
        }
    };

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["grimwild", "actor", "faction"],
        document: null,
        viewPermission: DOCUMENT_OWNERSHIP_LEVELS.LIMITED,
        editPermission: DOCUMENT_OWNERSHIP_LEVELS.OWNER,
        position: { width: 600, height: 640 },
        window: { resizable: true },
        tag: "form",
        actions: {
            onEditImage: this._onEditImage,
            createDoc: this._createDoc,
            deleteDoc: this._deleteDoc,
            viewDoc: this._viewDoc,
            rollPool: this._rollPool
        },
        changeActions: {
            updateGoalPool: this._updateGoalPool
        },
        dragDrop: [{ dragSelector: "[data-drag]", dropSelector: null }],
        form: { submitOnChange: true, submitOnClose: true }
    };

    _prepareTabs(context) {
        context.tabs = { primary: {} };
        context.tabs.primary.summary = {
            key: "summary",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.Summary"),
            active: true
        };
        context.tabs.primary.resources = {
            key: "resources",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.Resources"),
            active: false
        };
        context.tabs.primary.goals = {
            key: "goals",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.Goals"),
            active: false
        };
        context.tabs.primary.challenges = {
            key: "challenges",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.Challenges"),
            active: false
        };
        context.tabs.primary.notes = {
            key: "notes",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.Notes"),
            active: false
        };
    }

    /** Update a goal's pool diceNum from Summary or Goals tab */
    static async _updateGoalPool(event, target) {
        const { key } = target.dataset;
        if (key === undefined) return;
        const goals = this.document.toObject().system.goals ?? [];
        const idx = Number(key);
        if (!goals[idx]) return;
        goals[idx].pool = goals[idx].pool || {};
        goals[idx].pool.diceNum = Number(target.value ?? 0);
        await this.document.update({ "system.goals": goals });
    }
}


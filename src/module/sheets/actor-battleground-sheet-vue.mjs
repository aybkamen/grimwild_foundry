import { BattlegroundSheetVue } from "../../vue/components.vue.es.mjs";
import { GrimwildActorSheetVue } from "./actor-sheet-vue.mjs";

const { DOCUMENT_OWNERSHIP_LEVELS } = CONST;

export class GrimwildActorBattlegroundSheetVue extends GrimwildActorSheetVue {
    vueParts = {
        "battleground-sheet": {
            component: BattlegroundSheetVue,
            template: "<battleground-sheet :context=\"context\">Vue rendering for sheet failed.</battleground-sheet>"
        }
    };

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["grimwild", "actor", "battleground"],
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
            rollPool: this._rollPool,
            adjustEnemyCount: this._adjustEnemyCount
        },
        changeActions: {
            updateThreatPool: this._updateThreatPool,
            updateEnemyPool: this._updateEnemyPool,
            updateEnemyCount: this._updateEnemyCount,
            updateThreatSuspenseStep: this._updateThreatSuspenseStep
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
        context.tabs.primary.featuresThreats = {
            key: "featuresThreats",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.FeaturesThreats"),
            active: false
        };
        context.tabs.primary.challenges = {
            key: "challenges",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.Challenges"),
            active: false
        };
        context.tabs.primary.enemies = {
            key: "enemies",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.Enemies"),
            active: false
        };
        context.tabs.primary.notes = {
            key: "notes",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.Notes"),
            active: false
        };
    }

    /**
     * Increment/decrement an enemy fixed count.
     */
    static async _adjustEnemyCount(event, target) {
        event.preventDefault();
        const { key, delta } = target.dataset;
        if (key === undefined) return;
        // Clone to plain object to avoid reactive issues
        const enemies = this.document.toObject().system.enemies ?? [];
        const idx = Number(key);
        if (!enemies[idx]) return;
        const newVal = Math.max(1, Number(enemies[idx].count ?? 1) + Number(delta ?? 0));
        enemies[idx].count = newVal;
        await this.document.update({ "system.enemies": enemies });
    }

    /** Update a threat's pool diceNum from Summary */
    static async _updateThreatPool(event, target) {
        const { key } = target.dataset;
        if (key === undefined) return;
        const threats = this.document.toObject().system.threats ?? [];
        const idx = Number(key);
        if (!threats[idx]) return;
        threats[idx].pool = threats[idx].pool || {};
        threats[idx].pool.diceNum = Number(target.value ?? 0);
        await this.document.update({ "system.threats": threats });
    }

    /** Update a threat's suspense step from Summary */
    static async _updateThreatSuspenseStep(event, target) {
        const { key, step } = target.dataset;
        if (key === undefined || step === undefined) return;
        const threats = this.document.toObject().system.threats ?? [];
        const idx = Number(key);
        const sIdx = Number(step);
        if (!threats[idx]) return;
        threats[idx].suspense = threats[idx].suspense || { steps: [] };
        const steps = Array.isArray(threats[idx].suspense.steps) ? threats[idx].suspense.steps : [];
        // Ensure at least two steps exist
        while (steps.length < 2) steps.push(false);

        // Apply the toggle from the checkbox
        const checked = !!target.checked;
        steps[sIdx] = checked;

        // Optional guard: ensure step 1 implies step 0, and clearing 0 clears 1
        if (sIdx === 1 && checked && !steps[0]) steps[0] = true;
        if (sIdx === 0 && !checked && steps[1]) steps[1] = false;

        threats[idx].suspense.steps = steps;
        await this.document.update({ "system.threats": threats });
    }

    /** Update an enemy's pool diceNum from Summary */
    static async _updateEnemyPool(event, target) {
        const { key } = target.dataset;
        if (key === undefined) return;
        const enemies = this.document.toObject().system.enemies ?? [];
        const idx = Number(key);
        if (!enemies[idx]) return;
        enemies[idx].pool = enemies[idx].pool || {};
        enemies[idx].pool.diceNum = Number(target.value ?? 0);
        await this.document.update({ "system.enemies": enemies });
    }

    /** Update an enemy fixed count from Summary */
    static async _updateEnemyCount(event, target) {
        const { key } = target.dataset;
        if (key === undefined) return;
        const enemies = this.document.toObject().system.enemies ?? [];
        const idx = Number(key);
        if (!enemies[idx]) return;
        enemies[idx].count = Math.max(1, Number(target.value ?? 1));
        await this.document.update({ "system.enemies": enemies });
    }
}

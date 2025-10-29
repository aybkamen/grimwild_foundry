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
            rollPool: this._rollPool
        },
        changeActions: {},
        dragDrop: [{ dragSelector: "[data-drag]", dropSelector: null }],
        form: { submitOnChange: true, submitOnClose: true }
    };

    _prepareTabs(context) {
        context.tabs = { primary: {} };
        context.tabs.primary.featuresThreats = {
            key: "featuresThreats",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.FeaturesThreats"),
            active: true
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
}

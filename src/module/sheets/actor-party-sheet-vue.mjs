import { PartySheetVue } from "../../vue/components.vue.es.mjs";
import { GrimwildActorSheetVue } from "./actor-sheet-vue.mjs";

const { DOCUMENT_OWNERSHIP_LEVELS } = CONST;

export class GrimwildActorPartySheetVue extends GrimwildActorSheetVue {
    vueParts = {
        "party-sheet": {
            component: PartySheetVue,
            template: "<party-sheet :context=\"context\">Vue rendering for sheet failed.</party-sheet>"
        }
    };

    /** @override */
    static DEFAULT_OPTIONS = {
        classes: ["grimwild", "actor", "party"],
        document: null,
        viewPermission: DOCUMENT_OWNERSHIP_LEVELS.LIMITED,
        editPermission: DOCUMENT_OWNERSHIP_LEVELS.OWNER,
        position: { width: 640, height: 680 },
        window: { resizable: true },
        tag: "form",
        actions: {
            onEditImage: this._onEditImage,
            createDoc: this._createDoc,
            deleteDoc: this._deleteDoc,
            deleteQuest: this._deleteQuest,
            viewDoc: this._viewDoc,
            removeMember: this._removeMember,
            openMember: this._openMember,
            createArrayEntry: this._createArrayEntry,
            deleteArrayEntry: this._deleteArrayEntry,
            rollPool: this._rollPool
        },
        dragDrop: [{ dragSelector: "[data-drag]", dropSelector: null }],
        form: { submitOnChange: true, submitOnClose: true }
    };

    _prepareTabs(context) {
        context.tabs = { primary: {} };
        context.tabs.primary.members = {
            key: "members",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.GroupMembers"),
            active: true
        };
        context.tabs.primary.items = {
            key: "items",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.Items"),
            active: false
        };
        context.tabs.primary.storyArcs = {
            key: "storyArcs",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.StoryArcs"),
            active: false
        };
        context.tabs.primary.details = {
            key: "details",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.Details"),
            active: false
        };
        context.tabs.primary.notes = {
            key: "notes",
            label: game.i18n.localize("GRIMWILD.Actor.Tabs.Notes"),
            active: false
        };
    }

    // Enable drag/drop for adding members
    _canDragStart() { return this.isEditable; }
    _canDragDrop() { return this.isEditable; }

    async _onDrop(event) {
        const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
        if (!this.actor.isOwner) return false;

        // Allow dropping quest items anywhere on the sheet to add them to the party story arcs tab.
        if (data.type === "Item") {
            const quest = await this._onDropQuest(data);
            if (quest) return quest;
        }

        let actor = null;
        try {
            if (data.type === "Actor") {
                actor = await fromUuid(data.uuid);
            } else if (data.type === "Token") {
                const token = await fromUuid(data.uuid);
                actor = token?.actor ?? null;
            }
        } catch (err) {
            console.warn(err);
        }

        if (!actor || actor.documentName !== "Actor") return false;
        if (actor.type !== "character") return false;

        const members = this.document.toObject().system.members ?? [];
        const uuid = actor.uuid;
        if (!members.includes(uuid)) members.push(uuid);
        await this.document.update({ "system.members": members });
        this.render();
    }

    static async _removeMember(event, target) {
        const { key } = target.dataset;
        if (key === undefined) return;
        const members = this.document.toObject().system.members ?? [];
        const idx = Number(key);
        if (isNaN(idx) || !members[idx]) return;
        members.splice(idx, 1);
        await this.document.update({ "system.members": members });
    }

    /**
     * Handle dropping a quest item onto the party sheet.
     *
     * @param {object} data Drag data from Foundry
     * @returns {Promise<Item[]|boolean>}
     * @private
     */
    async _onDropQuest(data) {
        try {
            const item = await Item.implementation.fromDropData(data);
            if (!item || item.type !== "quest") return false;

            // If the quest is already on this actor, no need to duplicate it.
            if (item.parent?.uuid === this.actor.uuid) return false;

            const created = await this.actor.createEmbeddedDocuments("Item", [item]);
            this.render();
            return created;
        } catch (err) {
            console.warn("Failed to drop quest onto party sheet", err);
            return false;
        }
    }

    /** Open a member's actor sheet from a uuid (Actor or Token) */
    static async _openMember(event, target) {
        event.preventDefault();
        const { uuid } = target.dataset;
        if (!uuid) return;
        try {
            const doc = await fromUuid(uuid);
            const actor = doc?.documentName === "Actor" ? doc : doc?.actor;
            actor?.sheet?.render(true);
        } catch (err) {
            console.warn("Failed to open member", uuid, err);
        }
    }

    /**
     * Delete a quest item from the Party sheet with confirmation.
     *
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @private
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
}

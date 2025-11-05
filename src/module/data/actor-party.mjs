import GrimwildActorBase from "./base-actor.mjs";

export default class GrimwildParty extends GrimwildActorBase {
    static LOCALIZATION_PREFIXES = [
        "GRIMWILD.Actor.base",
        "GRIMWILD.Actor.Party"
    ];

    static defineSchema() {
        const fields = foundry.data.fields;
        const schema = super.defineSchema();

        // Members: array of Actor or Token UUID strings
        schema.members = new fields.ArrayField(new fields.StringField());

        return schema;
    }
}


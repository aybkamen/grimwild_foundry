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

        // Concepts: choose 2 that the party is and 1 that it definitely isn't
        schema.concepts = new fields.ArrayField(
            new fields.SchemaField({
                are: new fields.BooleanField(),
                value: new fields.StringField()
            }),
            {
                initial: [
                    { are: true, value: "" },
                    { are: true, value: "" },
                    { are: false, value: "" }
                ]
            }
        );

        return schema;
    }
}

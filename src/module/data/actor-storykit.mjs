import GrimwildActorBase from "./base-actor.mjs";

export default class GrimwildStoryKit extends GrimwildActorBase {
    static LOCALIZATION_PREFIXES = [
        "GRIMWILD.Actor.base",
        "GRIMWILD.Actor.StoryKit"
    ];

    static defineSchema() {
        const fields = foundry.data.fields;
        const schema = super.defineSchema();

        // Description tab
        schema.hooks = new fields.ArrayField(new fields.StringField({ blank: true }), {
            initial: ["", "", ""]
        });
        // Note: description uses base `biography`

        // Useful Pieces: Array of { title, description(html) }
        schema.pieces = new fields.ArrayField(
            new fields.SchemaField({
                title: new fields.StringField({ blank: true }),
                description: new fields.HTMLField({ required: true, blank: true })
            }),
            { initial: [] }
        );

        // Mix it up: list of strings
        schema.mixItUp = new fields.ArrayField(new fields.StringField({ blank: true }), {
            initial: []
        });

        return schema;
    }
}


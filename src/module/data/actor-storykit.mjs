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
            initial: []
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

    /**
     * Migrate source data to the current schema.
     * Cleans up old or malformed values which can break validation,
     * particularly undefined entries inside the `pieces` array that
     * prevent StoryKits from loading.
     *
     * @param {object} source  Raw system data for the StoryKit actor
     * @returns {object}       The migrated source
     */
    static migrateData(source) {
        // Ensure hooks is an array of strings (no forced length).
        if (!Array.isArray(source.hooks)) source.hooks = [];
        source.hooks = source.hooks.map(h => (h ?? ""));

        // Normalize Useful Pieces.
        // Older data or buggy updates may have left `undefined` entries
        // which cause a DataModelValidationError (index may not be undefined).
        if (!Array.isArray(source.pieces)) source.pieces = [];
        source.pieces = source.pieces
            // Drop null/undefined values entirely
            .filter(p => p !== undefined && p !== null)
            // Coerce strings or partial objects to the expected shape
            .map(p => {
                if (typeof p === "string") return { title: "", description: p };
                const title = (typeof p?.title === "string") ? p.title : "";
                let description = p?.description;
                if (description === undefined || description === null) description = "";
                return { title, description };
            });

        // Ensure Mix It Up is an array of strings.
        if (!Array.isArray(source.mixItUp)) source.mixItUp = [];
        source.mixItUp = source.mixItUp.map(m => (m ?? ""));

        return super.migrateData(source);
    }
}

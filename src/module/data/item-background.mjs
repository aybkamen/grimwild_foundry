import GrimwildItemBase from "./base-item.mjs";

export default class GrimwildBackground extends GrimwildItemBase {
    static LOCALIZATION_PREFIXES = [
        "GRIMWILD.Item.base",
        "GRIMWILD.Item.Background"
    ];

    static defineSchema() {
        const fields = foundry.data.fields;
        const schema = super.defineSchema();

        // Wises: array of { label: string, active: boolean }
        schema.wises = new fields.ArrayField(
            new fields.SchemaField({
                label: new fields.StringField({ required: false, blank: true }),
                active: new fields.BooleanField({ required: false })
            }),
            { initial: [] }
        );

        // Flaws: array of { label: string, active: boolean }
        schema.flaws = new fields.ArrayField(
            new fields.SchemaField({
                label: new fields.StringField({ required: false, blank: true }),
                active: new fields.BooleanField({ required: false })
            }),
            { initial: [] }
        );

        // Quests: array of { label: string, active: boolean, milestones: [bool,bool,bool] }
        schema.quests = new fields.ArrayField(
            new fields.SchemaField({
                label: new fields.StringField({ required: false, blank: true }),
                active: new fields.BooleanField({ required: false }),
                milestones: new fields.ArrayField(new fields.BooleanField(), {
                    initial: [false, false, false]
                })
            }),
            { initial: [] }
        );

        return schema;
    }
}


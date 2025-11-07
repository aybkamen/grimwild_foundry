import GrimwildItemBase from "./base-item.mjs";

export default class GrimwildSetup extends GrimwildItemBase {
    static LOCALIZATION_PREFIXES = [
        "GRIMWILD.Item.base",
        "GRIMWILD.Item.Setup"
    ];

    static defineSchema() {
        const fields = foundry.data.fields;
        const schema = super.defineSchema();

        // Elements selectable as blank/yes/no with a label
        schema.elements = new fields.ArrayField(
            new fields.SchemaField({
                label: new fields.StringField({ required: false, blank: true }),
                state: new fields.StringField({
                    initial: "",
                    blank: true,
                    required: false,
                    choices: {
                        "": " ",
                        yes: "Yes",
                        no: "No"
                    }
                })
            }),
            { initial: [] }
        );

        return schema;
    }
}

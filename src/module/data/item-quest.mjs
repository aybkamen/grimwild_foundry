import GrimwildItemBase from "./base-item.mjs";

export default class GrimwildQuest extends GrimwildItemBase {
	static LOCALIZATION_PREFIXES = [
		"GRIMWILD.Item.base",
		"GRIMWILD.Item.Quest"
	];

	static defineSchema() {
		const fields = foundry.data.fields;
		const schema = super.defineSchema();

		schema.activeMilestone = new fields.NumberField({
			required: false,
			nullable: true,
			integer: true
		});

		schema.completed = new fields.BooleanField({
			required: false,
			initial: false
		});

		schema.abandoned = new fields.BooleanField({
			required: false,
			initial: false
		});

		schema.size = new fields.StringField({
			blank: true,
			required: false,
			initial: "short",
			choices: {
				short: "Short",
				medium: "Medium",
				long: "Long"
			}
		});

		schema.milestones = new fields.ArrayField(
			new fields.SchemaField({
				label: new fields.StringField({ required: false, blank: true }),
				done: new fields.BooleanField({ required: false })
			}),
			{ initial: [] }
		);

		return schema;
	}
}

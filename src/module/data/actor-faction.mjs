import GrimwildActorBase from "./base-actor.mjs";
import { DicePoolField } from "../helpers/schema.mjs";

export default class GrimwildFaction extends GrimwildActorBase {
    static LOCALIZATION_PREFIXES = [
        "GRIMWILD.Actor.base",
        "GRIMWILD.Actor.Faction"
    ];

    static defineSchema() {
        const fields = foundry.data.fields;
        const schema = super.defineSchema();

        // Description: rich text (HTML)
        schema.description = new fields.HTMLField({ required: true, blank: true });

        // Resources: simple list of strings (like Battleground features)
        schema.resources = new fields.ArrayField(new fields.StringField());

        // Goals: list of named dice pools
        schema.goals = new fields.ArrayField(
            new fields.SchemaField({
                name: new fields.StringField(),
                term: new fields.StringField({
                    choices: { short: "Short", medium: "Medium", long: "Long" },
                    initial: "short"
                }),
                pool: new DicePoolField()
            })
        );

        return schema;
    }

    prepareBaseData() {
        // Ensure each goal has a pool object
        for (const [i, g] of this.goals.entries()) {
            if (!this.goals[i].pool) this.goals[i].pool = { diceNum: 0 };
            if (!this.goals[i].term) this.goals[i].term = "short";
        }
    }
}


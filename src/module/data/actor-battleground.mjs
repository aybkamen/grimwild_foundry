import GrimwildActorBase from "./base-actor.mjs";
import { DicePoolField } from "../helpers/schema.mjs";

export default class GrimwildBattleground extends GrimwildActorBase {
    static LOCALIZATION_PREFIXES = [
        "GRIMWILD.Actor.base",
        "GRIMWILD.Actor.Battleground"
    ];

    static defineSchema() {
        const fields = foundry.data.fields;
        const schema = super.defineSchema();

        // Simple list of feature strings
        schema.features = new fields.ArrayField(new fields.StringField());

        // Threats can be suspense (2-step) or timer (dice pool)
        schema.threats = new fields.ArrayField(
            new fields.SchemaField({
                name: new fields.StringField(),
                type: new fields.StringField({
                    choices: { suspense: "Suspense", timer: "Timer" },
                    initial: "suspense"
                }),
                // Pool lives at the top level so the shared pool roller can access threats[key].pool
                pool: new DicePoolField(),
                suspense: new fields.SchemaField({
                    steps: new fields.ArrayField(new fields.BooleanField())
                })
            })
        );

        return schema;
    }

    prepareBaseData() {
        // Ensure each threat has required sub-structure
        for (const [i, t] of this.threats.entries()) {
            // Default type
            if (!t.type) this.threats[i].type = "suspense";
            // Ensure suspense has two steps
            if (!t.suspense) this.threats[i].suspense = { steps: [] };
            const steps = this.threats[i].suspense.steps ?? [];
            if (steps.length < 2) {
                for (let s = steps.length; s < 2; s++) steps.push(false);
                this.threats[i].suspense.steps = steps;
            }
            // Ensure pool exists for timer threats (diceNum defaults to 0 via DicePoolField)
            if (!this.threats[i].pool) this.threats[i].pool = { diceNum: 0 };
        }
    }
}


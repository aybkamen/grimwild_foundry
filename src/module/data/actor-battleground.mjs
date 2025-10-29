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

        // Enemies: fixed count, pooled group, or challenge with optional pool indicator
        schema.enemies = new fields.ArrayField(
            new fields.SchemaField({
                name: new fields.StringField(),
                // Stored UUID or empty; for now UI edits name directly
                uuid: new fields.StringField({ required: false, blank: true }),
                type: new fields.StringField({
                    choices: { fixed: "Fixed", pool: "Pool", challenge: "Challenge" },
                    initial: "fixed"
                }),
                count: new fields.NumberField({ integer: true, min: 1, initial: 1 }),
                pool: new DicePoolField()
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

        // Ensure enemies have defaults
        for (const [i, e] of this.enemies.entries()) {
            if (!e.type) this.enemies[i].type = "fixed";
            if (!this.enemies[i].count) this.enemies[i].count = 1;
            if (!this.enemies[i].pool) this.enemies[i].pool = { diceNum: 0 };
        }
    }
}

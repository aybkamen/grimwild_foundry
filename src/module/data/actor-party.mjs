import GrimwildActorBase from "./base-actor.mjs";
import { DicePoolField } from "../helpers/schema.mjs";

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

        // Treasure: coin checks mirroring character sheets
        schema.treasure = new fields.SchemaField({
            few: new fields.ArrayField(new fields.BooleanField(), { initial: [false, false, false, false, false] }),
            pouch: new fields.ArrayField(new fields.BooleanField(), { initial: [false, false, false, false, false] }),
            bag: new fields.ArrayField(new fields.BooleanField(), { initial: [false, false, false] }),
            chest: new fields.ArrayField(new fields.BooleanField(), { initial: [false] })
        });

        // Resources: rollable pools with labels
        schema.resources = new fields.ArrayField(
            new fields.SchemaField({
                label: new fields.StringField(),
                pool: new DicePoolField()
            }),
            { initial: [] }
        );

        return schema;
    }

    /**
     * Ensure legacy party documents receive defaults for new fields.
     *
     * @param {object} source
     * @returns {object}
     */
    static migrateData(source) {
        // Normalize treasure structure
        source.treasure = source.treasure ?? {};
        const ensureBools = (arr, len) => {
            if (!Array.isArray(arr)) arr = [];
            arr = arr.map((v) => !!v);
            while (arr.length < len) arr.push(false);
            if (arr.length > len) arr = arr.slice(0, len);
            return arr;
        };
        source.treasure.few = ensureBools(source.treasure.few, 5);
        source.treasure.pouch = ensureBools(source.treasure.pouch, 5);
        source.treasure.bag = ensureBools(source.treasure.bag, 3);
        source.treasure.chest = ensureBools(source.treasure.chest, 1);

        // Normalize resources structure
        if (!Array.isArray(source.resources)) source.resources = [];
        source.resources = source.resources.map((res) => {
            const normalized = res && typeof res === "object" ? { ...res } : {};
            const label = typeof normalized.label === "string"
                ? normalized.label
                : (typeof normalized.name === "string" ? normalized.name : "");
            const pool = normalized.pool && typeof normalized.pool === "object" ? { ...normalized.pool } : {};
            const diceNum = Number.isFinite(pool.diceNum) ? Math.max(0, Math.floor(pool.diceNum)) : 0;
            const max = Number.isFinite(pool.max) ? Math.max(0, Math.floor(pool.max)) : undefined;
            return {
                label,
                pool: {
                    diceNum,
                    ...(max !== undefined ? { max } : {})
                }
            };
        });

        return super.migrateData(source);
    }
}

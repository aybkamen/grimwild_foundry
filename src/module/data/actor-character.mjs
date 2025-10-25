import GrimwildActorBase from "./base-actor.mjs";
import { DicePoolField } from "../helpers/schema.mjs";
import { GrimwildRollDialog } from "../apps/roll-dialog.mjs";

export default class GrimwildCharacter extends GrimwildActorBase {
	static LOCALIZATION_PREFIXES = [
		"GRIMWILD.Actor.base",
		"GRIMWILD.Actor.Character"
	];

	static defineSchema() {
		const fields = foundry.data.fields;
		const requiredInteger = { required: true, nullable: false, integer: true };
		const schema = super.defineSchema();

		schema.path = new fields.StringField({ required: true, blank: true });

		schema.xp = new fields.SchemaField({
			value: new fields.NumberField({
				integer: true,
				initial: 0,
				min: 0
			})
		});

		schema.attributes = new fields.SchemaField({
			level: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 1 })
			})
		});

		schema.bloodied = new fields.SchemaField({
			pool: new DicePoolField(),
			marked: new fields.BooleanField(),
			dropped: new fields.BooleanField()
		});
		schema.rattled = new fields.SchemaField({
			pool: new DicePoolField(),
			marked: new fields.BooleanField(),
			dropped: new fields.BooleanField()
		});

		schema.dropped = new fields.BooleanField();

		schema.conditions = new fields.ArrayField(new fields.SchemaField({
			name: new fields.StringField(),
			pool: new DicePoolField(),
			severity: new fields.StringField({
				choices: {
					urgent: "Urgent",
					shortTerm: "Short Term",
					longTerm: "Long Term",
					permanent: "Permanent"
				}
			})
		}));

		schema.spark = new fields.SchemaField({
			steps: new fields.ArrayField(new fields.BooleanField())
		});

		schema.story = new fields.SchemaField({
			steps: new fields.ArrayField(new fields.BooleanField())
		});

		// Iterate over stat names and create a new SchemaField for each.
		schema.stats = new fields.SchemaField(
			Object.keys(CONFIG.GRIMWILD.stats).reduce((obj, stat) => {
				obj[stat] = new fields.SchemaField({
					value: new fields.NumberField({
						...requiredInteger,
						max: 3,
						initial: 1,
						min: 0
					}),
					marked: new fields.BooleanField()
				});
				return obj;
			}, {})
		);

		schema.features = new fields.StringField();
		schema.backgrounds = new fields.ArrayField(
			new fields.SchemaField({
				name: new fields.StringField(),
				wises: new fields.ArrayField(new fields.StringField())
			}),
			{
                initial: [
                    { name: "", wises: ["", "", "", ""] },
                    { name: "", wises: ["", "", "", ""] },
                    { name: "", wises: ["", "", "", ""] }
                ]
            }
        );

		schema.traits = new fields.ArrayField(
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

		schema.desires = new fields.ArrayField(
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

		// Backpack: 10 text slots
		schema.backpack = new fields.ArrayField(
			new fields.StringField(),
			{ initial: ["", "", "", "", "", "", "", "", "", ""] }
		);

		// Treasure: groups of checkboxes
		schema.treasure = new fields.SchemaField({
			few: new fields.ArrayField(new fields.BooleanField(), { initial: [false, false, false, false, false] }),
			pouch: new fields.ArrayField(new fields.BooleanField(), { initial: [false, false, false, false, false] }),
			bag: new fields.ArrayField(new fields.BooleanField(), { initial: [false, false, false] }),
			chest: new fields.ArrayField(new fields.BooleanField(), { initial: [false] })
		});

		// Two free-text flaws shown on the Details tab
		schema.flaws = new fields.ArrayField(
			new fields.StringField(),
			{ initial: ["", ""] }
		);

		// Four free-text special assets shown on the Details tab
		schema.specialAssets = new fields.ArrayField(
			new fields.StringField(),
			{ initial: ["", "", "", ""] }
		);

		schema.bonds = new fields.ArrayField(
			new fields.SchemaField({
				name: new fields.StringField(),
				description: new fields.StringField()
			})
		);

		return schema;
	}

	get level() {
		if (this.xp.value < 2) return 1;

		let step = 2;
		let threshold = 2;

		while (this.xp.value >= threshold) {
			step++;
			threshold += step; // Increment threshold by the next step value
		}

		return step - 1;
	}

	get isBloodied() {
		return this.bloodied.marked;
	}

	get isRattled() {
		return this.rattled.marked;
	}

	get orderedStats() {
		const orderedStats = [];
		for (let [k, v] of Object.entries(this.stats)) {
			orderedStats.push({ key: k, value: v });
		}
		orderedStats.sort((a, b) => {
			const order = (s) => {
				switch (s) {
					case "bra":
						return 0;
					case "agi":
						return 1;
					case "wis":
						return 2;
					case "pre":
						return 3;
					default:
						return 100;
				}
			};
			return order(a.key) - order(b.key);
		});
		return orderedStats;
	}

	async _preUpdate(changes, options, user) {
		if (game.settings.get("grimwild-action", "enableHarmPools")) {
			const checkPool = (change, source) => {
				if (change) {
					// Start the healing pool
					if (change.marked && !source.marked && !change.pool.diceNum && !source.pool.diceNum) {
						change.pool.diceNum = 1;
					}
					// Cancel the healing pool
					if (!change.marked && source.marked && change.pool.diceNum === source.pool.diceNum) {
						change.pool.diceNum = 0;
					}
					// Pool started
					if (!source.marked && change.pool.diceNum && !source.pool.diceNum) {
						change.marked = true;
					}
					// Pool expired
					if (source.marked && !change.pool.diceNum && source.pool.diceNum) {
						change.marked = false;
					}
				}
			};
			checkPool(changes.system?.bloodied, this._source.bloodied);
			checkPool(changes.system?.rattled, this._source.rattled);
		}

		const checkSteps = (change, source) => {
			if (change) {
				// Mark both
				if (!source.steps[1] && change.steps[1] && !change.steps[0]) {
					change.steps[0] = true;
				}
				// Clear both
				if (source.steps[0] && change.steps[1] && !change.steps[0]) {
					change.steps[1] = false;
				}
			}
		};
		checkSteps(changes.system?.spark, this._source.spark);
		checkSteps(changes.system?.story, this._source.story);

		// Guard against accidental wipes of text arrays coming from stray form submits
		try {
			if (this.parent?.type === 'character') {
				// Backgrounds: if update attempts to set all empty while current has content, drop the change
				const incomingBgs = changes.system?.backgrounds;
				if (Array.isArray(incomingBgs)) {
					const allIncomingEmpty = incomingBgs.every((bg) => {
						const n = (bg?.name ?? '').trim();
						const w = Array.isArray(bg?.wises) ? bg.wises.every((w) => (w ?? '').trim() === '') : true;
						return n === '' && w;
					});
					const anyCurrentHasText = Array.isArray(this._source?.backgrounds) && this._source.backgrounds.some((bg) => {
						const n = (bg?.name ?? '').trim();
						const w = Array.isArray(bg?.wises) ? bg.wises.some((w) => (w ?? '').trim() !== '') : false;
						return n !== '' || w;
					});
					if (allIncomingEmpty && anyCurrentHasText) {
						delete changes.system.backgrounds;
					}
				}
				// Flaws: same guard
				const incomingFlaws = changes.system?.flaws;
				if (Array.isArray(incomingFlaws)) {
					const incomingFlawsEmpty = incomingFlaws.every((f) => (f ?? '').trim() === '');
					const anyCurrentFlawText = Array.isArray(this._source?.flaws) && this._source.flaws.some((f) => (f ?? '').trim() !== '');
					if (incomingFlawsEmpty && anyCurrentFlawText) {
						delete changes.system.flaws;
					}
				}
				// Special Assets: guard against accidental wipes
				const incomingAssets = changes.system?.specialAssets;
				if (Array.isArray(incomingAssets)) {
					const incomingAssetsEmpty = incomingAssets.every((a) => (a ?? '').trim() === '');
					const anyCurrentAssetText = Array.isArray(this._source?.specialAssets) && this._source.specialAssets.some((a) => (a ?? '').trim() !== '');
					if (incomingAssetsEmpty && anyCurrentAssetText) {
						delete changes.system.specialAssets;
					}
				}
			}
		} catch (e) {
			/* guard failed; continue without blocking */
		}
	}

	prepareDerivedData() {
		// Loop through stat scores, and add their modifiers to our sheet output.
		for (const key in this.stats) {
			// Handle stat label localization.
			this.stats[key].label =
				game.i18n.localize(CONFIG.GRIMWILD.stats[key]) ?? key;
			this.stats[key].abbr =
				game.i18n.localize(CONFIG.GRIMWILD.statAbbreviations[key]) ?? key;
		}

		// Calculate spark and story values.
		this.spark.value = 0;
		for (const step in this.spark.steps) {
			if (this.spark.steps[step]) this.spark.value++;
		}
		this.story.value = 0;
		for (const step in this.story.steps) {
			if (this.story.steps[step]) this.story.value++;
		}

		// Calculate XP pips for the sheet.
		this.xp.steps = [];
		let xpTally = 1;
		for (let i = 0; i < 6; i++) {
			this.xp.steps.push([]);
			for (let j = 0; j < i + 2; j++) {
				this.xp.steps[i].push(xpTally);
				xpTally++;
			}
		}
	}

	getRollData() {
		const data = this.toObject();

		if (this.stats) {
			for (let [k, v] of Object.entries(this.stats)) {
				data.stats[k] = v;
			}
		}

		// Handle getters.
		data.isBloodied = this.isBloodied;
		data.isRattled = this.isRattled;
		data.spark = this.spark.value;
		data.id = this.parent.id;

		return data;
	}

	async roll(options) {
		const rollData = this.getRollData();

		if (options?.stat && rollData?.stats?.[options.stat]) {
			const rollDialog = await GrimwildRollDialog.open({
				rollData: {
					name: this?.name ?? this?.parent?.name,
					spark: rollData?.spark,
					stat: options.stat,
					diceDefault: rollData?.stats?.[options.stat].value,
					isBloodied: rollData?.isBloodied,
					isRattled: rollData?.isRattled,
					isMarked: rollData?.stats?.[options.stat].marked
				}
			});
			// bail out if they closed the dialog
			if (rollDialog === null) {
				return;
			}
			rollData.danger = rollDialog.danger;
			rollData.statDice = rollDialog.dice;
			options.assists = rollDialog.assisters;
			const formula = "{(@statDice)d6, (@danger)d6}";
			const roll = new grimwild.roll(formula, rollData, options);
			// Evaluate early to access dice and apply Dice So Nice colors per pool
			await roll.evaluate();
			try {
				if (game.dice3d) {
					const setColorset = (die, colorset) => {
						if (!die) return;
						die.options = die.options ?? {};
						die.options.appearance = { ...(die.options.appearance ?? {}), colorset };
					};
					setColorset(roll.dice?.[0], "white");
					setColorset(roll.dice?.[1], "black");
				}
			} catch (err) { console.warn("Dice color set warning:", err); }

			const updates = {};

			// Remove used spark.
			if (rollDialog.sparkUsed > 0) {
				const sparkUsed = rollDialog.sparkUsed;
				// Clone current steps to avoid mutating the live model reference
				const newSteps = Array.isArray(this.spark.steps) ? [...this.spark.steps] : [false, false];
				// All of your spark is used.
				if (sparkUsed > 1 || this.spark.value === 1) {
					newSteps[0] = false;
					newSteps[1] = false;
				}
				// If half of your spark is used.
				else if (sparkUsed === 1 && this.spark.value > 1) {
					newSteps[0] = true;
					newSteps[1] = false;
				}
				// Update only the steps path to avoid accidental overwrites
				updates["system.spark.steps"] = newSteps;
			}

			// Remove marks.
			if (rollData?.stats?.[options.stat].marked) {
				updates[`system.stats.${options.stat}.marked`] = false;
			}

			// Handle the updates.
			const actor = game.actors.get(this.parent.id);
			// Commit any pending form inputs (e.g., text fields that haven't lost focus)
			// so they are not lost when the sheet re-renders after this update.
			try {
				if (actor?.sheet) await actor.sheet.submit({ preventRender: true });
			} catch (err) { /* best-effort */ }
			// Apply only the minimal, targeted update and let Foundry re-render naturally
			await actor.update(updates, { render: true });

			await roll.toMessage({
				actor: this,
				speaker: ChatMessage.getSpeaker({ actor: this }),
				rollMode: game.settings.get("core", "rollMode")
			});

			await this.updateCombatActionCount();

		}
	}

	/**
	 * Update action count for combatants.
	 */
	async updateCombatActionCount() {
		for (const combat of game.combats) {
			const combatant = combat?.getCombatantByActor(this.parent.id);
			if (combatant) {
				const actionCount = Number(combatant.flags?.grimwild?.actionCount ?? 0);
				await combatant.setFlag("grimwild-action", "actionCount", actionCount + 1);

				// Update the active turn.
				const combatantTurn = combat.turns.findIndex((c) => c.id === combatant.id);
				if (combatantTurn !== undefined) {
					combat.update({'turn': combatantTurn});
				}
			}
		}
	}

	/**
	 * Migrate a document to a newer schema.
	 *
	 * @param {object} source Source document.
	 * @returns {object} Source document with migrated data values.
	 */
	static migrateData(source) {
		if (!source.bloodied?.pool && source.bloodied?.diceNum) {
			const oldBloodied = { ...source.bloodied };
			source.bloodied = {
				pool: oldBloodied,
				marked: false
			};
		}

		if (!source.rattled?.pool && source.rattled?.diceNum) {
			const oldRattled = { ...source.rattled };
			source.rattled = {
				pool: oldRattled,
				marked: false
			};
		}

        // Ensure three backgrounds exist and each has four wises
        if (!Array.isArray(source.backgrounds)) {
            source.backgrounds = [];
        }
        // Normalize existing backgrounds
        source.backgrounds = source.backgrounds.map((bg) => {
            const name = bg?.name ?? "";
            let wises = Array.isArray(bg?.wises) ? bg.wises.slice(0, 4) : [];
            while (wises.length < 4) wises.push("");
            return { name, wises };
        });
		// Add missing background slots up to three
		while (source.backgrounds.length < 3) {
			source.backgrounds.push({ name: "", wises: ["", "", "", ""] });
		}

		// Ensure flaws is an array of two strings
		if (!Array.isArray(source.flaws)) source.flaws = ["", ""];
		while (source.flaws.length < 2) source.flaws.push("");
		if (source.flaws.length > 2) source.flaws = source.flaws.slice(0, 2);

		// Ensure specialAssets is an array of four strings
		if (!Array.isArray(source.specialAssets)) source.specialAssets = ["", "", "", ""];
		while (source.specialAssets.length < 4) source.specialAssets.push("");
		if (source.specialAssets.length > 4) source.specialAssets = source.specialAssets.slice(0, 4);

		// Ensure backpack is an array of ten strings
		if (!Array.isArray(source.backpack)) source.backpack = ["", "", "", "", "", "", "", "", "", ""];
		while (source.backpack.length < 10) source.backpack.push("");
		if (source.backpack.length > 10) source.backpack = source.backpack.slice(0, 10);

		// Ensure treasure structure exists with proper lengths
		source.treasure = source.treasure ?? {};
		const ensureBools = (arr, len) => {
			if (!Array.isArray(arr)) arr = [];
			arr = arr.map(v => !!v);
			while (arr.length < len) arr.push(false);
			if (arr.length > len) arr = arr.slice(0, len);
			return arr;
		};
		source.treasure.few = ensureBools(source.treasure.few, 5);
		source.treasure.pouch = ensureBools(source.treasure.pouch, 5);
		source.treasure.bag = ensureBools(source.treasure.bag, 3);
		source.treasure.chest = ensureBools(source.treasure.chest, 1);

		return super.migrateData(source);
	}
}

export default class GrimwildStoryRoll extends Roll {
	static CHAT_TEMPLATE = "systems/grimwild-action/templates/chat/roll-story.hbs";

	constructor(formula, data, options) {
		super(formula, data, options);
	}

	async render({ flavor, template = this.constructor.CHAT_TEMPLATE, isPrivate = false } = {}) {
		if (!this._evaluated) await this.evaluate();

		try {
			if (game.dice3d && this.dice?.[0]) {
				this.dice[0].options = { ...(this.dice[0].options ?? {}), colorset: "white" };
			}
		}
		catch (err) {
			console.warn("Dice color warning:", err);
		}

		const diceResults = (this.dice[0]?.results ?? []).map((d, idx) => ({ result: d.result, idx }));
		const action = diceResults.map((d) => d.result);
		const highest = action.length ? Math.max(...action) : 0;
		const chosenIdx = diceResults.find((d) => d.result === highest)?.idx ?? -1;

		let result = "grim";
		if (highest >= 6) result = "perfect";
		else if (highest >= 4) result = "messy";

		const chatData = {
			formula: isPrivate ? "???" : this._formula,
			flavor: isPrivate ? null : flavor ?? this.options.flavor,
			user: game.user.id,
			tooltip: isPrivate ? "" : await this.getTooltip(),
			total: isPrivate ? "?" : this.total,
			dice: diceResults.map((d) => ({
				result: d.result,
				chosen: d.idx === chosenIdx
			})),
			result,
			rawResult: result,
			actionDiceCount: diceResults.length,
			isPrivate
		};

		return foundry.applications.handlebars.renderTemplate(template, chatData);
	}
}

export class GrimwildStoryRollDialog extends foundry.applications.api.DialogV2 {
	static DEFAULT_OPTIONS = {
		...super.DEFAULT_OPTIONS,
		actions: {
			changeDice: this._changeDice
		},
		changeActions: {
			updateDice: this._updateDiceTotal
		},
		inputActions: {
			updateDice: this._updateDiceTotal
		}
	};

	_attachFrameListeners() {
		super._attachFrameListeners();
		const change = this.#onChange.bind(this);
		this.element.addEventListener("change", change);
		const input = this.#onInput.bind(this);
		this.element.addEventListener("input", input);
	}

	static _render(event, application) {
		const html = application.element;
		const baseInput = html.querySelector("#storyDice");
		const sparkChecks = html.querySelectorAll(".sparkCheck");
		const baseValue = parseInt(baseInput?.value || 0, 10);
		const sparkUsed = Array.from(sparkChecks).reduce((sum, checkbox) => sum + (checkbox.checked ? 1 : 0), 0);
		const total = Math.max(baseValue + sparkUsed, 0);
		const totalDisplay = html.querySelector("#totalDice");
		const totalValue = html.querySelector("#totalDiceInput");
		if (totalDisplay) totalDisplay.textContent = String(total);
		if (totalValue) totalValue.value = String(total);
	}

	static async open({ rollData, ...options } = {}) {
		const clampMin = (value, min) => Math.max(value, min);
		const data = { ...(rollData ?? {}) };
		data.diceDefault = clampMin(Number(data?.diceDefault ?? 2) || 2, 1);
		data.hasSpark = (data?.spark ?? 0) > 0;
		data.sparkArray = Array.from({ length: data?.spark ?? 0 }, (_, i) => i);

		options.content = await foundry.applications.handlebars.renderTemplate(
			"systems/grimwild-action/templates/dialog/story-roll.hbs",
			data
		);
		options.render = this._render;
		options.modal = true;
		options.window = { title: game.i18n.localize?.("GRIMWILD.Actor.Character.FIELDS.story.label") ?? "Story Roll" };
		options.window = { ...(options.window ?? {}), width: 420 };
		options.rejectClose = false;
		options.buttons = [
			{
				label: game.i18n.localize("GRIMWILD.Dialog.Roll"),
				action: "roll",
				callback: (event, button, dialog) => {
					const sparkChecks = dialog.element.querySelectorAll(".sparkCheck");
					const sparkUsed = Array.from(sparkChecks).reduce((sum, checkbox) => sum + (checkbox.checked ? 1 : 0), 0);
					const diceInput = dialog.element.querySelector("#storyDice");
					const totalInput = dialog.element.querySelector("#totalDiceInput");
					const baseDice = parseInt(diceInput?.value || data.diceDefault, 10);
					const totalDice = parseInt(totalInput?.value || baseDice + sparkUsed, 10);
					return {
						dice: totalDice,
						baseDice,
						sparkUsed
					};
				}
			}
		];

		return super.wait(options);
	}

	async #onChange(event) {
		const target = event.target;
		const changeElement = target.closest("[data-action-change]");
		if (changeElement) {
			const { actionChange } = changeElement.dataset;
			if (actionChange) {
				this.options.changeActions?.[actionChange]?.call(this, event, changeElement);
			}
		}
	}

	async #onInput(event) {
		const target = event.target;
		const inputElement = target.closest("[data-action-input]");
		if (inputElement) {
			const { actionInput } = inputElement.dataset;
			if (actionInput) {
				this.options.inputActions?.[actionInput]?.call(this, event, inputElement);
			}
		}
	}

	static async _updateDiceTotal(event, target) {
		const dialog = document.querySelector("#grimwild-story-roll-dialog");
		if (!dialog) return;
		const baseInput = dialog.querySelector("#storyDice");
		if (!baseInput) return;

		if (event.type === "input" && target === baseInput) {
			let value = parseInt(baseInput.value || 0, 10);
			const minAttr = baseInput.getAttribute("min");
			const min = minAttr !== null ? parseInt(minAttr, 10) : 1;
			if (!Number.isFinite(value)) value = min;
			value = Math.max(value, min);
			baseInput.value = String(value);
			baseInput.dataset.prev = String(value);
		}

		const baseValue = parseInt(baseInput.value || 0, 10);
		const sparkChecks = dialog.querySelectorAll(".sparkCheck");
		const sparkUsed = Array.from(sparkChecks).reduce((sum, checkbox) => sum + (checkbox.checked ? 1 : 0), 0);
		const total = Math.max(baseValue + sparkUsed, 0);
		const totalDisplay = dialog.querySelector("#totalDice");
		const totalValue = dialog.querySelector("#totalDiceInput");
		if (totalDisplay) totalDisplay.textContent = String(total);
		if (totalValue) totalValue.value = String(total);
	}

	static async _changeDice(event, target) {
		event.preventDefault();
		const delta = parseInt(target.dataset.delta || "0", 10);
		const dialog = document.querySelector("#grimwild-story-roll-dialog");
		if (!dialog) return;
		const input = dialog.querySelector("#storyDice");
		if (!input) return;
		const prev = parseInt(input.value || input.dataset.prev || "1", 10);
		const min = Number.isFinite(Number(input.min)) ? Number(input.min) : 1;
		const maxAttr = input.getAttribute("max");
		const max = maxAttr !== null ? Number(maxAttr) : Number.POSITIVE_INFINITY;
		const next = Math.min(Math.max(prev + delta, min), max);
		input.dataset.prev = String(prev);
		input.value = String(next);
		input.dispatchEvent(new Event("input", { bubbles: true }));
	}
}

/**
 * @typedef {object} GrimwildRollDialogOptions
 * @property {GrimwildRollDialogRollData} rollData  The data to be injected into the roll dialog
 */

/**
 * @typedef {object} GrimwildRollDialogRollData
 * @property {string} stat                          Shorthand string for the stat being rolled
 * @property {number} diceDefault                   The number of dice associated with the stat being rolled
 * @property {number} spark                         The maximum spark available to be used
 * @property {boolean} isBloodied                   If the actor is bloodied
 * @property {boolean} isRattled                    If the actor is rattled
 * @property {boolean} isMarked                     If the stat being rolled is marked
 */

/**
 * @typedef {object} GrimwildRollDialogResponse
 * @property {number} dice                          The number of dice to roll
 * @property {number} danger                        The number of danger dice to roll
 * @property {number} sparkUsed                     The number of spark used on the roll
 * @property {object} assisters                     An object with the key of the assister's name and
 *                                                  the value of the number of dice they roll
 */

/**
 * A simple wrapper around a standard DialogV2's wait method to encapsulate the specific logic needed.
 * @extends {DialogV2}
 *
 * @example Open a new roll dialog for rolling BRAWN with marked and bloodied
 * ```js
 * const dialog = await GrimwildRollDialog.open({
 *  rollData: {
 *      stat: "bra",
 *      diceDefault: 2,
 *      isBloodied: true,
 *      isRattled: false,
 *      isMarked: true
 *  }
 * });
 * const totalDice = dialog.dice;
 * const totalDanger = dialog.danger;
 * const sparkUsed = dialog.sparkUsed;
 * const assistMap = dialog.assisters;
 * ```
 */
export class GrimwildRollDialog extends foundry.applications.api.DialogV2 {
	static DEFAULT_OPTIONS = {
		...super.DEFAULT_OPTIONS,
		actions: {
			addAssist: this._addAssist
		},
		changeActions: {
			updateDice: this._updateDiceTotal,
			updateThorns: this._updateThornsTotal,
			updateDanger: this._updateDangerTotal
		},
		inputActions: {
			updateDice: this._updateDiceTotal,
			updateThorns: this._updateThornsTotal,
			updateDanger: this._updateDangerTotal
		}
	};

	/**
	 * Attach listeners to the application frame.
	 */
	_attachFrameListeners() {
		super._attachFrameListeners();
		// Attach event listeners in here to prevent duplicate calls.
		const change = this.#onChange.bind(this);
		this.element.addEventListener("change", change);
		const input = this.#onInput.bind(this);
		this.element.addEventListener("input", input);
	}

	/**
	 * Change event actions in this.options.changeActions.
	 *
	 * Functionally similar to this.options.actions and fires callbacks
	 * specified in data-action-change on the element(s).
	 *
	 * @param {ChangeEvent} event Change event that triggered the call.
	 */
	async #onChange(event) {
		const target = event.target;
		const changeElement = target.closest("[data-action-change]");
		if (changeElement) {
			const { actionChange } = changeElement.dataset;
			if (actionChange) {
				this.options.changeActions?.[actionChange]?.call(
					this,
					event,
					changeElement
				);
			}
		}
	}

	/**
	 * Input event actions in this.options.inputActions.
	 *
	 * Functionally similar to this.options.actions and fires callbacks
	 * specified in data-action-input on the element(s).
	 *
	 * @param {InputEvent} event Input event that triggered the call.
	 */
	async #onInput(event) {
		const target = event.target;
		const inputElement = target.closest("[data-action-input]");
		if (inputElement) {
			const { actionInput } = inputElement.dataset;
			if (actionInput) {
				this.options.inputActions?.[actionInput]?.call(
					this,
					event,
					inputElement
				);
			}
		}
	}

	/**
	 * Render function to set the initial dice and danger on the dialog
	 *
	 * @param {any} event           The render event for the dialog
	 * @param {any} application     Application instance.
	 */
	static _render(event, application) {
		// set first danger value (prefer Danger UI; support old Thorns UI too)
		const html = application.element;
		const checkTotal = Array.from(html.querySelectorAll(".thornCheck")).reduce((sum, checkbox) => sum + (checkbox.checked ? 1 : 0), 0);
		const numDangerInputs = html.querySelectorAll(".dangerInput");
		const numThornInputs = html.querySelectorAll(".thornInput");
		const numTotal = Array.from(numDangerInputs.length ? numDangerInputs : numThornInputs).reduce((sum, number) => sum + parseInt(number.value || 0, 10), 0);
		const dangerTotal = numTotal + checkTotal;
		const totalDangerEl = html.querySelector("#totalDanger") || html.querySelector("#totalThorns");
		const totalDangerInputEl = html.querySelector("#totalDangerInput") || html.querySelector("#totalThornsInput");
		if (totalDangerEl) totalDangerEl.textContent = String(dangerTotal);
		if (totalDangerInputEl) totalDangerInputEl.value = String(dangerTotal);

		// set first dice value
		const assists = html.querySelectorAll(".assist-value");
		const assistTotal = Array.from(assists).reduce((sum, assist) => sum + parseInt(assist.value || 0, 10), 0);
		const stat = html.querySelector("#stat");
		const statTotal = parseInt(stat.value || 0, 10);
		const edgesInput = html.querySelector("#edges");
		const edgesTotal = parseInt(edgesInput?.value || 0, 10);
		const totalDiceEl = html.querySelector("#totalDice");
		const totalDiceInputEl = html.querySelector("#totalDiceInput");
		const totalInit = assistTotal + statTotal + edgesTotal;
		if (totalDiceEl) totalDiceEl.textContent = String(totalInit);
		if (totalDiceInputEl) totalDiceInputEl.value = String(totalInit);

		// Add +/- buttons for Conditions and Difficulty (if present)
		const addBumpers = (inputId) => {
			const input = html.querySelector(`#${inputId}`);
			if (!input) return;
			const parent = input.parentElement;
			if (!parent) return;
			// Avoid duplicating controls
			if (parent.querySelector('.bumpers')) return;
			const wrap = document.createElement('div');
			wrap.classList.add('bumpers');
			wrap.style.display = 'inline-flex';
			wrap.style.gap = '.25rem';
			wrap.style.marginLeft = '.35rem';
            const mkBtn = (label, delta) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = label;
                btn.style.width = '1.6rem';
                btn.style.height = '1.6rem';
                btn.style.lineHeight = '1.6rem';
                btn.style.padding = '0';
                btn.addEventListener('click', () => {
                    const min = parseInt(input.getAttribute('min') || '0', 10);
                    const prev = parseInt(input.value || '0', 10);
                    const next = Math.max(min, prev + delta);
                    input.value = String(next);
                    // Trigger existing input pipeline to update totals
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                });
                return btn;
            };
			wrap.appendChild(mkBtn('-', -1));
			wrap.appendChild(mkBtn('+', +1));
			parent.appendChild(wrap);
		};

		addBumpers('conditions');
		addBumpers('difficulty');
		addBumpers('edges');
	}

	/**
	 * Opens a new Grimwild Roll Dialog
	 *
	 * @param {Partial<ApplicationConfiguration & DialogV2Configuration & DialogV2WaitOptions & GrimwildRollDialogOptions>} options
	 * @param {GrimwildRollDialogRollData} [options.rollData]   The roll data to be injected into the dialog content
	 * @returns {Promise<null|GrimwildRollDialogResponse>}      Resolves to either null if dismissed or an object with data to be passed
	 *                                                          to a grimwild roll.
	 */
	static async open({ rollData, ...options }={}) {
		// add some preprocessed data
		rollData.hasSpark = rollData.spark > 0;
		rollData.sparkArray = Array.from({ length: rollData.spark }, (_, i) => i);
		rollData.assistants = game.actors.filter((a) => a.type === "character" && a.name !== rollData.name).map((a) => a.name);

		options.content = await foundry.applications.handlebars.renderTemplate("systems/grimwild-action/templates/dialog/stat-roll.hbs", rollData);
		options.render = this._render;
		options.modal = true;
		options.window = { title: "Grimwild Roll" };
		options.rejectClose = false;
		options.buttons = [
			{
				label: game.i18n.localize("GRIMWILD.Dialog.Roll"),
				action: "roll",
				callback: (event, button, dialog) => {
					const assists = dialog.element.querySelectorAll(".assist-value");
					const assisters = {};
					Array.from(assists).forEach((assist) => {
						const nameInput = assist.closest(".grimwild-form-group").querySelector(".assist-name");
						const value = parseInt(assist.value || 0, 10);
						// Ignore empty assists
						if (value !== 0) {
							// Ensure there is a name to the assist
							const name = nameInput.value || "Assist";
							assisters[name] = value;
						}
					});
					const sparks = dialog.element.querySelectorAll(".sparkCheck");
					const sparkUsed = Array.from(sparks).reduce((sum, checkbox) => sum + (checkbox.checked ? 1 : 0), 0);
					const diceInput = dialog.element.querySelector("#totalDiceInput");
					const dangerInput = dialog.element.querySelector("#totalDangerInput") || dialog.element.querySelector("#totalThornsInput");
					return {
						dice: diceInput ? diceInput.value : 0,
						danger: dangerInput ? dangerInput.value : 0,
						assisters,
						sparkUsed
					};
				}
			}
		];
		return super.wait(options);
	}

	static async _addAssist(event, target) {
		// create new row
		const row = document.createElement("div");
		row.classList.add("grimwild-form-group");

		// create new name input
		const textInput = document.createElement("input");
		textInput.classList.add("assist-name");
		textInput.type = "text";
		textInput.name = "textInput[]";
		textInput.placeholder = "Name";
		textInput.setAttribute("list", "assistants-list");

		// create new dice value input
		const numberInput = document.createElement("input");
		numberInput.classList.add("assist-value");
		numberInput.type = "number";
		numberInput.name = "numberInput[]";
		numberInput.value = 1;
		numberInput.setAttribute("data-action-input", "updateDice");
		numberInput.setAttribute("data-prev", 1);

		// add inputs to row
		row.appendChild(textInput);
		row.appendChild(numberInput);

		// add row to container
		const dialog = document.querySelector("#grimwild-roll-dialog");
		dialog.querySelector("#assistContainer").appendChild(row);

		// update totals
		const totalDisplay = dialog.querySelector("#totalDice");
		const totalValue = dialog.querySelector("#totalDiceInput");
		const currentValue = parseInt(totalDisplay.textContent || 0, 10);
		totalDisplay.textContent = currentValue + 1;
		totalValue.value = currentValue + 1;
	}

	static async _updateThornsTotal(event, target) {
		const dialog = document.querySelector("#grimwild-roll-dialog");
		const totalDisplay = dialog.querySelector("#totalDanger") || dialog.querySelector("#totalThorns");
		const totalValue = dialog.querySelector("#totalDangerInput") || dialog.querySelector("#totalThornsInput");
		if (!totalDisplay || !totalValue) return;
		handleUpdate(event, target, totalDisplay, totalValue);
	}

	static async _updateDangerTotal(event, target) {
		const dialog = document.querySelector("#grimwild-roll-dialog");
		const totalDisplay = dialog.querySelector("#totalDanger");
		const totalValue = dialog.querySelector("#totalDangerInput");
		if (!totalDisplay || !totalValue) return;
		handleUpdate(event, target, totalDisplay, totalValue);
	}

	static async _updateDiceTotal(event, target) {
		const dialog = document.querySelector("#grimwild-roll-dialog");
		const totalDisplay = dialog.querySelector("#totalDice");
		const totalValue = dialog.querySelector("#totalDiceInput");
		handleUpdate(event, target, totalDisplay, totalValue);
	}
}

const handleUpdate = (event, target, totalDisplay, totalValue) => {
	const currentValue = parseInt(totalDisplay.textContent || 0, 10);
	if (event.type === "change") {
		const newValue = target.checked ? currentValue + 1 : currentValue - 1;
		totalDisplay.textContent = newValue;
		totalValue.value = newValue;
	}
	else if (event.type === "input") {
		const previousValue = parseInt(target.dataset.prev || 0, 10);
		const newValue = parseInt(target.value || 0, 10);
		const diff = newValue - previousValue;
		const newTotal = currentValue + diff;
		target.dataset.prev = newValue;
		totalDisplay.textContent = newTotal;
		totalValue.value = newTotal;
	}
};

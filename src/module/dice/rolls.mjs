export default class GrimwildRoll extends Roll {
    static CHAT_TEMPLATE = "systems/grimwild-action/templates/chat/roll-action.hbs";

    constructor(formula, data, options) {
        super(formula, data, options);
        // Do not force a global colorset; per-pool colors are applied in render.
    }

    async render({ flavor, template=this.constructor.CHAT_TEMPLATE, isPrivate=false }={}) {
        if (!this._evaluated) await this.evaluate();

        // Apply Dice So Nice per-pool colors if available
        try {
            if (game.dice3d) {
                if (this.dice?.[0]) this.dice[0].options = { ...(this.dice[0].options ?? {}), colorset: "white" };
                if (this.dice?.[1]) this.dice[1].options = { ...(this.dice[1].options ?? {}), colorset: "black" };
            }
        } catch (err) {
            console.warn("Dice color warning:", err);
        }

        // Build base chat data
        const chatData = {
            formula: isPrivate ? "???" : this._formula,
            flavor: isPrivate ? null : flavor ?? this.options.flavor,
            user: game.user.id,
            tooltip: isPrivate ? "" : await this.getTooltip(),
            total: isPrivate ? "?" : this.total,
            dice: [],
            danger: [],
            assists: {},
            crit: false,
            success: 0,
            rawSuccess: 0,
            rawResult: "",
            isCut: false,
            isPrivate: isPrivate,
            hasActions: false,
            actionDiceCount: 0,
            dangerDiceCount: this.dice[1]?.results?.length ?? 0
        };

        // Prepare raw arrays for action and danger
        const actionResults = (this.dice[0]?.results ?? []).map((d, i) => ({ result: d.result, idx: i }));
        const dangerResults = (this.dice[1]?.results ?? []).map((d, i) => ({ result: d.result, idx: i }));
        const action = actionResults.map((d) => d.result);
        const danger = dangerResults.map((d) => d.result);
        chatData.actionDiceCount = actionResults.length;
        chatData.dangerDiceCount = dangerResults.length;

        // Determine killers (danger 4-6)
        const killerIdxDanger = new Set(danger.map((v, i) => (v >= 4 ? i : null)).filter((i) => i !== null));
        const elimCount = Math.min(killerIdxDanger.size, action.length);

        // Eliminate highest action dice equal to elimCount
        const actionWithIndex = action.map((v, idx) => ({ v, idx })).sort((a, b) => b.v - a.v);
        const eliminatedActionIdx = new Set(actionWithIndex.slice(0, elimCount).map((o) => o.idx));

        const remaining = action.filter((_, idx) => !eliminatedActionIdx.has(idx));
        const highest = remaining.length ? Math.max(...remaining) : 0;

        // Boons: extra sixes beyond the chosen one
        let boons = 0;
        if (highest === 6) {
            const sixes = remaining.filter((v) => v === 6).length;
            boons = Math.max(0, sixes - 1);
        }

        // Chosen die index in original action array
        let chosenIdxInAction = -1;
        if (highest > 0) {
            for (let i = 0; i < action.length; i++) {
                if (!eliminatedActionIdx.has(i) && action[i] === highest) { chosenIdxInAction = i; break; }
            }
        }

        // Grade mapping
        let success = 0;
        if (highest >= 2 && highest <= 3) success = 0 + 1; // grim
        else if (highest >= 4 && highest <= 5) success = 0 + 1; // messy maps to 1 in successToResult
        // We'll map directly via helper below

        // Use successToResult mapping directly from highest
        const result = highestToResult(highest, boons);

        // Map result back to success scale for compatibility
        switch (result) {
            case "crit": chatData.success = 3; chatData.crit = true; break;
            case "perfect": chatData.success = 2; break;
            case "messy": chatData.success = 1; break;
            case "grim": chatData.success = 0; break;
            case "disaster": chatData.success = -1; break;
            default: chatData.success = 0; break;
        }
        chatData.rawSuccess = chatData.success;

        // Results
        chatData.result = result;
        chatData.rawResult = result;
        chatData.isCut = false;

        // Build annotated action + assists display preserving elimination/choice
        let remainingForMain = actionResults.slice();
        if (this.options?.assists) {
            for (const [name, diceNum] of Object.entries(this.options.assists)) {
                const group = remainingForMain.splice(Math.max(remainingForMain.length - diceNum, 0), diceNum);
                chatData.assists[name] = group.map((d) => ({
                    result: d.result,
                    eliminated: eliminatedActionIdx.has(d.idx),
                    chosen: d.idx === chosenIdxInAction
                }));
            }
        }
        chatData.dice = remainingForMain.map((d) => ({
            result: d.result,
            eliminated: eliminatedActionIdx.has(d.idx),
            chosen: d.idx === chosenIdxInAction
        }));

        // Annotated danger dice
        chatData.danger = dangerResults.map((d) => ({
            result: d.result,
            killer: killerIdxDanger.has(d.idx)
        }));

        // Handle actions flag
        if (chatData.result === "disaster") {
            chatData.hasActions = true;
        }

        return foundry.applications.handlebars.renderTemplate(template, chatData);
    }
}

/**
 * Set success constraints.
 *
 * @param {number} success Current success value.
 * @returns {number} Constrained success value.
 */
function setSuccessConstraint(success) {
    if (success < -1) {
        success = -1;
    }
    else if (success > 3) {
        success = 3;
    }
    return success;
}

/**
 * Convert success to result status.
 *
 * @param {number} success Success value.
 * @returns {string} Success status as a string.
 */
function successToResult(success) {
    switch (success) {
        case 3:
            return "crit";
        case 2:
            return "perfect";
        case 1:
            return "messy";
        case 0:
            return "grim";
        case -1:
            return "disaster";
        default:
            return "";
    }
}

/**
 * Map highest action die and boons to a result label
 * @param {number} highest
 * @param {number} boons
 * @returns {"disaster"|"grim"|"messy"|"perfect"|"crit"}
 */
function highestToResult(highest, boons) {
    if (highest <= 1 || highest === 0) return "disaster";
    if (highest <= 3) return "grim";
    if (highest <= 5) return "messy";
    // highest === 6
    return boons > 0 ? "crit" : "perfect";
}

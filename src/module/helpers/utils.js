/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @returns {Promise}
 */
export async function preloadHandlebarsTemplates() {

	// Define template paths to load
	const templatePaths = [
		// Actor partials
		"systems/grimwild-action/templates/actor/parts/character-header.hbs",
		"systems/grimwild-action/templates/actor/parts/monster-header.hbs",
		"systems/grimwild-action/templates/chat/roll-action.hbs"
	];

	const paths = {};
	for (const path of templatePaths) {
		paths[path.replace(".hbs", ".html")] = path;
		paths[`grimwild.${path.split("/").pop()
			.replace(".hbs", "")}`] = path;
	}

	// Load the template parts
	return foundry.applications.handlebars.loadTemplates(paths);
}

class GrimwildHandlebarsHelpers {
	static grimwildDie(die) {
		const total = Number(die);

		if (total > 5) {
			return "perfect";
		}
		else if (total > 3) {
			return "messy";
		}

		return "grim";

	}

	static grimwildDanger(die) {
		const total = Number(die);

		if (total >= 4) {
			return "cut";
		}

		return "skip";

	}
}

/**
 * Register helper functions for Handlebars.
 */
export function registerHandlebarsHelpers() {
	Handlebars.registerHelper({
		grimwildDie: GrimwildHandlebarsHelpers.grimwildDie,
		grimwildDanger: GrimwildHandlebarsHelpers.grimwildDanger
	});
}

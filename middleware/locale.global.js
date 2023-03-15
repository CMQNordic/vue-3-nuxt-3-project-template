/* Middleware that runs for EVERY navigation attempt to any page, checking slug 'locale'

The route path path MUST contain "locale" parameter as it identifies the used language.	 	
 1. If no locale exist, then we redirect to home for currently active (or default) locale.						
 2. If locale in the path is unsupported, then we redirect to home for default locale.  
 3. If locale in path is supported but not active, then we activatye it (change global language)
  	 before navigatin to the path. */
import { useLanguages } from "@/composables/useLanguages";

const { activeLocale, supportedLocales, fallbackLocale, changeLanguage } = useLanguages();
const { log } = useLogs();

export default defineNuxtRouteMiddleware(async (to, from) => {
	log.INFO(() =>
		console.log(
			`🌎 Navigation request to '${to.path}' (locale:`,
			to.params.locale ? `'${to.params.locale}')` : "missing)",
			`(active: '${activeLocale.value}')`,
			from.redirectedFrom ? `(redirected from '${from.redirectedFrom.path}')` : "",
		),
	);

	// Check if parameter 'locale' exists and if it is supported?
	if (!supportedLocales.includes(to?.params?.locale)) {
		// unsupported or missing locale. In both cases redirect to 'home'
		const redirectPath = activeLocale.value
			? "/" + activeLocale.value
			: "/" + fallbackLocale;

		log.INFO(() =>
			console.log(
				`🌎 ${to.params.locale ? "Unsupported locale." : "Missing locale."}`,
				`Redirecting to '${redirectPath}'`,
			),
		);

		// guard for recursivity
		if (to.path != redirectPath) {
			return navigateTo(redirectPath);
		}
	}

	/* SECURITY CHECK ONLY IN DEV */
	!to.params?.locale ? console.log(null.DEV_ASSERT_locale_must_exist_here) : "";

	// Check if the locale in the path is active?
	if (to.params.locale != activeLocale.value) {
		// not active, change active

		log.INFO(() =>
			console.log(
				`🌎 Locale '${to.params.locale}' is not active,`,
				`changing active language to '${to.params.locale}'`,
			),
		);

		await changeLanguage(to.params.locale);
	}

	/* DEV SECURITY CHECK */
	to.params?.locale && to.params.locale != activeLocale.value
		? console.log(null.DEV_ASSERT_at_this_point_locale_must_exist_and_be_active)
		: "";

	log.INFO(() => console.log(`🌎 Navigation to '${to?.path}' completed`));
});

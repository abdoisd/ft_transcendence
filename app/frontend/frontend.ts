
import { loginPage, homePage, notFoundPage, gameView, chatView, friendsView, settingsView, profileView } from './views.ts';

// MAPPING /URLS WITH VIEWS
var routes = {
	'/': loginPage,
	'/home': homePage,
	'/404': notFoundPage,
	'/friends': friendsView,
	'/game': gameView,
	'/chat': chatView,
	'/settings': settingsView,
	'/default': homePage,
	'/profile': profileView
};

// EVERY HREF CALL THIS
const route = (event: Event) => {
    event = event || window.event;
    event.preventDefault(); // this what make the browser don't send a request to the server

	// keep track of the user’s browsing history within the app
    window.history.pushState({}, "", event.target.href); // href don't work without this
    handleLocation();
};

// UPDATE THE ONE AND ONLY INDEX.HTML
const handleLocation = async () => {
    const path = window.location.pathname;
	type RoutePath = keyof typeof routes;

	console.log("Loading view: " + path);

	if (path == "/" || path == "/home" || path == "/default")
		document.getElementById("root")!.innerHTML = routes[path as RoutePath] || routes['/404'];
	else
		document.getElementById("main-views")!.innerHTML = routes[path as RoutePath];
};

window.onpopstate = handleLocation; // on back/forward, call handleLocation
window.route = route; // define route to use it in HTML onclick

// INDEX.HTML IS LOADED -> WE CALL THE ROUT
// this is for the first time
document.addEventListener('DOMContentLoaded', route);

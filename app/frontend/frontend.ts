
import './global.ts'; // import a file

// views
import { ProfileView } from './profile.ts';
import { HomeView } from './home.ts';

// no route for /login, we have login workflow and one login page
type RoutePath = keyof typeof routes;
export var routes = {
	'/': HomeView, // static view
	// '/friends': friendsView,
	'/profile': ProfileView,
	// '/settings': settingsView,
	// '/game': gameView,
	// '/chat': chatView
};

// for clients writing url's directly
// or for buttons/links to prevent default
// otherwise, I called it for a view, provide route(null, "/home") , it's me that called it
function route (event: Event, path?: string) {

	var pushToHistory = event == null;;

	if (path)
	{
		handleView();
		return ;
	}

	// buttons
	event = event || window.event; // window.event link event, event passed by addEventListener
	event!.preventDefault();

	if (pushToHistory)
	{
		//  new location         					   old location
		if ((new URL(event!.target!.href)).pathname != window.location.pathname)
			window.history.pushState({}, "", event!.target!.href); // add to history
	}
	handleView();
};
window.route = route;
document.addEventListener('DOMContentLoaded', route);

// this will make sure: login and home first
function handleView () {

	const path = window.location.pathname;
	// window.history.replaceState({}, "", path);

	console.log("Handling route: " + path);

	// check login
	if (!globalThis.clsGlobal.LoggedInUser)
	{
	}

	// load dome
	HomeView();

	if (path == '/') // home view is default
	{
		window.history.replaceState({}, "", "/");
		return;
	}

	routes[path as RoutePath](); // calling workflow functions
};
window.onpopstate = handleView; // on <- / ->, call handleLocation

/**
 * Attention:
 * any click to change view, must go through route()
 * if something very simple, just call workflow
 */

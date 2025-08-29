
import './global.ts'; // import a file
import { HomeView } from './views/home.ts';
import { ProfileView } from './views/profile.ts';
import { ProfileEditView } from './views/profileEdit.ts';
import { LoginWithGoogle, existingUser, NewUser } from './views/loginWithGoogle.ts';
import { User } from './Business Layer/user.ts';

type RoutePath = keyof typeof routes;
export var routes = {
	'/newUser': NewUser,
	'/existingUser': existingUser,
	// '/friends': friendsView,
	'/profile': ProfileView,
		'/profileEdit': ProfileEditView,
		// '/profile/matchHistory': ProfileMatchHistoryView,
	// '/game': gameView,
	// '/chat': chatView,
};

//?
export async function autoLogin()
{
	console.debug("autoLogin()");

	return fetch("/validateSession", {
		method: "POST",
		credentials: "include", // to send cookies
	})
	.then(response => {
		if (response.ok)
			return response.json();
		else
			return null;
	})
	.then((user) => {
		if (!user)
			clsGlobal.LoggedInUser = null;
		else
		{
			clsGlobal.LoggedInUser = Object.assign(new User(-1, "", "", "", -1, -1, null, null), user);

			console.debug("Filling User: ", clsGlobal.LoggedInUser);
		}
	});
}

// for clients writing url's directly
// or for buttons/links to prevent default
// otherwise, I called it for a view, provide route(null, "/home") , it's me that called it
function route (event: Event, path?: string) {

	console.log("route()");

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

function handleView () {

	const path = window.location.pathname;

	console.debug("Handling route: " + path);

	autoLogin()
	.then( () => {
		if (path != "/newUser" && path != "/existingUser") // tmp
		{
			// check login
			if (!globalThis.clsGlobal.LoggedInUser)
			{
				console.debug("LoggedInUser not filled");
				LoginWithGoogle(); // I can now wait it bc it's the last
				return ;
			}
			else
				console.debug("LoggedInUser filled");
		}
		// load home
		HomeView();
		if (path == '/') // home view is default
		{
			window.history.replaceState({}, "", "/");
			return;
		}
		routes[path as RoutePath](); // calling workflow functions
	});
};
window.onpopstate = handleView; // on <- / ->, call handleLocation

/**
 * Attention:
 * any click to change view, must go through route()
 * if something very simple, just call workflow
 */

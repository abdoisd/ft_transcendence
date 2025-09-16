
import './global.ts'; // import a file
// views
import { HomeView } from './views/home.ts';
import { ProfileView } from './views/profile.ts';
import { ProfileEditView } from './views/profileEdit.ts';
import { LoginWithGoogle, existingUser, NewUser } from './views/loginWithGoogle.ts';
import { friendsView, addFriendView, listFriendsView } from './views/friends.ts';
import { Settings } from './views/settings.ts';
import { GameRemoteView } from './views/gameRemote.ts';
import { GameView } from './views/game.ts';
import { Tournament } from './views/tournament.ts';

import { UserDTO } from './business layer/user.ts';

import { post } from "./views/request.ts";

type RoutePath = keyof typeof routes;
export var routes = {
	'/newUser': NewUser,
	'/existingUser': existingUser,
	'/friends': friendsView,
		'/addFriend': addFriendView,
		'/listFriends': listFriendsView,
	'/profile': ProfileView,
		'/profileEdit': ProfileEditView,
		// '/profile/matchHistory': ProfileMatchHistoryView,
	'/game': GameView,
		'/gameRemote': GameRemoteView,
		'/tournament': Tournament,
	// '/chat': chatView,
	"/settings": Settings
};

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
			clsGlobal.LoggedInUser = Object.assign(new UserDTO(-1, "", "", "", -1, -1, null, null), user);

			console.debug("Filling User: ", clsGlobal.LoggedInUser);
		}
	});
}

// for clients writing url's directly
// or for buttons/links to prevent default
// otherwise, I called it for a view, provide route(null, "/home") , it's me that called it
export function route (event: Event | null, path?: string) {

	console.log("route()");

	var pushToHistory = event == null;;

	if (path)
	{
		// should push to history ! risky to do something now
		handleView(null, path);
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

function handleView (event?, path?: string | null) {

	if (!path)
		path = window.location.pathname;
	
	console.debug("Handling route: " + path);

	autoLogin()
	.then(() => {

		if (path != "/newUser" && path != "/existingUser")
		{
			// check auto login
			if (!clsGlobal.LoggedInUser)
			{
				console.debug("LoggedInUser not filled");
				LoginWithGoogle(); // this send to me to new user or existing user
				return ;
			}
			else
				console.debug("LoggedInUser filled");
		}
		
		// if (path == "/existingUser")
		// {
		// 	// just protect frontend view
		// 	fetch("/validateSession", {
		// 		method: "POST",
		// 		credentials: "include", // to send cookies
		// 	})
		// 	.then(response => {
		// 		if (!response.ok)
		// 		{
		// 			LoginWithGoogle();
		// 			return ;
		// 		}
		// 	})
		// }

		clsGlobal.LoggedInUser?.update(); // what

		// load home
		HomeView();
		if (path == '/') // home view is default
		{
			window.history.replaceState({}, "", "/");
			return;
		}

		if (routes[path])
			routes[path]();
		else
		{
			window.history.replaceState({}, "", "/");
			HomeView();
		}
	});
};
window.onpopstate = handleView; // on <- / ->, call handleLocation

/**
 * Attention:
 * any click to change view, must go through route()
 * if something very simple, just call workflow
 */

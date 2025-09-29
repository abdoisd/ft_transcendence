
import './global.ts';
import { HomeView } from './views/home.ts';
import { ProfileView } from './views/profile.ts';
import { ProfileEditView } from './views/profileEdit.ts';
import { LoginWithGoogle, existingUser, NewUser } from './views/loginWithGoogle.ts';
import { friendsView } from './views/friends.ts';
import { Settings } from './views/settings.ts';
import { GameModesView } from './views/game.ts';
import { UserDTO } from './business layer/user.ts';
import { Chat } from './views/chat.ts';
import { GameManager } from './views/game.ts';
import { addFriendView } from './views/add_friend.ts';
import { listFriendsView } from './views/list_friends.ts';

import { aiView, three3DView, remoteView, tournamentView, apiView } from './views/game.ts'

window.gameManager = new GameManager();

type RoutePath = keyof typeof routes;
export var routes = {
	'/newUser': NewUser,
	'/existingUser': existingUser,
	'/friends': friendsView,
	'/addFriend': addFriendView,
	'/listFriends': listFriendsView,
	'/profile': ProfileView,
	'/profileEdit': ProfileEditView,
	"/settings": Settings,
	"/chat": Chat,
	'/game': GameModesView,
	"/ai-game": aiView,
	"/3d-game": three3DView,
	"/remote-game": remoteView,
	"/tournament-game": tournamentView,
	"/api-game": apiView
};

export async function autoLogin() {

	return fetch("/validateSession", {
		method: "POST",
		credentials: "include",
		headers: {
			"Authorization": `Bearer ${localStorage.getItem("jwt")}`
		}
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
		else {
			clsGlobal.LoggedInUser = Object.assign(new UserDTO(-1, "", "", "", -1, -1, null, null), user);

			if (user.jwt)
				localStorage.setItem("jwt", user.jwt);
		}
	});
}

export function route(event: Event | null, path?: string) {
	var pushToHistory = event == null;;

	if (path) {
		handleView(null, path);
		return;
	}

	event = event || window.event;

	event!.preventDefault();

	if (pushToHistory) {
		const target = event?.currentTarget!.href;
		const targetURL = new URL(target);
		const currentURL = new URL(window.location.href);

		if (
			targetURL.pathname !== currentURL.pathname ||
			targetURL.search !== currentURL.search
		)
			window.history.pushState({}, "", target);
	}
	handleView();
};
window.route = route;
document.addEventListener('DOMContentLoaded', route);


const getMainPath = (url: string): string => {
	return url.split('?')[0];
}


function handleView(event?, path?: string | null) {
	if (window.gameManager) {
		window.gameManager.leaveActiveGame();
	}

	if (!path)
		path = window.location.pathname;

	autoLogin()
		.then(async () => {

			if (path != "/newUser" && path != "/existingUser") {
				if (!clsGlobal.LoggedInUser) {
					LoginWithGoogle();
					return;
				}
			}

			await clsGlobal.LoggedInUser?.update();

			HomeView();
			if (path == '/')
			{
				window.history.replaceState({}, "", "/");
				return;
			}

			if (routes[getMainPath(path)])
				routes[path]();
			else {
				document.getElementById("body")!.innerHTML = `<div style="grid-area: main;" class="flex flex-center"><h1>Not Found</h1></div>`; //&
			}
		});
};

window.onpopstate = handleView;

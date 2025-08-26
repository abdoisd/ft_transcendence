
import { loginPage, homePage, notFoundPage, gameView, chatView, friendsView, settingsView, profileView } from './views.ts';
import { LoginWorkflow } from './login.ts';

import { clsUser } from "./classes/user.ts"; // classes

class clsGlobal {
	// static variable
	static greeting = "Hello, world!";
	static LoggedInUser: clsUser = null as any; // what
  
	// static method
	static sayHello(name) {
	  console.log(`${clsGlobal.greeting} My name is ${name}.`);
	}
}

globalThis.clsGlobal = clsGlobal;

// MAPPING /URLS WITH VIEWS
export var routes = {
	'/login': loginPage,
	'/': homePage,
	'/home': homePage,
	'/404': notFoundPage,
	'/friends': friendsView,
	'/game': gameView,
	'/chat': chatView,
	'/settings': settingsView,
	'/default': homePage,
	'/profile': profileView
};

// Fetching data from the server
function dataView() {
	// do you have to wait ?
	fetch('http://localhost:8080/api/users')
	.then(res => {
		if (!res.ok) throw new Error('Network response was not ok');
		return res.json(); // parse JSON
	})
	.then(data => {
		
		const users = data; // getting users from data object
		
		// get table body from table
		const tbody = document.getElementById("usersTable")!.getElementsByTagName("tbody")[0];
		
		for (let i = 0; i < users.length; i++) {
			
	  // create table row to hold td's
      const row = document.createElement("tr");
	  
	  // create td's and fill them with data
	  // fill the row with td's
      row.innerHTML = "<td>" + users[i].id + "</td><td>" + users[i].username + "</td><td>" + users[i].password + "</td>";
	  
	  // append row to tbody
      tbody!.appendChild(row);
    }
	})
	.catch(error => console.error('Error fetching data:', error));
}

export const route = async (event: Event | undefined, path: string) => {

	// code
	
	if (path)
	{
		window.history.pushState({}, "", path);
		await handleLocation();
		return ;
	}

	// buttons
	
	event = event || window.event;
	event!.preventDefault(); // preventDefault of <a href>

	// adds a new entry to the browser’s history without reloading the page
	window.history.pushState({}, "", event!.target!.href); // set window.location.pathname to href attribute of <a>
	await handleLocation();
};

// UPDATE THE ONE AND ONLY INDEX.HTML
export const handleLocation = async () => {

    const path = window.location.pathname;
	type RoutePath = keyof typeof routes;

	console.log("Handling route: " + path);

	// if (path == '/dataView')
	// {
	// 	dataView();
	// 	return ;
	// }

	if (!globalThis.clsGlobal.LoggedInUser)
	{
		console.log("user not logged in");
		await LoginWorkflow(); // after this, give user the view he wanted, that logic, I didn't inside, that made things complicated
		// if no cookie, login failed
	}

	if (path == "/login")
		return ;

	if (globalThis.clsGlobal.LoggedInUser)	
		console.log("user is logged in");
	else
	{
		console.log("user is NOT logged in, I think you didn't await for server response");
		return ; // for line: if no cookie, we should return here, tmp
	}

	// this changes the URL in the browser without reloading the page
	window.history.replaceState({}, "", path);

	if (path == "/" || path == "/home" || path == "/default")
		document.getElementById("root")!.innerHTML = routes[path as RoutePath] || routes['/404'];
	else
		document.getElementById("main-views")!.innerHTML = routes[path as RoutePath];
};

window.onpopstate = handleLocation; // on back/forward, call handleLocation
window.route = route; // define route to use it in HTML

// INDEX.HTML IS LOADED -> WE CALL THE ROUT
// this is for the first time
document.addEventListener('DOMContentLoaded', route);

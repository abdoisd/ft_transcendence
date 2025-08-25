
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
	'/home': homePage,
	'/404': notFoundPage,
	'/friends': friendsView,
	'/game': gameView,
	'/chat': chatView,
	'/settings': settingsView,
	'/default': homePage,
	'/profile': profileView
};

export const route = (event: Event | undefined, path: string) => {

	// code
	
	if (path)
	{
		window.history.pushState({}, "", path);
    	handleLocation();
		return ;
	}

	// buttons
	
    event = event || window.event;
    event!.preventDefault(); // preventDefault of <a href>

	// adds a new entry to the browser’s history without reloading the page
    window.history.pushState({}, "", event!.target!.href); // set window.location.pathname to href attribute of <a>
    handleLocation();
};

// Fetching data from the server
function dataView() {
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



// UPDATE THE ONE AND ONLY INDEX.HTML
export const handleLocation = () => {
    const path = window.location.pathname;
	type RoutePath = keyof typeof routes;

	console.log("Handling route: " + path);

	// if (path == '/dataView')
	// {
	// 	dataView();
	// 	return ;
	// }

	if (path == "/login")
	{
		// login work flow
		LoginWorkflow();
		return ;
	}

	if (!globalThis.clsGlobal.LoggedInUser && path != "/login")
	{
		console.log("user not logged in, redirecting to /login workflow");
		route(undefined, "/login");
		return ;
	}

	console.log("user is logged in, serving the requested view");

	// // CHECKING LOGIN
	// // in frontend !
	// if (path == "/")
	// {
	// 	// i am in the client side / client browser
	// 	// browser save a cookie for a client for a website/path
	// 	// if browser has a cookie for this website/path
	// 		// fill username and password from the cookie in code and give him /home
	// 	// else
	// 		// the user has to enter username and password manually in /login

	// 	checkAutoLogin();
		
	// 	return ;
	// }

	// this is how I handle /
	// I should check the login here in /
	if (path == "/home" || path == "/default")
	{
		// protect route here
		document.getElementById("root")!.innerHTML = routes[path as RoutePath] || routes['/404'];
	}
	else
		document.getElementById("main-views")!.innerHTML = routes[path as RoutePath];
};

window.onpopstate = handleLocation; // on back/forward, call handleLocation
window.route = route; // define route to use it in HTML onclick

// INDEX.HTML IS LOADED -> WE CALL THE ROUT
// this is for the first time
document.addEventListener('DOMContentLoaded', route);

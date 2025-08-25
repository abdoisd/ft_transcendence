
import { loginPage, homePage, notFoundPage, gameView, chatView, friendsView, settingsView, profileView } from './views.ts';

export class clsUser
{
	id: number;
	username: string;
	password: string;

	constructor(id: number, username: string, password: string)
	{
		this.id = id;
		this.username = username;
		this.password = password;
	}
}

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
var routes = {
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

// EVERY HREF CALL THIS
export const route = (event: Event) => {
    event = event || window.event;
    event.preventDefault(); // this what make the browser don't send a request to the server

	// keep track of the user’s browsing history within the app
    window.history.pushState({}, "", event.target.href); // href don't work without this
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

function checkAutoLogin()
{
	// get cookie from browser
	const cookies = document.cookie.split("; ");
	const loginCookie = cookies.find(row => row.startsWith("login=")); // value

	if (!loginCookie)
	{
		document.getElementById("root")!.innerHTML = routes["/login"];
		return ;
	}
	
	const value = decodeURIComponent(loginCookie.split("=")[1]); // decode uri
	const [username, password] = value.split(":");
	console.log("Auto login with cookie: " + username + " " + password);

	var userInForm = { username: username, password: password };

	// check login
	fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // but the server has to get it as json
        },
        body: JSON.stringify(userInForm) // body is string
    })
    .then(response => response.json())
    .then(result => {
        console.log('Server response:', result);
		if (result.success)
		{
			console.log("client-side/frontend: login success, loading home page");

			// set logged in user
			// clsGlobal.LoggedInUser = new clsUser(result.user.id, result.user.username, result.user.password);
			// clsGlobal.LoggedInUser = new clsUser(99, userInForm.username || "default username", userInForm.password || "default password");
			// console.log("user is " + clsGlobal.LoggedInUser.id, clsGlobal.LoggedInUser.username, clsGlobal.LoggedInUser.password);

			// set cookie here for user
			// data in url <=> encoding username and password
			const value = encodeURIComponent(username + ":" + password);
			document.cookie = `login=${value}`;

			window.location.pathname = '/home';
			route(); // it will take window.event
		}
    })
    .catch(error => console.error('Error:', error));
}

// UPDATE THE ONE AND ONLY INDEX.HTML
const handleLocation = async () => {
    const path = window.location.pathname;
	type RoutePath = keyof typeof routes;

	console.log("Loading view: " + path);

	if (path == '/dataView')
	{
		dataView();
		return ;
	}

	// CHECKING LOGIN
	// in frontend !
	if (path == "/")
	{
		// i am in the client side / client browser
		// browser save a cookie for a client for a website/path
		// if browser has a cookie for this website/path
			// fill username and password from the cookie in code and give him /home
		// else
			// the user has to enter username and password manually in /login

		checkAutoLogin();
		
		return ;
	}

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

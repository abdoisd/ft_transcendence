// NEW

var loginPage: string = '<h1>Login</h1><a href="/home" onclick="route()">Login</a>'; // a request /home
var homePage: string = '<h1>Home Page</h1>';

var routes = {
	'/': loginPage,
	'/home': homePage,
};

const route = (event: Event) => {
    event = event || window.event;
    event.preventDefault(); // this what make the browser don't send a request to the server
    window.history.pushState({}, "", event.target.href); // href don't work without this
    handleLocation();
};

const handleLocation = async () => {
    const path = window.location.pathname;
	type RoutePath = keyof typeof routes;
	document.getElementById("root")!.innerHTML = routes[path as RoutePath];
};

// handle navigation
window.onpopstate = handleLocation; // on back/forward, call handleLocation
window.route = route; // define route to use it in HTML onclick

// on DOMContentLoaded, we call handleLocation to update the index.html
document.addEventListener('DOMContentLoaded', route);

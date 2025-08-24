this file responsible for updating the one and only index.html

// js object: key value pairs, plain object / Object literal, not a built in js object
// with also have Map objects in js, but here we use a simple object
const routes = {
	'/': () => {
		document.getElementById('app')!.innerHTML = '<h1>Logging Page</h1><button id="About" onclick="buttonOnclickHandler()">Logging</button>';
	},
	'/home': () => {
	  document.getElementById('app')!.innerHTML = '<h1>Home Page</h1>';
	},
	'/contact': () => {
	  document.getElementById('app')!.innerHTML = '<h1>Contact Page</h1>';
	}
};
// mapping paths to functions

function router() {
	type RoutePath = keyof typeof routes; // define type for key of the js object routes
	const path = window.location.pathname;
	const route = routes[path as RoutePath] || routes['/']; // call the function value, default to home
	route();
}

// when index.html / dom is loaded, we call router that change index.html according to path
document.addEventListener('DOMContentLoaded', router);

function buttonOnclickHandler() {
	var route = routes["/home"] || routes['/'];
	route();
}

// Attach to window for HTML button usage
(window as any).buttonOnclickHandler = buttonOnclickHandler;

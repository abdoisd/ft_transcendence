// this file responsible for updating the one and only index.html

// JavaScript object
// key values
// key is the path, value is a function
const routes = {
	'/': () => {
		document.getElementById('app')!.innerHTML = '<h1>Home Page</h1><button id="About" onclick="buttonOnclickHandler()">Go to About</button>';
	},
	'/about': () => {
	  document.getElementById('app')!.innerHTML = '<h1>About Page</h1>';
	},
	'/contact': () => {
	  document.getElementById('app')!.innerHTML = '<h1>Contact Page</h1>';
	}
};
// mapping paths to functions
// calling functions according to path got by: window.location.pathname
// and we call it "routing"

function router() {
	const path = window.location.pathname;
	const route = routes[path] || routes['/']; // default to home
	route();
}

// OLD

// Run the router on page load
window.addEventListener('DOMContentLoaded', router);

function buttonOnclickHandler() {
	// modify the title of the document
	document.getElementById('app')!.innerHTML = '<h1>This is a fake About Page</h1>';

	// // make button disappear
	// document.getElementById('About')!.style.display = 'none';
}

// Attach to window for HTML button usage
(window as any).buttonOnclickHandler = buttonOnclickHandler;

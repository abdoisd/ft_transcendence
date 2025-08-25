Esbuild only includes code that is used (functions)

I served html, css and js bundle
For the first time, we have a Home Page that is displayed automatically, the frontend in the client browser that handle this, how?

**addEventListener()** method is used to attach an event handler function to an HTML element
specify a function that will be executed when a particular event occurs on the specified element
element.addEventListener(event, function, options);

# React and others

React, Angular, Vue.js

They are javascript Libraries / Frameworks, for frontend interfaces

they provide a way to populate html with data

## Library vs Framework

Library: Collection of classes / Functions
Framework:
	provides a structure and flow for your application
	You write code that fits into the framework’s structure

Example: in fastify framework, I just define what happens when a request comes:
```js
app.get('/', (req, res) => {
  res.send('Hello World!');
});
```
I don't do: request -> handle -> response

# Creating an SPA Router

## Youtube

```js
// update url
	// link default behavior
	// location changes
const route = (event) =>
{
	event = event || window.event; // capture click event for the link
    event.preventDefault(); // prevent anchor tag <a> to do it's default: navigating to the link target
    window.history.pushState({}, "", event.target.href); // update the url on the browser (it's a stack), (I think without overriding it)

	// calling handleLocation for each call to route
    handleLocation();
}
// now handling changing our location

// defining routes, path: html file location
const routes = {
    404: "/pages/404.html",
    "/": "/pages/index.html",
    "/about": "/pages/about.html",
    "/lorem": "/pages/lorem.html",
};

const handleLocation = async () => {
    const path = window.location.pathname; // get path in the browser
    const route = routes[path] || routes[404]; // get the local html file path
    const html = await fetch(route).then((data) => data.text()); // getting the html (from the server?)
    document.getElementById("main-page").innerHTML = html; // assign html string to the index.html main div
};
// then browser routing functionality and first page load

// handle forward and back browser buttons
// handle back
window.onpopstate = handleLocation;

// THIS IS THE MAIN THING, tells window how to route with <a>
window.route = route; // giving global access to our route function

// calling handleLocation on page load, to load the correct page for what ever route, the user fist lands on
handleLocation();

<!DOCTYPE html>
<html>
    <head>
        <title>Vanilla SPA Router</title>
        <meta charset="UTF-8" />
        <link rel="stylesheet" href="css/styles.css" />
        <link href="https://cdn.jsdelivr.net/npm/@mdi/font@6.5.95/css/materialdesignicons.min.css" rel="stylesheet" />
    </head>

    <body>
        <div id="root">
            <nav id="main-nav" class="sidebar">
                <a href="/" onclick="route()">Home</a> <!-- calling route onclick --->
                <a href="/about" onclick="route()">About</a>
                <a href="/lorem" onclick="route()">Lorem</a>
            </nav>
            <div id="main-page"></div>
        </div>

        <script src="js/router.js"></script>
    </body>
</html>
```

## Medium

A router solves the issue of having to make requests to the server each time users request new content by **having all the website’s content loaded on initial load**. It then dynamically displays the correct content onto the page **based on the URL’s pathname**.

content is stored in memory instead of on the server

populate div based on url pathname

```js

// dictionary
routes = {
  '/': homePage,
  '/portfolio': portfolioPage,
  '/resume': resumePage,
  '/contact': contactPage, // contactPage is a string
};

<div id="content"></div>

// we set div
let contentDiv = document.getElementById('content');
contentDiv.innerHTML = routes[window.location.pathname];

// we need to override the server’s file serving functionality to always serve our app, /index.html

```

# fetch

fetch is a built-in function in modern JavaScript used to make HTTP requests.

# pages

According to pages, from log in to home page we change `root`, in home page we change only `main`

Page Reload or Navigation refresh console

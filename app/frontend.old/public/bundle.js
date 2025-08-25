"use strict";
(() => {
  // frontend/views.ts
  var loginPage = `
<h1>Login Form</h1>
<label for="username">Username:</label>
<input type="text" id="username" name="username" required>
<br>
<label for="password">Password:</label>
<input type="password" id="password" name="password" required>
<br>
<button onclick="sendJSON()">Login</button>
`;
  function sendJSON() {
    const userInForm = {
      username: document.getElementById("username").value,
      password: document.getElementById("password").value
    };
    fetch("http://localhost:8080/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        // but the server has to get it as json
      },
      body: JSON.stringify(userInForm)
      // body is string
    }).then((response) => response.json()).then((result) => {
      console.log("Server response:", result);
      if (result.success) {
        console.log("client-side/frontend: form action: login success");
        globalThis.clsGlobal.LoggedInUser = new clsUser(99, userInForm.username || "default username", userInForm.password || "default password");
        console.log("user is " + clsGlobal.LoggedInUser.id, clsGlobal.LoggedInUser.username, clsGlobal.LoggedInUser.password);
        window.location.pathname = "/home";
        route();
      }
    }).catch((error) => console.error("Error:", error));
  }
  window.sendJSON = sendJSON;
  var homePage = `
<nav>
	Navigation:
	<a href="/default" onclick="route()">Default View</a>
	<a href="/profile" onclick="route()">Profile</a>
	<a href="/friends" onclick="route()">Friends</a>
	<a href="/settings" onclick="route()">Settings</a>
</nav>
<hr>
<main id="main-views">
	<a href="/game" onclick="route()">Play</a>
	<a href="/chat" onclick="route()">Chat</a>
	<a href="/dataView" onclick="route()">Users View</a>
	<p id="pp">data table: </p>
	<table id="usersTable" border="1">

    <thead>
      <tr>
        <th>ID</th>
        <th>UserName</th>
        <th>PassWord</th>
      </tr>
    </thead>

    <tbody>
      <!-- Rows will be populated here -->
    </tbody>
  </table>
</main>
<hr>
<footer>
2025 \u2014 ft_transcendence Inc.
</footer>
`;
  var notFoundPage = '<h1>404 Not Found</h1><a href="/home" onclick="route()">Go to Home</a>';
  var friendsView = `<p>Friends View</p>`;
  var gameView = `<p>Game View</p>`;
  var chatView = `<p>Chat View</p>`;
  var settingsView = `<p>Settings View</p>`;
  var profileView = `<p>Profile View</p>`;

  // frontend/frontend.ts
  var clsUser = class {
    id;
    username;
    password;
    constructor(id, username, password) {
      this.id = id;
      this.username = username;
      this.password = password;
    }
  };
  var clsGlobal2 = class _clsGlobal {
    // static variable
    static greeting = "Hello, world!";
    static LoggedInUser = null;
    // what
    // static method
    static sayHello(name) {
      console.log(`${_clsGlobal.greeting} My name is ${name}.`);
    }
  };
  globalThis.clsGlobal = clsGlobal2;
  var routes = {
    "/login": loginPage,
    "/home": homePage,
    "/404": notFoundPage,
    "/friends": friendsView,
    "/game": gameView,
    "/chat": chatView,
    "/settings": settingsView,
    "/default": homePage,
    "/profile": profileView
  };
  var route = (event) => {
    event = event || window.event;
    event.preventDefault();
    window.history.pushState({}, "", event.target.href);
    handleLocation();
  };
  function dataView() {
    fetch("http://localhost:8080/api/users").then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    }).then((data) => {
      const users = data;
      const tbody = document.getElementById("usersTable").getElementsByTagName("tbody")[0];
      for (let i = 0; i < users.length; i++) {
        const row = document.createElement("tr");
        row.innerHTML = "<td>" + users[i].id + "</td><td>" + users[i].username + "</td><td>" + users[i].password + "</td>";
        tbody.appendChild(row);
      }
    }).catch((error) => console.error("Error fetching data:", error));
  }
  function checkAutoLogin() {
    const cookies = document.cookie.split("; ");
    const loginCookie = cookies.find((row) => row.startsWith("login="));
    if (!loginCookie) {
      document.getElementById("root").innerHTML = routes["/login"];
      return;
    }
    const value = decodeURIComponent(loginCookie.split("=")[1]);
    const [username, password] = value.split(":");
    console.log("Auto login with cookie: " + username + " " + password);
    var userInForm = { username, password };
    fetch("http://localhost:8080/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        // but the server has to get it as json
      },
      body: JSON.stringify(userInForm)
      // body is string
    }).then((response) => response.json()).then((result) => {
      console.log("Server response:", result);
      if (result.success) {
        console.log("client-side/frontend: login success, loading home page");
        const value2 = encodeURIComponent(username + ":" + password);
        document.cookie = `login=${value2}`;
        window.location.pathname = "/home";
        route();
      }
    }).catch((error) => console.error("Error:", error));
  }
  var handleLocation = async () => {
    const path = window.location.pathname;
    console.log("Loading view: " + path);
    if (path == "/dataView") {
      dataView();
      return;
    }
    if (path == "/") {
      checkAutoLogin();
      return;
    }
    if (path == "/home" || path == "/default") {
      document.getElementById("root").innerHTML = routes[path] || routes["/404"];
    } else
      document.getElementById("main-views").innerHTML = routes[path];
  };
  window.onpopstate = handleLocation;
  window.route = route;
  document.addEventListener("DOMContentLoaded", route);
})();

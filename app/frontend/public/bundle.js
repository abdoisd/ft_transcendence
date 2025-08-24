(() => {
  // frontend/frontend.ts
  var routes = {
    "/": () => {
      document.getElementById("app").innerHTML = '<h1>Home Page</h1><button id="About" onclick="buttonOnclickHandler()">Go to About</button>';
    },
    "/about": () => {
      document.getElementById("app").innerHTML = "<h1>About Page</h1>";
    },
    "/contact": () => {
      document.getElementById("app").innerHTML = "<h1>Contact Page</h1>";
    }
  };
  function router() {
    const path = window.location.pathname;
    const route = routes[path] || routes["/"];
    route();
  }
  window.addEventListener("DOMContentLoaded", router);
  function buttonOnclickHandler() {
    document.getElementById("app").innerHTML = "<h1>This is a fake About Page</h1>";
  }
  window.buttonOnclickHandler = buttonOnclickHandler;
})();

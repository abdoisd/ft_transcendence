import { routes, route } from "./frontend.ts";
import { clsUser } from "./classes/user.ts";

// login workflow

// return true if login was successful
// else false
export async function LoginWorkflow() {

	window.history.pushState({}, "", "/login");

    // get cookie from browser
    const cookies = document.cookie.split("; ");
    const loginCookie = cookies.find(row => row.startsWith("login="));

    if (!loginCookie) {
        console.log("No cookie, showing login view");
        document.getElementById("root")!.innerHTML = routes["/login"];
        // user will fill the form, cookie will be set
        return;
    }

    // yes cookie -> auto login
    const value = decodeURIComponent(loginCookie.split("=")[1]);
    const [username, password] = value.split(":");
    console.log("Auto login with cookie: " + username + " " + password);

    const userFromCookie = { username, password };

    try {
        const response = await fetch('http://localhost:8080/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userFromCookie)
        });

        const result = await response.json();
        console.log('Server response:', result);

        if (result.success) {
            // set logged in user
            globalThis.clsGlobal.LoggedInUser = new clsUser(
                99,
                userFromCookie.username || "default username",
                userFromCookie.password || "default password"
            );
            console.log("Now user is set:", globalThis.clsGlobal.LoggedInUser);

            // set cookie
            const cookieValue = encodeURIComponent(username + ":" + password);
            document.cookie = `login=${cookieValue}`;

            // don't have to be here, to route when ever we want
            route(undefined, "/home");
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

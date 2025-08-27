// this shouldn't call presentation layer

import { clsUser } from "../classes/user.ts";

// return true if auto login was successful
// else false, and you have to show login view
export async function LoginWorkflow(): Promise<boolean> {

	window.history.pushState({}, "", "/login");

    // get cookie from browser
    const cookies = document.cookie.split("; ");
    const loginCookie = cookies.find(row => row.startsWith("login="));

    if (!loginCookie) {
        console.log("No cookie, showing login view");
        // document.getElementById("root")!.innerHTML = routes["/login"];
        // user will fill the form, cookie will be set
        return false;
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

			return true;
        }
		else
		    return false;
    } catch (error) {
        console.error('Error:', error);
		return false;
    }
}

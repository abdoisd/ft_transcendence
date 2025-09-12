import { HomeView } from "./home";
import { getOnlyFetch } from "./request";

export function	TwoFAView()
{
	document.getElementById("body")!.innerHTML = TwoFAViewStaticPart;
}

const TwoFAViewStaticPart = `
<div style="grid-column: 1 / -1; grid-row: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
	<h1>You Enabled 2FA</h1><br>
	<form id="twofa-form" onsubmit="validate2faCode(event)">
		<input type="text" id="twofa-code" name="twofa-code" required placeholder="Enter your 2FA code">
		<button type="submit">Submit</button>
	</form>
</div>
`

function	validate2faCode(event)
{
	event.preventDefault();

	getOnlyFetch("/auth/2fa/verify", {Id: clsGlobal.userId, code: (document.getElementById("twofa-code") as HTMLInputElement).value})
	.then(response => {
		if (response.ok)
			return response.json();
		else
			return null;
	})
	.then(data => {
		if (data)
		{
			localStorage.setItem("jwt", data.jwt); // now access granted from server
			console.debug("setting jwt: ", data.jwt);
			
			clsGlobal.LoggedInUser = data.user;
			console.debug("setting clsGlobal.LoggedInUser: ", clsGlobal.LoggedInUser);
			
			HomeView();
		}
		else
		{
			alert("Invalid code, please try again.");
		}
	});
}
window.validate2faCode = validate2faCode;

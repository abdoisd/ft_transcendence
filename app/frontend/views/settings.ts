import { getOnlyFetch, get } from './request.ts';

export async function Settings()
{
	document.getElementById("main-views")!.innerHTML = settingsViewStaticPart;
	
	getOnlyFetch('/auth/2fa', { Id: clsGlobal.LoggedInUser.Id })
	.then(async (response) => {
		return response.json();
	})
	.then((data) => {
		console.log("data:", data);

		const qrCodeElement = document.getElementById("qrcode") as HTMLImageElement;
		qrCodeElement.src = data.qrCode;
		
		return data.qrCode;
	})
	.catch(err => console.error("Error:", err));
}

const settingsViewStaticPart = `
	<h1>Enable 2FA</h1>
	<img id="qrcode" src="" style="margin: 10px 0px;" />
	<form onsubmit="verify(event);"> <!-- verify code -->
		<input type="text" id="2fa-code" placeholder="Enter code from app" required />
		<input type="submit" value="Enable">
	</form>
	<span id="result"></span>
`;

async function verify(event)
{
	event.preventDefault();

	const code = (document.getElementById("2fa-code") as HTMLInputElement).value;
	// send server to verify
	const response = await getOnlyFetch("/auth/2fa/enable", { code: code, Id: clsGlobal.LoggedInUser.Id });
	if (response.ok)
	{
		document.getElementById("result")!.innerText = "2FA Enabled Successfully";
		const data = await response.json();
		localStorage.setItem("jwt", data.jwt); // update jwt with new one
	}
	else
		document.getElementById("result")!.innerText = "invalid";
	
}
window.verify = verify;

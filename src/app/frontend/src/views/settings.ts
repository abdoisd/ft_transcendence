import { getOnlyFetch, get } from './request.ts';

export async function Settings()
{
	document.getElementById("main-views")!.innerHTML = settingsViewStaticPart;
	
	getOnlyFetch('/auth/2fa', { Id: clsGlobal.LoggedInUser.Id })
	.then(async (response) => {
		return response.json();
	})
	.then((data) => {

		const qrCodeElement = document.getElementById("qrcode") as HTMLImageElement;
		qrCodeElement.src = data.qrCode;
		
		return data.qrCode;
	})
	.catch(err => console.error("Error:", err));
}

const settingsViewStaticPart = `
	<div class="card flex column flex-center">
		<h2>Enable 2FA</h2>
		<img id="qrcode" src="" class="mv-5" />
		<form onsubmit="verify(event);" class="input flex"> <!-- verify code -->
			<input id="input" type="text" class="pl-3" placeholder="Enter code from App" required />
			<button clsas="btn btn-primary">Enable</button>
		</form>
		<span id="result"></span>
	</div>
`;

async function verify(event)
{
	event.preventDefault();

	const code = (document.getElementById("2fa-code") as HTMLInputElement).value;
	const response = await getOnlyFetch("/auth/2fa/enable", { code: code, Id: clsGlobal.LoggedInUser.Id });
	if (response.ok)
	{
		document.getElementById("result")!.innerText = "2FA Enabled Successfully";
		const data = await response.json();
		localStorage.setItem("jwt", data.jwt);
	}
	else
		document.getElementById("result")!.innerText = "invalid";
	
}
window.verify = verify;

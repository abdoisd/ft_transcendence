export function ProfileView()
{
	// fetch user data from server

	// insert data in profile view static html

	// replaces main-views with friends profile view
	document.getElementById("main-views")!.innerHTML = profileViewStaticPart;
}

window.Profile = ProfileView;

const profileViewStaticPart = `
username:
<br>
avatar:
<br>
wins:
<br>
losses:
<br>
<button>Edit</button>
<br>
<button>Match History</button>
<br>
`;

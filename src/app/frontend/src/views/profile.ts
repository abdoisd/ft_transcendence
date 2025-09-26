import { UserDTO } from "../business layer/user.ts";
import { getQuery } from "../utils/utils.ts";

export async function ProfileView() {

	const id = getQuery("id");

	const user: UserDTO | null = !id ? clsGlobal.LoggedInUser : await UserDTO.getById(id);
	const mainView = document.getElementById("main-views")!;

	if (user) {
		const isMe = user.Id === clsGlobal.LoggedInUser?.Id;

		mainView.innerHTML = isMe ? meProfileViewStaticPart : profileViewStaticPart;

		document.getElementById("Avatar")!.src = "/data/user/getAvatarById?Id=" + user.Id;
		document.getElementById("Username")!.textContent = user.Username;
		document.getElementById("Wins")!.textContent = user.Wins.toString();
		document.getElementById("Losses")!.textContent = user.Losses.toString();

		const container = document.getElementById("Histories")!;

		const matches = await user.getMatchHistory();

		if (!matches) {
			container.textContent = "Error while fetching match history.";
			container.style.color = "red";
			return;
		}

		if (matches.length == 0) {
			container.textContent = "No matches played yet.";
			container.style.color = "green";
			return;
		}
		console.table(matches);

		for (const match of matches) {
			const recordDiv = document.createElement("div");

			recordDiv.classList.add("item", "flex", "center");


			if (match.User2Id == null) {
				const lost = match.WinnerId == "AI";
				recordDiv.innerHTML = `
					<div class="flex-1">
						<h6 class="mb-1 title-medium">Player #${user.Username} VS AI</h6>

						<span class="text-secondary">${formatEpochMillis(match.Date)}</span>
					</div>

					<h6 class="${lost ? "danger-text" : "success-text"}">${lost ? "Loss" : "Win"}</h6>
				`
			}
			else {
				const user1 = await UserDTO.getById(match.User1Id);
				const user2 = await UserDTO.getById(match.User2Id);

				if (!user1 || !user2)
					return;

				const isWin = match.WinnerId === user?.Id;

				recordDiv.innerHTML = `
					<div class="flex-1">
						<h6 class="mb-1 title-medium">Player #${user.Username} VS Player #${user.Username == user1.Username ? user2.Username : user1.Username}</h6>

						<span class="text-secondary">${formatEpochMillis(match.Date)}</span>
					</div>

					<h6 class="${!isWin ? "danger-text" : "success-text"}">${!isWin ? "Loss" : "Win"}</h6>
				`
			}
			container.appendChild(recordDiv);
		}

	}
	else {
		console.debug("No logged in user found!");
		mainView.innerHTML = '<h4>User not found</h4>'
	}
}

function formatEpochMillis(epochMillis): string {
	const date = new Date(Number(epochMillis));

	const defaultOptions: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	};

	return date.toLocaleString("en-MA", defaultOptions);
}


const profileViewStaticPart = `
	<div class="card center">
	<img id="Avatar" src="" class="avatar" alt="avatar">

	<div class="mt-5">
		<h4 id="Username"></h4>
	</div>

	<div class="w-full mt-6">
		<h6 class="mb-3">Player Stats</h6>
		<div class="cards flex gap-large">
			<div class="flex-1 item item-center">
				<h2 id="Wins" class="success-text mb-1"></h2>
				<span class="text-secondary">Wins</span>
			</div>
			<div class="flex-1 item item-center">
				<h2 id="Losses" class="danger-text mb-1"></h2>
				<span class="text-secondary">Losses</span>
			</div>
		</div>
	</div>

	<div class="w-full mt-6">
	<h6 class="mb-3">Match History</h6>
		<div class="cards flex gap-large column" id="Histories">
			
		</div>
	</div>

	</div>
`;


const meProfileViewStaticPart = `
	<div class="card center">
		<a class="relative" href="/profileEdit" onclick="route()" id="edit">
			<img id="Avatar" src="" class="avatar" alt="avatar">

			<svg class="absolute bottom-right" xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24">
				<path d="M16.19 2H7.81C4.17 2 2 4.17 2 7.81V16.18C2 19.83 4.17 22 7.81 22H16.18C19.82 22 21.99 19.83 21.99 16.19V7.81C22 4.17 19.83 2 16.19 2ZM10.95 17.51C10.66 17.8 10.11 18.08 9.71 18.14L7.25 18.49C7.16 18.5 7.07 18.51 6.98 18.51C6.57 18.51 6.19 18.37 5.92 18.1C5.59 17.77 5.45 17.29 5.53 16.76L5.88 14.3C5.94 13.89 6.21 13.35 6.51 13.06L10.97 8.6C11.05 8.81 11.13 9.02 11.24 9.26C11.34 9.47 11.45 9.69 11.57 9.89C11.67 10.06 11.78 10.22 11.87 10.34C11.98 10.51 12.11 10.67 12.19 10.76C12.24 10.83 12.28 10.88 12.3 10.9C12.55 11.2 12.84 11.48 13.09 11.69C13.16 11.76 13.2 11.8 13.22 11.81C13.37 11.93 13.52 12.05 13.65 12.14C13.81 12.26 13.97 12.37 14.14 12.46C14.34 12.58 14.56 12.69 14.78 12.8C15.01 12.9 15.22 12.99 15.43 13.06L10.95 17.51ZM17.37 11.09L16.45 12.02C16.39 12.08 16.31 12.11 16.23 12.11C16.2 12.11 16.16 12.11 16.14 12.1C14.11 11.52 12.49 9.9 11.91 7.87C11.88 7.76 11.91 7.64 11.99 7.57L12.92 6.64C14.44 5.12 15.89 5.15 17.38 6.64C18.14 7.4 18.51 8.13 18.51 8.89C18.5 9.61 18.13 10.33 17.37 11.09Z" />
			</svg>
		</a>

		<div class="mt-5">
			<h4 id="Username"></h4>
		</div>

		<div class="w-full mt-6">
			<h6 class="mb-3">Player Stats</h6>
			<div class="cards flex gap-large">
				<div class="flex-1 item item-center">
					<h2 id="Wins" class="success-text mb-1"></h2>
					<span class="text-secondary">Wins</span>
				</div>
				<div class="flex-1 item item-center">
					<h2 id="Losses" class="danger-text mb-1"></h2>
					<span class="text-secondary">Losses</span>
				</div>
			</div>
		</div>

		<div class="w-full mt-6">
		<h6 class="mb-3">Match History</h6>
			<div class="cards flex gap-large column" id="Histories">
				
			</div>
		</div>
		
	</div>
`;

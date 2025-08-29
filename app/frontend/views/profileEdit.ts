
export function ProfileEditView()
{
	document.getElementById("main-views")!.innerHTML = profileEditViewStaticPart;
}

function EditUser(event: Event)
{
	// curr logged in user

	event.preventDefault();

	console.log((document.getElementById("username") as HTMLInputElement).value);
	console.log((document.getElementById("avatar") as HTMLInputElement).files![0]);

	// to read file content
	// const reader = new FileReader();
	// reader.onload = function(e) {
	// 	console.log("File content as data URL:", e.target.result);
	// };
	// reader.readAsDataURL((document.getElementById("avatar") as HTMLInputElement).files![0]);
}

window.EditUser = EditUser;

const profileEditViewStaticPart = `
<form id="edit-profile-form" onsubmit="EditUser(event)">

  <label>
    Username:
    <input type="text" id="username" name="username" required>
  </label>
  <br>

  Avatar: <img id="Avatar" src="man.png" style="width: 100px; height: auto;" alt="avatar"><br>
  <label>
    <input type="file" id="avatar" name="avatar" accept="image/*">
  </label>
  <br>

  <button type="submit">Save</button>
</form>
`;

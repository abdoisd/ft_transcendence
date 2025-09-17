(() => {
  // global.ts
  var ClsGlobal = class {
    static greeting = "Hello, world!";
    static LoggedInUser = null;
    static userId;
    // for 2fa
  };
  globalThis.clsGlobal = ClsGlobal;

  // views/home.ts
  function HomeView() {
    document.getElementById("body").innerHTML = HomeViewStaticPart;
  }
  var HomeViewStaticPart = `
<nav style="grid-area: nav;">
	<a class="flex-item nav-anchor" href="/" onclick="route()">home</a>
	<a class="flex-item nav-anchor" href="/friends" onclick="route()">friends</a>
	<a class="flex-item nav-anchor" href="/profile" onclick="route()">profile</a>
	<a class="flex-item nav-anchor" href="/settings" onclick="route()">settings</a>
</nav>
<main id="main-views" style="grid-area: main; display: flex; flex-direction: column; align-items: center;">
	<a class="main-anchor" href="/game" onclick="route()">play</a>
	<a class="main-anchor chat" href="/chat" onclick="route()">chat</a>

	<a>Join a tournament</a>

</main>
<footer style="grid-area: footer;">
	2025 \u2014 ft_transcendence Inc.
</footer>
`;

  // views/request.ts
  async function get(path, params = {}) {
    const jwt = localStorage.getItem("jwt");
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${path}?${queryString}` : path;
    return fetch(url, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + jwt
      }
    }).then((response) => {
      if (response.ok)
        return response.json();
      else
        return null;
    });
  }
  async function getOnlyFetch(path, params = {}) {
    const jwt = localStorage.getItem("jwt");
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${path}?${queryString}` : path;
    return fetch(url, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + jwt
      }
    });
  }
  async function post(path, obj) {
    const jwt = localStorage.getItem("jwt");
    return fetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + jwt
      },
      body: JSON.stringify(obj)
    });
  }

  // business layer/user.ts
  var UserDTO = class _UserDTO {
    Id;
    // GoogleId: string;
    Username;
    AvatarPath;
    Wins;
    Losses;
    // SessionId: string | null;
    // ExpirationDate: Date | null;
    LastActivity;
    constructor(id, googleOpenID, username, avatarPath, wins, losses, sessionId = null, expirationDate = null) {
      this.Id = id;
      this.Username = username;
      this.AvatarPath = avatarPath;
      this.Wins = wins;
      this.Losses = losses;
    }
    static async getAllUsers() {
      const response = await fetch("data/user/getAll");
      if (!response.ok) {
        return [];
      }
      const usersArray = await response.json();
      const users = usersArray.map((userObject) => Object.assign(new _UserDTO(-1, "", "", "", -1, -1), userObject));
      return users;
    }
    static async getById(Id) {
      return get("/data/user/getById", { Id });
    }
    static async getByUsername(username) {
      const tmp = username;
      return await get("/data/user/getByUsername", { username: tmp });
    }
    // async add(): Promise<boolean> {
    //     const response = await fetch(`/data/user/add`, {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(this),
    //     });
    //     if (!response.ok) return false;
    //     this.Id = (await response.json()).Id;
    // 	return true;
    // }
    async update() {
      console.debug("UserDTO.update");
      if (this.Id < 0)
        return false;
      const response = await fetch(`/data/user/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("jwt")}`
        },
        body: JSON.stringify(this)
      });
      return response.ok;
    }
    async delete() {
      if (this.Id < 0)
        return false;
      const response = await fetch(`/data/user/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Id: this.Id })
      });
      return response.ok;
    }
    getFriends() {
      return get("data/user/getFriends", { Id: this.Id }).then((friendsArray) => {
        if (friendsArray)
          return friendsArray;
        return [];
      });
    }
    //?
    getMatchHistory() {
      return get("/users/" + this.Id + "/games");
    }
  };

  // views/profile.ts
  async function ProfileView() {
    document.getElementById("main-views").innerHTML = profileViewStaticPart;
    const user = clsGlobal.LoggedInUser;
    if (user) {
      document.getElementById("Username").textContent = user.Username;
      document.getElementById("Avatar").src = "/data/user/getAvatarById?Id=" + user.Id + "&_=" + (/* @__PURE__ */ new Date()).getTime();
      document.getElementById("Wins").textContent = user.Wins.toString();
      document.getElementById("Losses").textContent = user.Losses.toString();
      const container = document.querySelector(".match-history");
      const matches = await user.getMatchHistory();
      matches.forEach(async (match) => {
        const recordDiv = document.createElement("div");
        const user1 = await UserDTO.getById(match.User1Id);
        const user2 = await UserDTO.getById(match.User2Id);
        const winnerUsername = match.WinnerId === user1?.Id ? user1?.Username : user2?.Username;
        recordDiv.textContent = `${clsGlobal.LoggedInUser.Username} vs ${clsGlobal.LoggedInUser.Username == user1.Username ? user2.Username : user1.Username} \u2192 ${winnerUsername}`;
        container.appendChild(recordDiv);
      });
    } else
      console.debug("No logged in user found!");
  }
  var profileViewStaticPart = `
<div><span id="Username" style="margin-right: 10px;"></span><a href="/profileEdit" onclick="route()">Edit</a></div>
<img id="Avatar" src="" style="width: 100px; height: auto;" alt="avatar">
<div>Wins: <span id="Wins"></span></div>
<div>Losses: <span id="Losses"></span></div>
<p>Match history:</p>
<div class="match-history">
</div>
`;

  // views/profileEdit.ts
  function ProfileEditView() {
    document.getElementById("main-views").innerHTML = profileEditViewStaticPart;
  }
  async function EditUser(event) {
    event.preventDefault();
    const usernameElement = document.getElementById("username");
    const username = usernameElement.value;
    const errorSpan = document.getElementById("username-error");
    const avatarElement = document.getElementById("avatar");
    if ((!username || username == "") && (!avatarElement.files || avatarElement.files.length == 0)) {
      alert("Nothing to update");
      return;
    }
    if (username && username != "") {
      const user = await UserDTO.getByUsername(username);
      if (user) {
        errorSpan.textContent = "Username is already taken!";
        errorSpan.style.display = "inline";
        return;
      }
    }
    const formData = new FormData();
    if (avatarElement.files && avatarElement.files.length > 0) {
      console.debug("Avatar file selected");
      formData.append("avatar", avatarElement.files[0]);
    }
    if (username && username != "")
      formData.append("username", username);
    const jwt = localStorage.getItem("jwt");
    return fetch("/updateProfile/" + clsGlobal.LoggedInUser.Id.toString(), {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + jwt
      },
      body: formData
    }).then(async (response) => {
      if (response.ok) {
        const user = await UserDTO.getById(Number(globalThis.clsGlobal.LoggedInUser.Id));
        globalThis.clsGlobal.LoggedInUser = user;
        route(null, "/profile");
      } else
        alert("Error uploading profile. Invalid input.");
    });
  }
  window.EditUser = EditUser;
  var profileEditViewStaticPart = `
<form id="edit-profile-form" onsubmit="EditUser(event)">

  <label>
    Username:
    <input type="text" id="username" name="username">
  </label>
  <span id="username-error" style="color: red; display: none;"></span>
  <br>

  <label>
    Avatar: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <input type="file" id="avatar" name="avatar" accept="image/*">
  </label>
  <br>

  <button type="submit">Save</button>
</form>
`;

  // views/2fa.ts
  function TwoFAView() {
    document.getElementById("body").innerHTML = TwoFAViewStaticPart;
  }
  var TwoFAViewStaticPart = `
<div style="grid-column: 1 / -1; grid-row: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center;">
	<h1>You Enabled 2FA</h1><br>
	<form id="twofa-form" onsubmit="validate2faCode(event)">
		<input type="text" id="twofa-code" name="twofa-code" required placeholder="Enter your 2FA code">
		<button type="submit">Submit</button>
	</form>
</div>
`;
  function validate2faCode(event) {
    event.preventDefault();
    getOnlyFetch("/auth/2fa/verify", { Id: clsGlobal.userId, code: document.getElementById("twofa-code").value }).then((response) => {
      if (response.ok)
        return response.json();
      else
        return null;
    }).then((data) => {
      if (data) {
        localStorage.setItem("jwt", data.jwt);
        console.debug("setting jwt: ", data.jwt);
        clsGlobal.LoggedInUser = data.user;
        console.debug("setting clsGlobal.LoggedInUser: ", clsGlobal.LoggedInUser);
        HomeView();
      } else {
        alert("Invalid code, please try again.");
      }
    });
  }
  window.validate2faCode = validate2faCode;

  // views/loginWithGoogle.ts
  function LoginWithGoogle() {
    window.history.replaceState({}, "", "/login");
    document.getElementById("body").innerHTML = profileViewStaticPart2;
  }
  function requestBackend() {
    window.location.pathname = "/loginGoogle";
  }
  function NewUser() {
    const params = new URLSearchParams(window.location.search);
    getOnlyFetch("/data/user/getById", { Id: params.get("Id") }).then((response) => {
      if (!response.ok) {
        fetch("/validateSession", {
          method: "POST",
          credentials: "include"
          // to send cookies
        }).then((response2) => {
          if (!response2.ok) {
            LoginWithGoogle();
            return;
          } else {
            window.history.replaceState({}, "", "/");
            HomeView();
            return;
          }
        });
      }
    });
    const jwt = params.get("jwt");
    console.debug("setting jwt in localStorage: ", jwt);
    localStorage.setItem("jwt", jwt);
    console.debug("jwt in localStorage: ", localStorage.getItem("jwt"));
    document.getElementById("body").innerHTML = usernameAvatarForm;
  }
  async function existingUser() {
    console.debug("existingUser()");
    const params = new URLSearchParams(window.location.search);
    if (!params.has("Id")) {
      LoginWithGoogle();
      return;
    }
    const userId = Number(params.get("Id"));
    const response = await getOnlyFetch("/data/user/enabled2FA", { Id: userId });
    if (response.ok) {
      console.debug("User has 2FA enabled, showing 2FA form");
      clsGlobal.userId = userId;
      TwoFAView();
      return;
    } else
      console.debug("User has NOT 2FA enabled, access grant");
    const jwt = params.get("jwt");
    console.debug("setting jwt in localStorage: ", jwt);
    localStorage.setItem("jwt", jwt);
    console.debug("Filling loggedInUser");
    globalThis.clsGlobal.LoggedInUser = new UserDTO(
      Number(params.get("Id")),
      params.get("GoogleId") || "",
      params.get("Username") || null,
      params.get("AvatarPath") || null,
      Number(params.get("Wins") || 0),
      Number(params.get("Losses") || 0),
      params.get("SessionId") || null,
      params.get("ExpirationDate") ? new Date(params.get("ExpirationDate")) : null
    );
    window.history.replaceState({}, "", "/");
    HomeView();
  }
  async function usernameAvatarFormHandleSubmit(event) {
    event.preventDefault();
    console.debug("usernameAvatarFormHandleSubmit()");
    const usernameElement = document.getElementById("username");
    const avatarElement = document.getElementById("avatar");
    const user = await UserDTO.getByUsername(usernameElement.value);
    if (user) {
      console.debug("Username taken");
      const errorSpan = document.getElementById("username-error");
      errorSpan.textContent = "Username is already taken!";
      errorSpan.style.display = "inline";
      return;
    } else {
      console.debug("Username not taken");
      const formData = new FormData();
      if (avatarElement.files && avatarElement.files.length > 0) {
        console.debug("Avatar file selected");
        formData.append("avatar", avatarElement.files[0]);
      }
      const username = usernameElement.value;
      formData.append("username", username);
      const Id = new URLSearchParams(window.location.search).get("Id");
      formData.append("Id", Id);
      fetch("/uploadProfile", {
        method: "POST",
        body: formData,
        // body as object? not string
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwt")}`
        }
      }).then(async (response) => {
        if (response.ok) {
          console.debug("Filling loggedInUser");
          const user2 = await UserDTO.getById(Number(Id));
          globalThis.clsGlobal.LoggedInUser = user2;
          window.history.replaceState({}, "", "/");
          HomeView();
        } else
          document.write("Error uploading profile. Please try again.");
      }).catch((error) => {
        console.error("Upload error:", error);
      });
    }
  }
  window.requestBackend = requestBackend;
  window.usernameAvatarFormHandleSubmit = usernameAvatarFormHandleSubmit;
  var profileViewStaticPart2 = `
<div style="grid-column: 1 / -1; grid-row: 1 / -1; display: flex; align-items: center; justify-content: center;">
	<button id="myButton" onclick="requestBackend()">Login With Google</button>
</div>
`;
  var usernameAvatarForm = `
<form id="edit-profile-form" style="color: white; grid-column: 1 / -1; grid-row: 1 / -1; display: flex; flex-direction: column; align-items: center; justify-content: center;" onsubmit="usernameAvatarFormHandleSubmit(event)">
<h1>Continue profile:</h1>
<br>
  <label>
    Username:
    <input type="text" id="username" name="username" required>
  </label>
  <span id="username-error" style="color: red; display: none;"></span>
  <br><br>
  <label>
    Avatar:
    <input type="file" id="avatar" name="avatar" accept="image/*">
  </label>
  <br><br>
  <button type="submit">Submit</button>
</form>
`;

  // business layer/relationship.ts
  var Relationship = class {
    Id;
    User1Id;
    User2Id;
    Relationship;
    constructor(Id, User1Id, User2Id, Relationship2) {
      this.Id = Id ?? -1;
      this.User1Id = User1Id ?? -1;
      this.User2Id = User2Id ?? -1;
      this.Relationship = Relationship2 ?? -1;
    }
    async add() {
      return post("/data/relationship/add", this);
    }
  };

  // views/friends.ts
  function friendsView() {
    document.getElementById("main-views").innerHTML = friendsViewStaticPart;
  }
  var friendsViewStaticPart = `
<p>Friends View:</p>
<a href="/addFriend" onclick="route()">Add Friend</a>
<br>
<a href="/listFriends" onclick="route()">List Friends</a>
`;
  function addFriendView() {
    document.getElementById("main-views").innerHTML = addFriendViewStaticPart;
    const input = document.getElementById("txtUsername");
    input.focus();
  }
  var addFriendViewStaticPart = `
<form onsubmit="searchUserButton(event);"> <!-- passing the event -->
	<label for="name">Find user by id:</label>
	<input type="text" id="txtUsername" placeholder="Username" required>
	<input type="submit" value="Search">
</form>
<div id="result"></div>
`;
  function userMiniProfile(user) {
    const btnAddFriend = "<button onclick='addFriend()'>add as friend</button>";
    const divContent = "user: id: " + user.Id + " username: " + user.Username + " " + btnAddFriend;
    return divContent;
  }
  var foundUser;
  async function searchUserButton(event) {
    event?.preventDefault();
    const resultDiv = document.getElementById("result");
    const jwt = localStorage.getItem("jwt");
    console.debug("setting jwt to request: ", jwt);
    foundUser = await UserDTO.getByUsername(document.getElementById("txtUsername").value);
    if (foundUser)
      resultDiv.innerHTML = userMiniProfile(foundUser);
    else
      resultDiv.innerHTML = "User not found";
  }
  window.searchUserButton = searchUserButton;
  async function addFriend() {
    if (clsGlobal.LoggedInUser.Id == foundUser.Id) {
      alert("You cannot add yourself as a friend");
      return;
    }
    const UsersFriends = await clsGlobal.LoggedInUser.getFriends();
    UsersFriends.forEach((userFriend) => {
      if (userFriend.Id == foundUser.Id) {
        alert("You are already friends with this user");
      }
    });
    const relationship = new Relationship(-1, clsGlobal.LoggedInUser.Id, foundUser.Id, 1);
    const response = await relationship.add();
    if (response.ok)
      alert("Friend added");
    else
      alert("Error adding friend");
  }
  window.addFriend = addFriend;
  async function listFriendsView() {
    document.getElementById("main-views").innerHTML = listFriendsViewStaticPart;
    const list = document.getElementById("lstFriends");
    const template = document.getElementById("user-template");
    const users = await clsGlobal.LoggedInUser.getFriends();
    if (users.length == 0) {
      list.innerHTML = "No friends yet";
      return;
    }
    users.forEach((user) => {
      const newListItem = template.content.cloneNode(true);
      newListItem.querySelector(".user-id").textContent = user.Id;
      newListItem.querySelector(".username").textContent = user.Username;
      var online = true;
      if ((/* @__PURE__ */ new Date()).getTime() - user.LastActivity >= 1e3 * 60 * 2)
        online = false;
      newListItem.querySelector(".online-status").textContent = online ? "online" : "offline";
      list.appendChild(newListItem);
    });
  }
  var listFriendsViewStaticPart = `
<template id="user-template">
<li>
	id: <span class="user-id"></span>
	username: <span class="username"></span>
	online: <span class="online-status">unknown</span>
	<!-- <button>Add as Friend</button> -->
</li>
</template>
<p>list:</p>
<ul id="lstFriends">
</ul>
`;

  // views/settings.ts
  async function Settings() {
    document.getElementById("main-views").innerHTML = settingsViewStaticPart;
    getOnlyFetch("/auth/2fa", { Id: clsGlobal.LoggedInUser.Id }).then(async (response) => {
      return response.json();
    }).then((data) => {
      console.log("data:", data);
      const qrCodeElement = document.getElementById("qrcode");
      qrCodeElement.src = data.qrCode;
      return data.qrCode;
    }).catch((err) => console.error("Error:", err));
  }
  var settingsViewStaticPart = `
	<h1>Enable 2FA</h1>
	<img id="qrcode" src="" style="margin: 10px 0px;" />
	<form onsubmit="verify(event);"> <!-- verify code -->
		<input type="text" id="2fa-code" placeholder="Enter code from app" required />
		<input type="submit" value="Enable">
	</form>
	<span id="result"></span>
`;
  async function verify(event) {
    event.preventDefault();
    const code = document.getElementById("2fa-code").value;
    const response = await getOnlyFetch("/auth/2fa/enable", { code, Id: clsGlobal.LoggedInUser.Id });
    if (response.ok) {
      document.getElementById("result").innerText = "2FA Enabled Successfully";
      const data = await response.json();
      localStorage.setItem("jwt", data.jwt);
    } else
      document.getElementById("result").innerText = "invalid";
  }
  window.verify = verify;

  // views/game.ts
  async function GameView() {
    document.getElementById("main-views").innerHTML = gameViewStaticPart;
  }
  var gameViewStaticPart = `
<h1>Game modes</h1>
<button>local 1v1</button>
<button onclick="GameRemoteView()">remote 1v1</button>
<button>3d local 1v1</button>
<button>AI</button>
<button onclick="JoinATournament()">Join a tournament</button>
`;
  function JoinATournament() {
    (void 0).emit("join-tournament", {
      userId: clsGlobal.LoggedInUser.Id
    });
  }
  window.JoinATournament = JoinATournament;

  // views/tournament.ts
  function Tournament() {
  }

  // frontend.ts
  var routes = {
    "/newUser": NewUser,
    "/existingUser": existingUser,
    "/friends": friendsView,
    "/addFriend": addFriendView,
    "/listFriends": listFriendsView,
    "/profile": ProfileView,
    "/profileEdit": ProfileEditView,
    // '/profile/matchHistory': ProfileMatchHistoryView,
    "/game": GameView,
    "/gameRemote": void 0,
    "/tournament": Tournament,
    // '/chat': chatView,
    "/settings": Settings
  };
  async function autoLogin() {
    console.debug("autoLogin()");
    return fetch("/validateSession", {
      method: "POST",
      credentials: "include"
      // to send cookies
    }).then((response) => {
      if (response.ok)
        return response.json();
      else
        return null;
    }).then((user) => {
      if (!user)
        clsGlobal.LoggedInUser = null;
      else {
        clsGlobal.LoggedInUser = Object.assign(new UserDTO(-1, "", "", "", -1, -1, null, null), user);
        console.debug("Filling User: ", clsGlobal.LoggedInUser);
      }
    });
  }
  function route(event, path) {
    console.log("route()");
    var pushToHistory = event == null;
    ;
    if (path) {
      handleView(null, path);
      return;
    }
    event = event || window.event;
    event.preventDefault();
    if (pushToHistory) {
      if (new URL(event.target.href).pathname != window.location.pathname)
        window.history.pushState({}, "", event.target.href);
    }
    handleView();
  }
  window.route = route;
  document.addEventListener("DOMContentLoaded", route);
  function handleView(event, path) {
    if (!path)
      path = window.location.pathname;
    console.log("Handling route: " + path);
    autoLogin().then(() => {
      if (path != "/newUser" && path != "/existingUser") {
        if (!clsGlobal.LoggedInUser) {
          console.debug("LoggedInUser not filled");
          LoginWithGoogle();
          return;
        } else
          console.debug("LoggedInUser filled");
      }
      clsGlobal.LoggedInUser?.update();
      HomeView();
      if (path == "/") {
        window.history.replaceState({}, "", "/");
        return;
      }
      if (routes[path])
        routes[path]();
      else {
        window.history.replaceState({}, "", "/");
        HomeView();
      }
    });
  }
  window.onpopstate = handleView;
})();
//!


// ENTER FIRST THOSE
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6MjgsIklzUm9vdCI6MCwiaWF0IjoxNzU3NzYyNzgwLCJleHAiOjE3NTc3NjI4NDB9.a3Cx0-Y87nQzA6NRGxiTo5Rf1DqtXy7c-TdgEvyo-1A";
const yourId = 28;

// console.log("BY USERNAME");
// await fetch("http://localhost:3000/data/user/getByUsername?username=abdo", {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// .then((res) => res.json())
// .then((data) => console.log(data))
// // await fetch("http://localhost:3000/data/user/getByUsername?username=Diana", {
// // 	headers: {
// // 		Authorization: `Bearer ${token}`,
// // 	},
// // })
// // .then((res) => res.json())
// // .then((data) => console.log(data))

// console.log("BY ID");
// await fetch("http://localhost:3000/data/user/getById?Id=" + yourId, {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// .then((res) => res.json())
// .then((data) => console.log(data))
// await fetch("http://localhost:3000/data/user/getById?Id=5", {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// .then((res) => res.json())
// .then((data) => console.log(data))

// console.log("BY GOOGLE ID");
// await fetch("http://localhost:3000/data/user/getByGoogleId?GoogleId=118201071759836814302", {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// .then((res) => res.json())
// .then((data) => console.log(data))
// await fetch("http://localhost:3000/data/user/getByGoogleId?GoogleId=google-uid-005", {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// .then((res) => res.json())
// .then((data) => console.log(data))

// console.log("GET FRIENDS");
// await fetch("http://localhost:3000/data/user/getFriends?Id=" + yourId, {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// .then((res) => res.json())
// .then((data) => console.log(data))
// await fetch("http://localhost:3000/data/user/getFriends?Id=" + 5, {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// .then((res) => res.json())
// .then((data) => console.log(data))

const user = {
	Id: yourId,
	Username: "abdo",
	Wins: 20,
	Losses: 5,
	LastActivity: new Date()
};
await fetch("http://localhost:3000/data/user/update", {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(user)
})
.then((res) => { console.log(res.status, res.statusText); return res.json(); })
.then((data) => console.log(data));

// // GET ARE ALL THE SAME

// console.log("RELATIONSHIPS");
// await fetch("http://localhost:3000/data/relationship/add", {
// 	method: "POST",
// 	headers: {
// 		"Content-Type": "application/json",
// 		Authorization: `Bearer ${token}`,
// 	},
// 	body: JSON.stringify({
// 		User1Id: yourId,
// 		User2Id: 5,
// 		Relationship: 1,
// 	}),
// })
// .then((res) => console.log(res.status, res.statusText))
// await fetch("http://localhost:3000/data/relationship/add", {
// 	method: "POST",
// 	headers: {
// 		"Content-Type": "application/json",
// 		Authorization: `Bearer ${token}`,
// 	},
// 	body: JSON.stringify({
// 		User1Id: 5,
// 		User2Id: yourId,
// 		Relationship: 1,
// 	}),
// })
// .then((res) => console.log(res.status, res.statusText))

// console.log("UPDATE RELATIONSHIPS");
// await fetch("http://localhost:3000/data/relationship/update", {
// 	method: "PUT",
// 	headers: {
// 		"Content-Type": "application/json",
// 		Authorization: `Bearer ${token}`,
// 	},
// 	body: JSON.stringify({
// 		Id: 1,
// 		User1Id: yourId,
// 		User2Id: 5,
// 		Relationship: 1,
// 	}),
// })
// .then((res) => console.log(res.status, res.statusText))
// await fetch("http://localhost:3000/data/relationship/update", {
// 	method: "PUT",
// 	headers: {
// 		"Content-Type": "application/json",
// 		Authorization: `Bearer ${token}`,
// 	},
// 	body: JSON.stringify({
// 		Id: 1,
// 		User1Id: 5,
// 		User2Id: yourId,
// 		Relationship: 3,
// 	}),
// })
// .then((res) => console.log(res.status, res.statusText))

// // 2FA
// await fetch(`http://localhost:3000/2fa?Id=${yourId}`, {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// .then((res) => console.log(res.status))
// await fetch(`http://localhost:3000/2fa?Id=${17}`, {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// .then((res) => console.log(res.status))
// await fetch(`http://localhost:3000/verify?Id=${yourId}`, {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// .then((res) => console.log(res.status))
// await fetch(`http://localhost:3000/verify?Id=${17}`, {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// .then((res) => console.log(res.status))

// login
// await fetch(`http://localhost:3000/?validateSession=${yourId}`, {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// .then((res) => console.log(res.status))
// await fetch(`http://localhost:3000/validateSession?Id=${17}`, {
// 	headers: {
// 		Authorization: `Bearer ${token}`,
// 	},
// })
// .then((res) => console.log(res.status))

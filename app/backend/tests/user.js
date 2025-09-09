
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJZCI6MjEsIklzUm9vdCI6MCwiaWF0IjoxNzU3NDUxMzkxLCJleHAiOjE3NTc0NTQ5OTF9.2J-QB1Ws8HxwFQUy3_NQ6kgdCUth5tdQ0aGLOSy_cJ4";
const yourId = 21;

function test(url)
{
	fetch(url + `?Id=${yourId}`,{
		headers: {
			'Authorization': `Bearer ${token}`
		}
	})
	.then((res) =>
	{
		console.log("response status:", res.status);
	});
}

test("http://localhost:3000/data/user/getById");
test("http://localhost:3000/data/user/getByUsername");
test("http://localhost:3000/data/user/getById");
test("http://localhost:3000/data/user/getById");

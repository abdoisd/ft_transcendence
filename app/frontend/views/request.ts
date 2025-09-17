
// response must be json
export async function get(path: string, params = {})
{
	// get client token from local storage
	const jwt = localStorage.getItem('jwt');

    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${path}?${queryString}` : path;
    return fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + jwt
		}
	})
	.then((response) => {
		if (response.ok)
			return response.json();
		else
			return null;
	});
}

// await this
export async function getOnlyFetch(path: string, params = {})
{
	// get client token from local storage
	const jwt = localStorage.getItem('jwt');

    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${path}?${queryString}` : path;
    return fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + jwt
		}
	})
}

// option to post multipart form data
export async function post(path: string, obj: any)
{
	const jwt = localStorage.getItem('jwt');

	return fetch(path, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + jwt
		},
		body: JSON.stringify(obj)
	})
}

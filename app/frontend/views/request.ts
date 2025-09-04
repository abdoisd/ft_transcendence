
export async function get(path, params = {})
{
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${path}?${queryString}` : path;
    return fetch(url)
	.then((response) => {
		if (response.ok)
			return response.json();
		else
			return null;
	});
}

export async function post(path: string, obj: any)
{
	return fetch(path, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(obj)
	})
}

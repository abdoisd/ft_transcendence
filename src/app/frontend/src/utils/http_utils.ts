export const authGet = async (path: string) => {
    const response = await fetch(path, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("jwt")}`
        }
    });

    if (!response.ok)
        throw response.statusText;
    return await response.json();
}

export const authPost = async (path: string, body: any = {}) => {
    const response = await fetch(path, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("jwt")}`
        },
        body: JSON.stringify(body)
    });
    if (!response.ok)
        throw await response.json();
    return await response.json();
}
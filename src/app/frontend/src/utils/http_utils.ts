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
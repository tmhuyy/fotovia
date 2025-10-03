import { API_URL } from "../constants";

export const post = async (path: string, formData: FormData) =>
{
    console.log(formData)
    console.log(`${API_URL}/${path}`)
    const res = await fetch(`${API_URL}/${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(Object.fromEntries(formData)),
    });

    const data = await res.json();
    console.log(data)
    if (!res.ok) {
        return {
            error: "Something is wrong",
        };
    }
    return {
        error: "",
    };
};

const API_BASE_URL = "";

async function request(url, options = {}) {
    const token = localStorage.getItem("token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Something went wrong");
    }

    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }

    return response.text();
}

export const api = {
    get: (url) =>
        request(url, {
            method: "GET",
        }),

    post: (url, body) =>
        request(url, {
            method: "POST",
            body: JSON.stringify(body),
        }),

    put: (url, body) =>
        request(url, {
            method: "PUT",
            body: JSON.stringify(body),
        }),

    delete: (url) =>
        request(url, {
            method: "DELETE",
        }),
};
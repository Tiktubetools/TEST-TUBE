const BASE_URL = import.meta.env.VITE_API_URL || "";

if (!BASE_URL) {
  console.warn("VITE_API_URL is not defined! Defaulting to relative same-origin paths.");
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // Direct any absolute calls or already completed URLs straight through
  const url = endpoint.startsWith("http://") || endpoint.startsWith("https://")
    ? endpoint
    : `${BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API Error");
  }

  // Handle json responses or fall back to text/status checks gracefully
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return { status: res.status, ok: res.ok };
}

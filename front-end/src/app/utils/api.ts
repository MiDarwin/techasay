const BASE_URL = "http://127.0.0.1:8000";

export async function apiRequest(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body: Record<string, any> | FormData | null = null,
  token: string | null = null
): Promise<any> {
  const headers: Record<string, string> = {};

  const accessToken = token || localStorage.getItem("access_token");
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const isFormData = body instanceof FormData;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: isFormData ? headers : { ...headers, "Content-Type": "application/json" },
    body: body ? (isFormData ? body : JSON.stringify(body)) : null,
  });

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return await res.json();
}
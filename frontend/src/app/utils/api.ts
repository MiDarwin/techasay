const BASE_URL = "http://127.0.0.1:8000";

export async function apiRequest(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  body: Record<string, any> | null = null,
  token: string | null = null
): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const accessToken = token || localStorage.getItem("access_token");
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const error = await res.json(); // Hata mesajını JSON olarak al
    throw error; // Hata mesajını fırlat
  }

  return await res.json();
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Next.js Router
import { apiRequest } from "../../utils/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // Router'ı tanımla

  const handleLogin = async () => {
    try {
      const data = await apiRequest("/auth/login", "POST", { email, password });
      localStorage.setItem("access_token", data.access_token); // Token'ı kaydet
      alert("Giriş başarılı!");
      router.push("/permissions/users"); // Giriş sonrası kullanıcılar sayfasına yönlendir
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Bilinmeyen bir hata oluştu.");
      }
    }
  };

  return (
    <div>
      <h2>Giriş Yap</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="button" onClick={handleLogin}>Giriş Yap</button>
    </div>
  );
}

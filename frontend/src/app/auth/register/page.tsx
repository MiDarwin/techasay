"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Next.js Router
import { apiRequest } from "../../utils/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // Router'ı tanımla

  const handleRegister = async () => {
    try {
      const data = await apiRequest("/auth/register", "POST", { email, password });
      alert(data.message);
      router.push("/auth/login"); // Başarılı kayıt sonrası login sayfasına yönlendirme
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
      <h2>Kayıt Ol</h2>
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
      <button className="button" onClick={handleRegister}>Kayıt Ol</button>
    </div>
  );
}

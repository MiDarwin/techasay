"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Next.js Router
import { apiRequest } from "../../utils/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Hata mesajı için state
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const data = await apiRequest("/auth/register", "POST", { email, password });
      alert(data.message);
      router.push("/auth/login");
    } catch (error: any) {
      // Hata mesajını yakala ve state'e ata
      if (error.detail) {
        setErrorMessage(error.detail); // Backend'den dönen hata mesajını göster
      } else {
        setErrorMessage("Bilinmeyen bir hata oluştu.");
      }
    }
  };

  return (
    <div>
      <h2>Kayıt Ol</h2>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>} {/* Hata mesajını göster */}
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

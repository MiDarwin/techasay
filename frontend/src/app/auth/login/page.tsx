"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../utils/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Hata mesajı için state
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const data = await apiRequest("/auth/login", "POST", { email, password });
      localStorage.setItem("access_token", data.access_token); // Token'ı kaydet
      alert("Giriş başarılı!");
      router.push("/permissions/users");
    } catch (error: any) {
      // Hata mesajını yakala ve state'e ata
      if (error.detail) {
        setErrorMessage(error.detail);
      } else {
        setErrorMessage("Bilinmeyen bir hata oluştu.");
      }
    }
  };

  return (
    <div>
      <h2>Giriş Yap</h2>
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
      <button className="button" onClick={handleLogin}>Giriş Yap</button>
    </div>
  );
}

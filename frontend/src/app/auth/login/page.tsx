"use client";

import { useState } from "react";
import { login } from "@/lib/api";
import { useRouter } from "next/navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await login(email, password);
      localStorage.setItem("token", response.access_token);
      router.push("/dashboard"); // Başarıyla giriş yapınca dashboard'a yönlendir
    } catch (err) {
      setError("Giriş başarısız!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">Giriş Yap</h2>
      <input
        type="email"
        placeholder="E-posta"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 my-2"
      />
      <input
        type="password"
        placeholder="Şifre"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 my-2"
      />
      <button onClick={handleLogin} className="bg-green-500 text-white p-2">
        Giriş Yap
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default Login;

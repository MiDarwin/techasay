"use client";

import { useState } from "react";
import { register } from "@/lib/api";
import { useRouter } from "next/navigation";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await register(email, password);
      router.push("/auth/login"); // Başarıyla kayıt olunca giriş sayfasına yönlendir
    } catch (err) {
      setError("Kayıt başarısız!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold">Kayıt Ol</h2>
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
      <button onClick={handleRegister} className="bg-blue-500 text-white p-2">
        Kayıt Ol
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default Register;

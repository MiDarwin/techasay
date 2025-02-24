"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Next.js Router
import { apiRequest } from "../../utils/api";
import TextInput from "../../components/TextInput"; // Reusable bileşeni içe aktar

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
      router.push("/homepage");
    } catch (error: any) {
      if (error?.detail) {
        if (Array.isArray(error.detail)) {
          const firstError = error.detail[0];
          if (firstError?.msg) {
            setErrorMessage(firstError.msg);
          } else if (firstError?.ctx?.reason) {
            setErrorMessage(firstError.ctx.reason);
          } else {
            setErrorMessage("Geçersiz giriş bilgileri.");
          }
        } else {
          setErrorMessage(error.detail);
        }
      } else {
        setErrorMessage("Bilinmeyen bir hata oluştu.");
      }
    }
  };

  const handleInputFocus = () => {
    // Kullanıcı giriş alanına tıkladığında hata mesajını gizler
    setErrorMessage("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-gray-200 rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Giriş Yap</h2>

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <TextInput
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={handleInputFocus} // Alan odaklandığında hata mesajını gizle
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Şifre
          </label>
          <TextInput
            id="password"
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={handleInputFocus} // Alan odaklandığında hata mesajını gizle
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Giriş Yap
        </button>

        {/* Hata Mesajı - Giriş Yap Butonunun Altında */}
        {errorMessage && (
          <div className="mt-4 bg-red-500 text-white text-sm rounded-lg px-4 py-2 text-center shadow-md">
            {errorMessage}
          </div>
        )}

        <p className="mt-4 text-sm text-center text-gray-600">
          Henüz bir hesabınız yok mu?{" "}
          <a href="/auth/register" className="text-blue-500 hover:underline">
            Kayıt Ol
          </a>
        </p>
      </div>
    </div>
  );
}

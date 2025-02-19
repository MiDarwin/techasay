"use client";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Next.js Router
import { apiRequest } from "../../utils/api";
import TextInput from "../../components/TextInput"; // Reusable bileşeni içe aktar

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Hata mesajı için state
  const router = useRouter();

  const handleRegister = async () => {
    try {
      // API isteği ile kullanıcı kayıt işlemi
      const data = await apiRequest("/auth/register", "POST", { email, password });
      alert(data.message);
      router.push("/auth/login"); // Başarılı ise giriş ekranına yönlendirme
    } catch (error: any) {
      if (error?.detail) {
        if (Array.isArray(error.detail)) {
          const firstError = error.detail[0];
          if (firstError?.msg) {
            setErrorMessage(firstError.msg);
          } else if (firstError?.ctx?.reason) {
            setErrorMessage(firstError.ctx.reason);
          } else {
            setErrorMessage("Geçersiz bilgi girdiniz.");
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
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Kayıt Ol</h2>

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
          onClick={handleRegister}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Kayıt Ol
        </button>

        {/* Hata Mesajı - Kayıt Ol Butonunun Altında */}
        {errorMessage && (
          <div className="mt-4 bg-red-500 text-white text-sm rounded-lg px-4 py-2 text-center shadow-md">
            {errorMessage}
          </div>
        )}

        <p className="mt-4 text-sm text-center text-gray-600">
          Zaten bir hesabınız var mı?{" "}
          <a href="/auth/login" className="text-blue-500 hover:underline">
            Giriş Yap
          </a>
        </p>
      </div>
    </div>
  );
}

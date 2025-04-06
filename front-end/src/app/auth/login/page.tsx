"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../utils/api";
import TextInput from "../../components/TextInput";
import { Moon, Sun } from "lucide-react";
import Head from "next/head"; // Google Fonts entegrasyonu için Head

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true); // Yüklenme durumunu başlat
    try {
      const data = await apiRequest("/user/login", "POST", { email, password });
      localStorage.setItem("access_token", data.access_token); // Token'ı kaydet
      router.push("/homepage"); // Giriş başarılıysa anasayfaya yönlendir
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
    } finally {
      setLoading(false); // İşlem tamamlandığında yüklenme durumunu kapat
    }
  };

  const handleInputFocus = () => {
    // Kullanıcı giriş alanına tıkladığında hata mesajını gizler
    setErrorMessage("");
  };

  return (
    <>
      {/* Google Fonts'u bağlamak için Head öğesi */}
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        className={`flex min-h-screen items-center justify-center ${
          darkMode ? "bg-gray-900" : "bg-white"
        }`}
        style={{ fontFamily: "'Open Sans', sans-serif" }} // Font'u tüm sayfaya uyguluyoruz
      >
        <div
          className={`relative w-full max-w-md ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
          } rounded-lg shadow-lg p-8`}
        >
          {/* Arkadaki gradient efekti */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 opacity-20 blur-xl pointer-events-none" />

          {/* Başlık */}
          <h2 className="text-3xl font-bold text-center mb-6 text-indigo-600">
            Giriş Yap
          </h2>

          {/* Form */}
          <div
            className="space-y-4"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleLogin(); // Enter tuşuna basıldığında giriş yap
              }
            }}
          >
            {/* Email Input */}
            <TextInput
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {/* Password Input */}
            <TextInput
              id="password"
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Giriş Yap Butonu */}
          {loading ? (
            <div className="flex justify-center items-center mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition focus:outline-none"
            >
              Giriş Yap
            </button>
          )}

          {/* Hata Mesajı */}
          {errorMessage && (
            <div className="mt-4 bg-red-500 text-white text-sm rounded-lg px-4 py-2 text-center shadow-md">
              {errorMessage}
            </div>
          )}

          {/* Kayıt Ol Linki */}
          <p className="mt-4 text-sm text-center">
            Henüz bir hesabınız yok mu?{" "}
            <a
              href="/auth/register"
              className="text-indigo-600 hover:underline"
            >
              Kayıt Ol
            </a>
          </p>
        </div>

        {/* Tema Değiştirme Butonu */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? "Açık Moda Geç" : "Karanlık Moda Geç"}
          className="fixed bottom-6 left-6 p-3 rounded-full shadow-lg bg-gray-700 hover:bg-gray-600 transition"
        >
          {darkMode ? (
            <Sun className="text-yellow-500" />
          ) : (
            <Moon className="text-gray-300" />
          )}
        </button>
      </div>
    </>
  );
}

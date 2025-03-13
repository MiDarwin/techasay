"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../utils/api";
import TextInput from "../../components/TextInput";
import { Moon, Sun } from "lucide-react";

// Google Font'u eklemek için gerekli olan CSS bağlantısını import ediyoruz
import Head from "next/head"; // <Head> kullanımı için
export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const formattedPhoneNumber = phoneNumber.replace(/\D/g, "");
      if (formattedPhoneNumber.length > 11) {
        setErrorMessage("Telefon numarası en fazla 11 karakter olabilir.");
        return;
      }
      const data = await apiRequest("/user/register", "POST", {
        email,
        name,
        surname,
        phone_number: formattedPhoneNumber,
        password,
      });
      alert(data.message);
      router.push("/auth/login");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message || "Bilinmeyen bir hata oluştu.");
      } else {
        setErrorMessage("Bilinmeyen bir hata oluştu.");
      }
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ""); // Sadece sayıları al
    if (input.startsWith("0")) {
      input = input.substring(1); // Kullanıcı başa 0 yazarsa, ikinci bir 0'ı engelle
    }
    if (input.length > 10) return; // Maksimum 10 haneli sayıya izin ver

    setPhoneNumber(`0${input}`); // Her zaman başında 0 olacak şekilde ayarla
  };

  return (
    <>
      {/* Google Fonts'u bağlamak için Head öğesini kullanıyoruz */}
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
            darkMode ? "bg-gray-800 text-black" : "bg-white text-black"
          } rounded-lg shadow-lg p-8`}
        >
          {/* Arkadaki gradient efekti */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 opacity-20 blur-xl pointer-events-none" />

          {/* Başlık */}
          <h2 className="text-3xl font-bold text-center mb-6 text-indigo-600">
            Kayıt Ol
          </h2>

          {/* Form */}
          <div className="space-y-4">
            <TextInput
              id="name"
              type="text"
              placeholder="İsim"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextInput
              id="surname"
              type="text"
              placeholder="Soyisim"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
            <TextInput
              id="phone"
              type="text"
              placeholder="Telefon"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
            />
            <TextInput
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextInput
              id="password"
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Kayıt Ol Butonu */}
          <button
            onClick={handleRegister}
            className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition focus:outline-none"
          >
            Kayıt Ol
          </button>

          {/* Hata Mesajı */}
          {errorMessage && (
            <div className="mt-4 bg-red-500 text-white text-sm rounded-lg px-4 py-2 text-center shadow-md">
              {errorMessage}
            </div>
          )}

          {/* Giriş Yap Linki */}
          <p className="mt-4 text-sm text-center text-gray-600">
            Zaten bir hesabınız var mı?{" "}
            <a href="/auth/login" className="text-indigo-600 hover:underline">
              Giriş Yap
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

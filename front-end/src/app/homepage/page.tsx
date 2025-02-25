"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  const goToUsersPage = () => {
    router.push("/permissions/users");
  };

  const goToBpetPage = () => {
    router.push("/bpet");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      {/* Sol Üst Logo */}
      <div className="absolute top-6 left-6">
        <Image
          src="/images/techasay-logo.png"
          alt="TechAsay Logo"
          width={150}
          height={150}
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* İçerik Kartı */}
      <div className="w-full max-w-4xl bg-gray-200 rounded-lg shadow-lg p-6 relative">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Hoş Geldiniz!
        </h1>
        <p className="text-lg text-gray-600 mb-6 text-center">
        Gerçekleştirilecek işlemlere aşağıda yer alan butonlar aracılığıyla erişebilirsiniz.
        </p>

        {/* Profesyonel Butonlar */}
        <div className="flex flex-col gap-4">
          {/* Bpet İşlemleri */}
          <button
            onClick={goToBpetPage}
            className="flex items-center justify-center gap-3 w-full bg-blue-400 text-white py-2 px-4 text-base font-medium rounded-lg shadow hover:bg-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg">
              <Image
                src="/images/bpet-logo.png"
                alt="Bpet Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span>Bpet İşlemleri</span>
          </button>

          {/* Kullanıcı Sayfasına Git */}
          <button
            onClick={goToUsersPage}
            className="flex items-center justify-center gap-3 w-full bg-blue-400 text-white py-2 px-4 text-base font-medium rounded-lg shadow hover:bg-blue-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg">
              <Image
                src="/images/users-logo.png"
                alt="Users Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span>Kullanıcıları ve İzinleri Yönet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
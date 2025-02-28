"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  const goToUsersPage = () => {
    router.push("/permissions/users");
  };

  const goToBpetPage = () => {
    router.push("/bpet");
  };

  // Tablo için state
  const [tableData, setTableData] = useState([]);

  // Örnek veri GET isteği simülasyonu
  useEffect(() => {
    // Bu kısımda API'den veri çekebilirsiniz. Şu an için statik veri yerleştirildi.
    const fetchData = async () => {
      const data = [
        { id: 1, name: "Ahmet", role: "Admin", status: "Aktif" },
        { id: 2, name: "Mehmet", role: "Kullanıcı", status: "Pasif" },
        { id: 3, name: "Ayşe", role: "Yönetici", status: "Aktif" },
      ];
      setTableData(data);
    };

    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
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

      {/* Sağ Üstte Kullanıcıları ve İzinleri Yönet */}
      <div className="absolute top-6 right-6">
        <button
          onClick={goToUsersPage}
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg shadow hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Kullanıcıları ve İzinleri Yönet
        </button>
      </div>

      {/* İçerik Kartı */}
      <div className="w-full max-w-5xl bg-gray-800 text-white rounded-lg shadow-lg p-6 relative">
        {/* Gradient Arkaplan */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 opacity-20 blur-xl pointer-events-none" />

        <h1 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
          Hoş Geldiniz!
        </h1>
        <p className="text-lg text-gray-300 mb-6 text-center">
          Gerçekleştirilecek işlemlere aşağıda yer alan butonlar aracılığıyla erişebilirsiniz.
        </p>

        {/* Profesyonel Butonlar */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Bpet İşlemleri */}
          <button
            onClick={goToBpetPage}
            className="flex items-center justify-center gap-3 w-full bg-indigo-600 text-white py-3 px-4 text-base font-medium rounded-lg shadow hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-lg">
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
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-400">
            <thead className="text-xs uppercase bg-gray-700 text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  ID
                </th>
                <th scope="col" className="px-6 py-3">
                  İsim
                </th>
                <th scope="col" className="px-6 py-3">
                  Rol
                </th>
                <th scope="col" className="px-6 py-3">
                  Durum
                </th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.id} className="bg-gray-800 border-b border-gray-700">
                  <td className="px-6 py-4">{row.id}</td>
                  <td className="px-6 py-4">{row.name}</td>
                  <td className="px-6 py-4">{row.role}</td>
                  <td className="px-6 py-4">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
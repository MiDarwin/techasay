"use client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const goToUsersPage = () => {
    router.push("/permissions/users"); // Kullanıcıları ve izinleri görüntüleme sayfasına yönlendirme
  };

  const goToExcelPage = () => {
    router.push("/tasks/excel"); // Gelecekte Excel dosyalarını okuma sayfası
  };

  const goToPingPage = () => {
    router.push("/tasks/ping"); // Gelecekte ping atma sayfası
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Hoş Geldiniz!
        </h1>
        <p className="text-lg text-gray-600 mb-6 text-center">
          Buradan kullanıcı izinlerini ve site görevlerini yönetebilirsiniz.
        </p>

        {/* Yönlendirme Butonları */}
        <div className="flex flex-col gap-4">
          {/* Kullanıcı Sayfasına Git */}
          <button
            onClick={goToUsersPage}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Kullanıcıları ve İzinleri Yönet
          </button>

          {/* Excel Dosyalarını Oku */}
          <button
            onClick={goToExcelPage}
            className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Excel Verilerini Oku
          </button>

          {/* Ping At */}
          <button
            onClick={goToPingPage}
            className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            Ping Gönder
          </button>
        </div>
      </div>
    </div>
  );
}

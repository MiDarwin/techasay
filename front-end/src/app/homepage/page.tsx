"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import CompanyTable from "../components/CompanyTable";
import CompanyDetailsModal from "../components/CompanyDetailsModal";
import ErrorLogsModal from "../components/ErrorLogsModal";
import { apiRequest } from "../utils/api";

export default function HomePage() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]); // Şirket verileri
  const [selectedCompany, setSelectedCompany] = useState(null); // Seçilen şirket
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // Detaylar modal kontrolü
  const [isErrorLogsModalOpen, setIsErrorLogsModalOpen] = useState(false); // Hata log modal kontrolü

  // Kullanıcı sayfasına yönlendirme
  const goToUsersPage = () => {
    router.push("/permissions/users");
  };

  // BPET sayfasına yönlendirme
  const goToBpetPage = () => {
    router.push("/bpet");
  };

  // Şirket verilerini yükleme
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await apiRequest("/excel/existing-data/", "GET");
        setCompanies(data.data); // Backend'den gelen `data`yı tabloya yükle
      } catch (error) {
        console.error("Şirket verileri alınamadı:", error);
      }
    };

    fetchCompanies();
  }, []);

  // Detaylar modalını açma
  const openDetailsModal = (company) => {
    console.log("Detaylar için seçilen şirket:", company); // Konsola yazdır
    setSelectedCompany(company);
    setIsDetailsModalOpen(true);
  };

  // Hata logları modalını açma
  const openErrorLogsModal = (company) => {
    console.log("Hata logları için seçilen şirket:", company); // Konsola yazdır
    setSelectedCompany(company);
    setIsErrorLogsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      {/* Sağ Üstte Kullanıcıları ve İzinleri Yönet */}
      <div className="absolute top-6 right-6">
        <button
          onClick={goToUsersPage}
          className="bg-indigo-600 text-white py-2 px-4 rounded-lg shadow hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Kullanıcıları ve İzinleri Yönet
        </button>
      </div>
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">Şirket Listesi</h1>

      {/* Şirket Tablosu */}
      <CompanyTable
        companies={companies}
        onDetailsClick={openDetailsModal}
        onErrorLogsClick={openErrorLogsModal}
      />

      {/* Şirket Detayları Modali */}
      {isDetailsModalOpen && selectedCompany && (
        <CompanyDetailsModal
          company={selectedCompany}
          onClose={() => setIsDetailsModalOpen(false)}
        />
      )}

      {/* Hata Logları Modali */}
      {isErrorLogsModalOpen && selectedCompany && (
        <ErrorLogsModal
          company={selectedCompany}
          onClose={() => setIsErrorLogsModalOpen(false)}
        />
      )}
    </div>
  );
}
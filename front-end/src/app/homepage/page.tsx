"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import CompanyTable from "../components/CompanyTable";
import CompanyDetailsModal from "../components/CompanyDetailsModal";
import ErrorLogsModal from "../components/ErrorLogsModal";
import { apiRequest } from "../utils/api";
import Head from "next/head"; // Google Fonts için Head bileşeni

export default function HomePage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(true); // Karanlık ve açık mod kontrolü
  const [criticalAlertCount, setCriticalAlertCount] = useState(0); // Kritik hatası 5 günü aşan şirketlerin sayısı
  const [companies, setCompanies] = useState([]); // Şirket verileri
  const [criticalCompanies, setCriticalCompanies] = useState([]); // Kritik şirketlerin detaylı listesi
  const [isScrollOpen, setIsScrollOpen] = useState(false); // Scroll açılıp kapanma durumu
  const [selectedCompany, setSelectedCompany] = useState(null); // Seçilen şirket
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // Detaylar modal kontrolü
  const [isErrorLogsModalOpen, setIsErrorLogsModalOpen] = useState(false); // Hata log modal kontrolü
  const [filteredCompanies, setFilteredCompanies] = useState([]); // Filtrelenmiş şirketler
  const [unvaniFilter, setUnvaniFilter] = useState(""); // ÜNVANI filtresi
  const [ilFilter, setIlFilter] = useState(""); // İL filtresi

  // Kullanıcı sayfasına yönlendirme
  const goToUsersPage = () => {
    router.push("/permissions/users");
  };

  // BPET sayfasına yönlendirme
  const goToBpetPage = () => {
    router.push("/bpet");
  };

  // ÜNVANI ve İL filtrelerini uygula
  useEffect(() => {
    const filtered = companies.filter((company) => {
      const matchesUnvani = company.ÜNVANI?.toLowerCase().includes(unvaniFilter.toLowerCase());
      const matchesIl = company.İL?.toLowerCase().includes(ilFilter.toLowerCase());
      return matchesUnvani && matchesIl;
    });
    setFilteredCompanies(filtered);
  }, [unvaniFilter, ilFilter, companies]);

  // Şirket verilerini ve kritik hataları yükleme
  useEffect(() => {
    const fetchData = async () => {
      try {
        const companiesData = await apiRequest("/excel/existing-data/", "GET");
        setCompanies(companiesData.data); // Backend'den gelen `data`yı tabloya yükle
        setFilteredCompanies(companiesData.data); // Başlangıçta tüm şirketler filtrelenmiş olarak gösterilir

        const criticalData = await apiRequest(
          "/bpet-hata-takip/get-top-critical-logs/",
          "GET"
        );
        console.log("Backend'den gelen kritik loglar:", criticalData.top_kayitlar); // Gelen veriyi kontrol edin
        const { criticalCount, criticalList } = calculateCriticalAlertDetails(
          criticalData.top_kayitlar
        );
        setCriticalAlertCount(criticalCount);
        setCriticalCompanies(criticalList);
      } catch (error) {
        console.error("Veriler alınamadı:", error);
      }
    };

    fetchData();
  }, []);

  // Kritik hata detaylarını hesaplama
  const calculateCriticalAlertDetails = (companies) => {
    let alertCount = 0;
    const criticalList = [];

    companies.forEach((company) => {
      if (!company.ip_adresleri || company.ip_adresleri.length === 0) return; // Eğer ip_adresleri yoksa atla

      let uniqueDates = new Set();

      // Şirketin tüm IP adreslerini kontrol et
      company.ip_adresleri.forEach((ipDetails) => {
        if (!ipDetails.kritik_hata_sayisi || ipDetails.kritik_hata_sayisi.length === 0)
          return;

        // Tarihleri benzersiz (unique) yapmak için Set kullanıyoruz
        ipDetails.kritik_hata_sayisi.forEach((date) => uniqueDates.add(date));
      });

      // Eğer farklı günlerin sayısı 5 veya daha fazlaysa, bu şirket kritik olarak kabul edilir
      if (uniqueDates.size >= 5) {
        alertCount += 1;
        criticalList.push({
          name: company._id, // Şirketin adı
          criticalDays: uniqueDates.size, // Kritik gün sayısı
        });
      }
    });

    return { criticalCount: alertCount, criticalList };
  };

  // Scroll açma ve kapama işlemi
  const toggleScroll = () => {
    setIsScrollOpen(!isScrollOpen);
  };

  // Karanlık ve açık modu değiştirme
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Detaylar modalını açma
  const openDetailsModal = (company) => {
    setSelectedCompany(company);
    setIsDetailsModalOpen(true);
  };

  // Hata logları modalını açma
  const openErrorLogsModal = (company) => {
    setSelectedCompany(company);
    setIsErrorLogsModalOpen(true);
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
        className={`min-h-screen flex flex-col items-center justify-center relative ${
          darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
        style={{
          fontFamily: "'Open Sans', sans-serif", // Font'u tüm sayfaya uyguluyoruz
        }}
      >
        {/* Sağ üstte karanlık mod butonu */}
        <div className="absolute top-6 left-6">
          <button
            onClick={toggleDarkMode}
            className={`py-2 px-4 rounded-lg shadow ${
              darkMode
                ? "bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 text-white hover:opacity-90"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            } transition focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            {darkMode ? "Açık Mod" : "Karanlık Mod"}
          </button>
        </div>

        {/* Sağ üstte kırmızı ünlem ve scroll kontrolü */}
        {criticalAlertCount > 0 && (
          <div className="absolute top-20 right-20">
            <div className="relative">
              {/* Kırmızı yuvarlak */}
              <div
                className="bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold shadow-lg cursor-pointer"
                onClick={toggleScroll}
              >
                {criticalAlertCount}
              </div>

              {/* Ünlem simgesi */}
              <div
                className="absolute -bottom-2 right-0 bg-red-800 rounded-full w-4 h-4 flex items-center justify-center text-sm font-bold cursor-pointer"
                onClick={toggleScroll}
              >
                ❗
              </div>

              {/* Scrollable Liste */}
              {isScrollOpen && (
                <div
                  className={`absolute top-12 right-0 ${
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  } border border-gray-700 rounded-md shadow-lg w-64 max-h-64 overflow-y-auto`}
                >
                  <h3
                    className={`text-center font-semibold py-2 ${
                      darkMode ? "text-white" : "text-black"
                    }`}
                  >
                    Kritik Şirketler
                  </h3>
                  <ul>
                    {criticalCompanies.map((company, index) => (
                      <li
                        key={index}
                        className={`flex justify-between items-center px-4 py-2 hover:bg-gray-700 cursor-pointer ${
                          darkMode ? "text-white" : "text-black"
                        }`}
                      >
                        <span>{company.name}</span>
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            darkMode ? "bg-red-500 text-white" : "bg-red-500 text-white"
                          }`}
                        >
                          {company.criticalDays} gün
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sağ Üstte Kullanıcıları ve İzinleri Yönet */}
        <div className="absolute top-6 right-6">
          <button
            onClick={goToUsersPage}
            className="bg-indigo-600 text-white py-2 px-4 rounded-lg shadow hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Kullanıcıları ve İzinleri Yönet
          </button>
        </div>
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-500 opacity-20 blur-xl pointer-events-none" />

{/* Başlık */}
<h1 className="text-3xl font-bold text-center mb-6 text-indigo-600">
  Şirket Listesi
</h1>

        {/* Arama ve filtreleme alanları */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Şirket Ara"
            value={unvaniFilter}
            onChange={(e) => setUnvaniFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-gray-100 text-black border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
          <input
            type="text"
            placeholder="İL Ara"
            value={ilFilter}
            onChange={(e) => setIlFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              darkMode ? "bg-gray-800 text-white border-gray-700" : "bg-gray-100 text-black border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
        </div>

        {/* Şirket Tablosu */}
        <CompanyTable
          companies={filteredCompanies} // Filtrelenmiş şirketler gösterilir
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
    </>
  );
}
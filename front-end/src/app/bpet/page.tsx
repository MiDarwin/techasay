"use client";
import React from "react";
import { useState, useEffect } from "react";
import { apiRequest } from "../utils/api";

// API'den gelen veriler için tip tanımlaması
type BpetData = {
  _id: string;
  [key: string]: any; // Dinamik alanlar için
};

// Türkiye'deki iller listesi
const iller = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara",
  "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman",
  "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale",
  "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay",
  "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman",
  "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla",
  "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun",
  "Şanlıurfa", "Siirt", "Sinop", "Şırnak", "Sivas", "Tekirdağ", "Tokat", "Trabzon",
  "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

export default function BpetPage() {
  const [data, setData] = useState<BpetData[]>([]); // API'den gelen veri
  const [filteredData, setFilteredData] = useState<BpetData[]>([]); // Filtrelenmiş veri
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // Arama sorgusu
  const [expandedRow, setExpandedRow] = useState<string | null>(null); // Detaylı gösterilen satır
  const [selectedIl, setSelectedIl] = useState(""); // İl filtresi
  const [selectedDurum, setSelectedDurum] = useState(""); // Durum filtresi

  // Ana sütunlar
  const mainColumns = [
    "Wan IP",
    "Gsm No",
    "RT Lokal IP /24",
    "IPSec Blok",
    "IPSec Merkez ve Client",
    "Durum",
    "ÜNVANI",
    "İL",
    "Yetkili Gsm"
  ];
// Excel dosyası yükleme işlemi
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || e.target.files.length === 0) return;

  const file = e.target.files[0];
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await apiRequest("/excel/upload/", "POST", formData);

    // Backend'den gelen mesajı kullanıcıya göster
    const { mesaj, yeni_kayit_sayisi, tekrar_edilen_kayit_sayisi } = response;

    alert(`
      ${mesaj}
      Yeni Kayıt Sayısı: ${yeni_kayit_sayisi}
      Tekrar Edilen Kayıt Sayısı: ${tekrar_edilen_kayit_sayisi}
    `);

    window.location.reload(); // Excel yüklendiğinde sayfayı yeniler
  } catch (error) {
    console.error("Dosya yükleme hatası:", error);

    // Hata mesajını kullanıcıya göster
    alert("Dosya yüklenirken bir hata oluştu. Lütfen tekrar deneyin.");
  }
};
  // Veri çekme işlemi
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest("/excel/existing-data/", "GET");
        if (response && Array.isArray(response.data)) {
          setData(response.data);
          setFilteredData(response.data); // Başlangıçta tüm veriyi göster
        } else {
          throw new Error("Beklenmeyen veri formatı");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtreleme işlemi
  useEffect(() => {
    let filtered = data;

    // İl filtresi
    if (selectedIl) {
      filtered = filtered.filter((item) => item["İL"] === selectedIl);
    }

    // Durum filtresi
    if (selectedDurum) {
      filtered = filtered.filter((item) => item["Durum"] === selectedDurum);
    }

    // Genel arama
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(query)
        )
      );
    }

    setFilteredData(filtered);
  }, [data, selectedIl, selectedDurum, searchQuery]);

  // Detaylı gösterme işlemi
  const toggleRowDetails = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id)); // Aynı satıra tekrar tıklanırsa kapat
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      
      <div className="w-full max-w-7xl bg-white rounded-lg shadow-lg p-6">
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Bpet İşlemleri
        </h2>

        {/* İl ve Durum Filtreleme */}
        <div className="flex gap-4 mb-6">
          {/* İl Filtresi */}
          <select
            value={selectedIl}
            onChange={(e) => setSelectedIl(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm İller</option>
            {iller.map((il) => (
              <option key={il} value={il}>
                {il}
              </option>
            ))}
          </select>

          {/* Durum Filtresi */}
          <select
            value={selectedDurum}
            onChange={(e) => setSelectedDurum(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tüm Durumlar</option>
            <option value="Tamamlandı">Tamamlandı</option>
            <option value="Tamamlanmadı">Tamamlanmadı</option>
          </select>
        </div>

        {/* Genel Arama */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
 {/* Excel Dosyası Yükleme Butonu */}
 <div className="absolute top-6 right-6">
          <label className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5V19.5A2.25 2.25 0 005.25 21H18.75A2.25 2.25 0 0021 19.5V16.5M3 16.5L12 3L21 16.5M3 16.5H21"
              />
            </svg>
            <span>Excel Yükle</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".xlsx, .xls"
            />
          </label>
        </div>
        {/* Tablo */}
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center text-lg text-gray-600">Yükleniyor...</p>
          ) : filteredData.length === 0 ? (
            <p className="text-center text-gray-600">Eşleşen veri bulunamadı.</p>
          ) : (
            <table className="w-full border-collapse table-auto">
              <thead>
                <tr className="bg-blue-500 text-white">
                  {mainColumns.map((col) => (
                    <th key={col} className="py-3 px-4 text-left">
                      {col}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-left">Detaylar</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr
                    key={item._id}
                    className="odd:bg-gray-100 even:bg-blue-100"
                  >
                    {mainColumns.map((col) => (
                      <td key={col} className="py-3 px-4">
                        {item[col]}
                      </td>
                    ))}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleRowDetails(item._id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                      >
                        {expandedRow === item._id
                          ? "Detayları Gizle"
                          : "Detaylı Göster"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
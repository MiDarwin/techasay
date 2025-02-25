"use client";
import React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { apiRequest } from "../utils/api";

// API'den gelen veriler için tip tanımlaması
type BpetData = {
  _id: string;
  [key: string]: any; // Dinamik alanlar için
};

export default function BpetPage() {
  const [data, setData] = useState<BpetData[]>([]); // API'den gelen veri
  const [filteredData, setFilteredData] = useState<BpetData[]>([]); // Filtrelenmiş veri
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // Arama sorgusu
  const [searchField, setSearchField] = useState("Tüm Alanlar"); // Arama yapılacak alan
  const [expandedRow, setExpandedRow] = useState<string | null>(null); // Detaylı gösterilen satır
  const [columns, setColumns] = useState<string[]>([]); // Excel verisindeki sütun adları

  // Veri çekme işlemi
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiRequest("/excel/existing-data/", "GET");
        console.log("API Response:", response); // API'den dönen veriyi kontrol edin
        if (response && Array.isArray(response.data)) {
          setData(response.data);
          setFilteredData(response.data); // Başlangıçta tüm veriyi göster

          // Sütun adlarını JSON anahtarlarından çıkar
          const sampleRow = response.data[0];
          if (sampleRow) {
            setColumns(Object.keys(sampleRow));
          }
        } else {
          throw new Error("Beklenmeyen veri formatı");
        }
      } catch (error) {
        console.error("Veri çekme hatası:", error);
        setErrorMessage("Veriler alınırken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
// Excel dosyası yükleme işlemi
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      await apiRequest("/excel/upload/", "POST", formData);
      alert("Excel dosyası başarıyla yüklendi!");
      window.location.reload(); // Excel yüklendiğinde sayfayı yeniler
    } catch (error) {
      console.error("Dosya yükleme hatası:", error);
      alert("Dosya yüklenirken bir hata oluştu.");
    }
  };
  // Arama işlemi
  const handleSearch = () => {
    const query = searchQuery.toLowerCase();
    const filtered = data.filter((item) => {
      if (searchField === "Tüm Alanlar") {
        return Object.values(item).some((value) =>
          String(value).toLowerCase().includes(query)
        );
      }
      return (
        item[searchField] &&
        String(item[searchField]).toLowerCase().includes(query)
      );
    });
    setFilteredData(filtered);
  };

  // Detaylı gösterme işlemi
  const toggleRowDetails = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id)); // Aynı satıra tekrar tıklanırsa kapat
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      {/* Sol üst köşeye Bpet logosu */}
      <div className="absolute top-6 left-6">
      <Image
          src="/images/techasay-logo.png" // Logo konumu
          alt="Bpet Logo"
          width={170} // Logo genişliği
          height={170} // Logo yüksekliği
          style={{
            objectFit: "contain", // Görselin orantılı görünmesini sağlar
          }}
        />
        <Image
          src="/images/bpet-logo.png" // Logo konumu
          alt="Bpet Logo"
          width={160} // Logo genişliği
          height={150} // Logo yüksekliği
          style={{
            objectFit: "contain", // Görselin orantılı görünmesini sağlar
          }}
        />
      </div>

      <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-6 relative">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Bpet İşlemleri
        </h2>

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

        {/* Arama ve Filtreleme */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Tüm Alanlar">Tüm Alanlar</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
          <button
            onClick={handleSearch}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Ara
          </button>
        </div>

        {/* Tablo */}
        {loading ? (
          <p className="text-center text-lg text-gray-600">Yükleniyor...</p>
        ) : errorMessage ? (
          <p className="text-center text-red-500">{errorMessage}</p>
        ) : filteredData.length === 0 ? (
          <p className="text-center text-gray-600">Eşleşen veri bulunamadı.</p>
        ) : (
          <table className="w-full border-collapse table-auto">
            <thead>
              <tr className="bg-purple-500 text-white">
                <th className="py-3 px-4 text-left">Sıra</th>
                <th className="py-3 px-4 text-left">Wan IP</th>
                <th className="py-3 px-4 text-left">Durum</th>
                <th className="py-3 px-4 text-left">Ünvanı</th>
                <th className="py-3 px-4 text-left">İl</th>
                <th className="py-3 px-4 text-left">Detaylar</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <React.Fragment key={item._id}>
                  {/* Ana Satır */}
                  <tr className="odd:bg-gray-100 even:bg-purple-100">
                    <td className="py-3 px-4">{item["Sıra"]}</td>
                    <td className="py-3 px-4">{item["Wan IP"]}</td>
                    <td className="py-3 px-4">{item["Durum"]}</td>
                    <td className="py-3 px-4">{item["ÜNVANI"]}</td>
                    <td className="py-3 px-4">{item["İL"]}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleRowDetails(item._id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                      >
                        {expandedRow === item._id
                          ? "Detayı Gizle"
                          : "Detaylı Göster"}
                      </button>
                    </td>
                  </tr>

                  {/* Detay Satırı */}
                  {expandedRow === item._id && (
                    <tr className="bg-gray-200" key={`${item._id}-details`}>
                      <td colSpan={6} className="py-4 px-6">
                        <div className="text-sm text-gray-700">
                          {columns.map((col) => (
                            <p key={col}>
                              <strong>{col}:</strong> {item[col]}
                            </p>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
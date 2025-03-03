import React, { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

const ErrorLogsModal = ({ company, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [totalErrorCount, setTotalErrorCount] = useState(0);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await apiRequest(
          `/bpet-hata-takip/get-company-errors/${company.ÜNVANI}`,
          "GET"
        );
        setLogs(data.ip_adresleri);
        setTotalErrorCount(data.toplam_hata_sayisi);
      } catch (error) {
        console.error("Hata logları alınamadı:", error);
      }
    };

    fetchLogs();
  }, [company]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">{company.ÜNVANI} - Hata Logları</h2>
        <p className="mb-4">
          <strong>Toplam Hata Sayısı:</strong> {totalErrorCount}
        </p>
        {logs.length > 0 ? (
          <ul>
            {logs.map((log, index) => (
              <li key={index} className="mb-4 border-b border-gray-600 pb-2">
                <p>
                  <strong>IP Adresi:</strong> {log.ip}
                </p>
                <p>
                  <strong>Hata Tarihleri:</strong>{" "}
                  {log.kritik_hata_sayisi.join(", ")}
                </p>
                <p>
                  <strong>Son Kontrol Tarihi:</strong>{" "}
                  {new Date(log.son_kontrol_tarihi).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Bu şirket için hata logu bulunamadı.</p>
        )}
        <button
          onClick={onClose}
          className="bg-red-600 px-4 py-2 mt-4 rounded-lg hover:bg-red-700"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};

export default ErrorLogsModal;
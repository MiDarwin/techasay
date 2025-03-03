import React, { useEffect, useState } from "react";
import { apiRequest } from "../utils/api";

const CompanyDetailsModal = ({ company, onClose }) => {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await apiRequest(`/excel/existing-data/${company._id}`, "GET");
        setDetails(data);
      } catch (error) {
        console.error("Şirket detayları alınamadı:", error);
      }
    };

    fetchDetails();
  }, [company]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">{company.ÜNVANI} Detayları</h2>
        {details ? (
          <>
            <p>
              <strong>İL:</strong> {details.İL}
            </p>
            <p>
              <strong>Durum:</strong> {details.Durum}
            </p>
            {/* Diğer detaylar buraya eklenebilir */}
          </>
        ) : (
          <p>Yükleniyor...</p>
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

export default CompanyDetailsModal;
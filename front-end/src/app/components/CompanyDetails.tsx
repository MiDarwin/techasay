import React from "react";

interface CompanyDetailsProps {
  company: {
    id: number;
    name: string;
    address: string;
  };
  modalData: {
    phone: string;
    errorCount: number;
  };
  onClose: () => void;
}

const CompanyDetails: React.FC<CompanyDetailsProps> = ({
  company,
  modalData,
  onClose,
}) => {
  return (
    <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-96">
      <h2 className="text-2xl font-bold mb-4">{company.name} Detayları</h2>
      <p className="mb-2">
        <strong>Adres:</strong> {company.address}
      </p>
      <p className="mb-2">
        <strong>Telefon:</strong> {modalData.phone}
      </p>
      <p className="mb-2">
        <strong>Hata Sayısı:</strong> {modalData.errorCount}
      </p>
      <div className="flex justify-end mt-4">
        <button
          onClick={onClose}
          className="bg-red-600 text-white py-2 px-4 rounded-lg shadow hover:bg-red-700 transition"
        >
          Kapat
        </button>
      </div>
    </div>
  );
};

export default CompanyDetails;
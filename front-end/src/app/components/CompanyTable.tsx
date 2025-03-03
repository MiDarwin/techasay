import React from "react";

const CompanyTable = ({ companies, onDetailsClick, onErrorLogsClick }) => {
  return (
    <div className="overflow-x-auto w-full max-w-5xl bg-gray-800 rounded-lg shadow-lg">
      <table className="table-auto w-full text-sm text-gray-400">
        <thead className="text-xs bg-gray-700 text-gray-400 uppercase">
          <tr>
            <th className="px-6 py-3">ÜNVANI</th>
            <th className="px-6 py-3">İL</th>
            <th className="px-6 py-3">Durum</th>
            <th className="px-6 py-3">Aksiyonlar</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company._id} className="bg-gray-800 border-b border-gray-700">
              <td className="px-6 py-4">{company.ÜNVANI}</td>
              <td className="px-6 py-4">{company.İL}</td>
              <td className="px-6 py-4">{company.Durum}</td>
              <td className="px-6 py-4 flex space-x-4">
                <button
                  onClick={() => onDetailsClick(company)}
                  className="bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-700"
                >
                  Şirket Detayları
                </button>
                <button
                  onClick={() => onErrorLogsClick(company)}
                  className="bg-red-600 px-4 py-2 rounded-lg text-white hover:bg-red-700"
                >
                  Kritik Hatalar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyTable;
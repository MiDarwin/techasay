import React from 'react';

const CompanyTable = ({ companies, onEdit, onDelete, darkMode }) => {
  // Debugging: Log companies to inspect their structure
  console.log("Companies Data:", companies);

  return (
    <div className="overflow-x-auto">
      <table className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} w-full rounded`}>
        <thead>
          <tr>
            <th className="text-left p-4">ID</th>
            <th className="text-left p-4">Şirket ID</th>
            <th className="text-left p-4">Şirket Adı</th>
            <th className="text-left p-4">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company._id} className="border-t border-gray-700">
              <td className="p-4">{company._id}</td>
              <td className="p-4">{typeof company.company_id === 'object' ? JSON.stringify(company.company_id) : company.company_id}</td>
              <td className="p-4">
                {typeof company.name === 'object' ? (
                  // Customize based on the actual structure
                  `${company.name.first} ${company.name.last}`
                ) : (
                  company.name
                )}
              </td>
              <td className="p-4 space-x-2">
                <button
                  onClick={() => onEdit(company)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Güncelle
                </button>
                <button
                  onClick={() => onDelete(company._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
          {companies.length === 0 && (
            <tr>
              <td colSpan="4" className="p-4 text-center">
                Hiç Şirket Bulunmuyor.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CompanyTable;
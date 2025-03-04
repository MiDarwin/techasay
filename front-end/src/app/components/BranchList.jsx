// src/components/BranchList.jsx
import React, { useState, useEffect } from "react";
import { getAllBranches, deleteBranch, getAllCompanies } from "../utils/api";

const BranchList = () => {
  const [branches, setBranches] = useState([]);
  const [companies, setCompanies] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getAllBranches();
        setBranches(data);
      } catch (err) {
        setError(err.detail || "Şubeler yüklenirken bir hata oluştu.");
      }
    };

    const fetchCompanies = async () => {
      try {
        const data = await getAllCompanies();
        // Şirketleri ID'ye göre haritalama
        const companyMap = {};
        data.forEach((company) => {
          companyMap[company.company_id] = company.name; // Burada 'name' kullanılıyor
        });
        setCompanies(companyMap);
      } catch (err) {
        setError(err.detail || "Şirketler yüklenirken bir hata oluştu.");
      }
    };

    fetchBranches();
    fetchCompanies();
  }, []);

  const handleDelete = async (branch_id) => {
    if (!window.confirm("Şubeyi silmek istediğinize emin misiniz?")) return;

    try {
      await deleteBranch(branch_id);
      setSuccess("Şube başarıyla silindi!");
      setBranches(branches.filter((branch) => branch.id !== branch_id));
    } catch (err) {
      setError(err.detail || "Şube silinirken bir hata oluştu.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">
        Şubelerin Listesi
      </h2>
      {error && (
        <div className="bg-red-500 text-white p-2 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500 text-white p-2 rounded mb-4">
          {success}
        </div>
      )}
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="px-4 py-2">Şube Adı</th>
            <th className="px-4 py-2">Şirket</th>
            <th className="px-4 py-2">Adres</th>
            <th className="px-4 py-2">Şehir</th>
            <th className="px-4 py-2">Telefon</th>
            <th className="px-4 py-2">Aksiyonlar</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr
              key={branch.id}
              className="border-t border-gray-300 dark:border-gray-600"
            >
              <td className="px-4 py-2">{branch.branch_name}</td>
              <td className="px-4 py-2">
                {companies[branch.company_id] || branch.company_id}
              </td>
              <td className="px-4 py-2">{branch.address}</td>
              <td className="px-4 py-2">{branch.city}</td>
              <td className="px-4 py-2">{branch.phone_number}</td>
              <td className="px-4 py-2">
                {/* Düzenleme butonu veya başka aksiyonlar ekleyebilirsiniz */}
                <button
                  onClick={() => handleDelete(branch.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BranchList;
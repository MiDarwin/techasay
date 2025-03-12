import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getBranchesByCompanyId, getAllCompanies } from "../../utils/api"; // API çağrıları

const SubBranchForm = ({ onSubmit, onCancel }) => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [subBranchName, setSubBranchName] = useState("");
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");

  // Şirketleri al
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companyData = await getAllCompanies();
        setCompanies(companyData);
      } catch (err) {
        setError(err.message || "Şirketler alınırken bir hata oluştu.");
      }
    };
    fetchCompanies();
  }, []);

  // Şirket seçildiğinde şubeleri al
  useEffect(() => {
    const fetchBranches = async () => {
      if (selectedCompanyId) {
        try {
          const fetchedBranches = await getBranchesByCompanyId(
            selectedCompanyId
          );
          setBranches(fetchedBranches);
        } catch (err) {
          setError(err.message || "Şubeler alınırken bir hata oluştu.");
        }
      } else {
        setBranches([]);
      }
    };

    fetchBranches();
  }, [selectedCompanyId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCompanyId || !selectedBranchId || !subBranchName) {
      setError("Lütfen tüm alanları doldurun.");
      return;
    }

    onSubmit({
      company_id: parseInt(selectedCompanyId, 10),
      branch_id: selectedBranchId,
      name: subBranchName,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-md">
      <h2 className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">
        Alt Şube Ekle
      </h2>
      {error && (
        <div className="bg-red-500 text-white p-2 rounded mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Şirket Seçimi */}
        <div>
          <label
            htmlFor="company"
            className="block text-gray-700 dark:text-gray-200 mb-2"
          >
            Şirket Seçin
          </label>
          <select
            id="company"
            value={selectedCompanyId}
            onChange={(e) => {
              setSelectedCompanyId(e.target.value);
              setSelectedBranchId(""); // Şirket değiştiğinde alt şubeyi sıfırla
            }}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                       text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="" disabled>
              Şirket Seçin
            </option>
            {companies.map((company) => (
              <option key={company.company_id} value={company.company_id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        {/* Şube Seçimi */}
        <div>
          <label
            htmlFor="branch"
            className="block text-gray-700 dark:text-gray-200 mb-2"
          >
            Şube Seçin
          </label>
          <select
            id="branch"
            value={selectedBranchId}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                       text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="" disabled>
              Şube Seçin
            </option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.branch_name}
              </option>
            ))}
          </select>
        </div>

        {/* Alt Şube Adı */}
        <div>
          <label
            htmlFor="subBranchName"
            className="block text-gray-700 dark:text-gray-200 mb-2"
          >
            Alt Şube Adı
          </label>
          <input
            id="subBranchName"
            type="text"
            value={subBranchName}
            onChange={(e) => setSubBranchName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 
                       text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Alt Şube Adı Girin"
            required
          />
        </div>

        {/* Form Düğmeleri */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition duration-200"
          >
            İptal
          </button>
          <button
            type="submit"
            className="bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 transition duration-200"
          >
            Ekle
          </button>
        </div>
      </form>
    </div>
  );
};

SubBranchForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default SubBranchForm;

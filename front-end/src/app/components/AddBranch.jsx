import React, { useState, useEffect } from "react";
import { createBranch, getAllCompanies } from "../utils/api";

const AddBranch = () => {
  const [companyId, setCompanyId] = useState("");
  const [branchName, setBranchName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getAllCompanies();
        setCompanies(data);
      } catch (err) {
        setError(err.detail || "Şirketler yüklenirken bir hata oluştu.");
      }
    };

    fetchCompanies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!companyId) {
      setError("Lütfen bir şirket seçin.");
      return;
    }

    const branchData = {
      company_id: parseInt(companyId),
      branch_name: branchName,
      address,
      city,
      phone_number: phoneNumber,
    };

    try {
      const newBranch = await createBranch(branchData);
      setSuccess("Şube başarıyla eklendi!");
      // Formu temizleme
      setCompanyId("");
      setBranchName("");
      setAddress("");
      setCity("");
      setPhoneNumber("");
    } catch (err) {
      setError(err.detail || "Şube eklenirken bir hata oluştu.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">
        Yeni Şube Ekle
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
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-2">
            Şirket Seçin
          </label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-200"
            required
          >
            <option value="">-- Şirket Seçin --</option>
            {companies.map((company) => (
              <option key={company.id} value={company.company_id}>
                {company.company}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-2">
            Şube Adı
          </label>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-200"
            placeholder="Örn: Ankara Şubesi"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-2">
            Adres
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-200"
            placeholder="Örn: Ankara Cad. No:45"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-2">
            Şehir
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-200"
            placeholder="Örn: Ankara"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-200 mb-2">
            Telefon Numarası
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 text-gray-700 dark:text-gray-200"
            placeholder="Örn: 0312 000 00 00"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded"
        >
          Şubeyi Ekle
        </button>
      </form>
    </div>
  );
};

export default AddBranch;
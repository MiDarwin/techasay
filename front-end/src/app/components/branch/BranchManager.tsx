"use client";
import React, { useState, useEffect } from "react";
import BranchForm from "./BranchForm";
import BranchTable from "./BranchTable";
import Modal from "./Modal"; // Modal bileşenini import et
import { turkishCities } from "./cities";
import {
  createBranch,
  getAllBranches,
  updateBranch,
  deleteBranch,
  getAllCompanies,
} from "../../utils/api";

const BranchManager = () => {
  const [branches, setBranches] = useState([]);
  const [branchError, setBranchError] = useState("");
  const [currentBranch, setCurrentBranch] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [cityFilter, setCityFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [branchLoading, setBranchLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchBranches = async () => {
    try {
      setBranchLoading(true);
      const data = await getAllBranches(cityFilter, searchFilter);
      setBranches(data);
      setBranchLoading(false);
    } catch (err) {
      setBranchError(err.detail || "Şubeler alınırken bir hata oluştu.");
      setBranchLoading(false);
    }
  };

  // Filtreleme butonuna tıklama
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchBranches();
  };

  const fetchCompanies = async () => {
    try {
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (err) {
      console.error("Şirketler alınırken bir hata oluştu:", err);
    }
  };

  // Şube ekleme
  const handleAddBranch = async (branchData) => {
    try {
      await createBranch(branchData);
      fetchBranches();
      setBranchError("");
      closeBranchModal(); // Güncelleme başarılıysa modalı kapat
      alert("Şube başarı ile eklendi.");
    } catch (err) {
      setBranchError(err.detail || "Şube eklenirken bir hata oluştu.");
    }
  };

  // Şube güncelleme
  const handleUpdateBranch = async (_id, updateData) => {
    try {
      await updateBranch(_id, updateData);
      fetchBranches();
      setBranchError("");
      closeBranchModal(); // Güncelleme başarılıysa modalı kapat
      alert("Şube başarı ile güncellendi.");
    } catch (err) {
      setBranchError(err.detail || "Şube güncellenirken bir hata oluştu.");
    }
  };

  // Şube silme
  const handleDeleteBranch = async (_id) => {
    if (window.confirm("Bu şubeyi silmek istediğinize emin misiniz?")) {
      try {
        await deleteBranch(_id);
        fetchBranches();
        setBranchError("");
      } catch (err) {
        setBranchError(err.detail || "Şube silinirken bir hata oluştu.");
      }
    }
  };

  // Şube güncelleme formunu açma
  const openBranchEditModal = (branch) => {
    setCurrentBranch(branch); // Güncellenecek branch verisini ayarlayın
    setIsFormVisible(true); // Formu görünür yap
  };

  // Formu kapat
  const closeBranchModal = () => {
    setIsFormVisible(false);
    setCurrentBranch(null); // Güncellenen branch verisini sıfırlayın
  };

  useEffect(() => {
    fetchCompanies();
    fetchBranches();
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-4">
        <form
          onSubmit={handleFilterSubmit}
          className="flex items-center flex-grow mr-4"
        >
          <select
            id="cityFilter"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="border p-2 mr-2"
            required
          >
            <option value="" disabled>
              Şehir Seçin
            </option>
            {turkishCities.map((city, index) => (
              <option key={index} value={city}>
                {city}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Arama (Şube Adı, Adres, Telefon Numarası)"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="border p-2 mr-2"
          />

          <button type="submit" className="bg-blue-500 text-white px-4 py-2">
            Ara
          </button>
        </form>

        <button
          onClick={() => {
            setIsFormVisible(true);
            setCurrentBranch(null); // Yeni şube eklerken mevcut branch verisini sıfırla
          }}
          className="bg-green-500 text-white px-4 py-2 rounded-md"
        >
          Şube Ekle (+)
        </button>
      </div>

      <Modal isOpen={isFormVisible} onClose={closeBranchModal}>
        <BranchForm
          onSubmit={
            currentBranch
              ? handleUpdateBranch.bind(null, currentBranch._id)
              : handleAddBranch
          }
          initialData={currentBranch || {}} // Düzenleme için mevcut veriler
          isEditMode={!!currentBranch} // Eğer currentBranch doluysa düzenleme modunda
          onCancel={closeBranchModal} // Modalı kapat
          companies={companies}
        />
      </Modal>

      {branchError && (
        <div className="bg-red-500 text-white p-3 rounded mt-4">
          {branchError}
        </div>
      )}

      <BranchTable
        branches={branches}
        companies={companies.reduce((acc, company) => {
          acc[company._id] = company.company;
          return acc;
        }, {})}
        onEdit={openBranchEditModal}
        onDelete={handleDeleteBranch}
      />
    </div>
  );
};

export default BranchManager;

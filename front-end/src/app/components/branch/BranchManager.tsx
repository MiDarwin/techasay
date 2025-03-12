import React, { useState, useEffect } from "react";
import BranchForm from "./BranchForm";
import SubBranchForm from "./SubBranchForm"; // Yeni alt şube formu bileşeni
import BranchTable from "./BranchTable";
import Modal from "./Modal";
import { turkishCities } from "./cities";
import {
  createBranch,
  createSubBranch, // Alt şube oluşturma API çağrısı
  getAllBranches,
  updateBranch,
  deleteBranch,
  getAllCompanies,
} from "../../utils/api";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import Button from "@mui/material/Button";

const BranchManager = () => {
  const [branches, setBranches] = useState([]);
  const [branchError, setBranchError] = useState("");
  const [currentBranch, setCurrentBranch] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [cityFilter, setCityFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [branchLoading, setBranchLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubBranchFormVisible, setIsSubBranchFormVisible] = useState(false); // Alt şube formu durumu

  const fetchBranches = async (city = "", search = "", company = "") => {
    try {
      setBranchLoading(true);
      const data = await getAllBranches(city, search, company);
      setBranches(data);
      setBranchLoading(false);
    } catch (err) {
      setBranchError(err.detail || "Şubeler alınırken bir hata oluştu.");
      setBranchLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches(cityFilter, searchFilter, companyFilter);
  }, [cityFilter, searchFilter, companyFilter]);

  const fetchCompanies = async () => {
    try {
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (err) {
      console.error("Şirketler alınırken bir hata oluştu:", err);
    }
  };

  const handleAddBranch = async (branchData) => {
    try {
      await createBranch(branchData);
      fetchBranches(cityFilter, searchFilter, companyFilter);
      setBranchError("");
      closeBranchModal();
      alert("Şube başarı ile eklendi.");
    } catch (err) {
      setBranchError(err.detail || "Şube eklenirken bir hata oluştu.");
    }
  };

  const handleAddSubBranch = async (subBranchData) => {
    try {
      await createSubBranch(subBranchData);
      fetchBranches(cityFilter, searchFilter, companyFilter);
      setBranchError("");
      closeSubBranchModal();
      alert("Alt şube başarı ile eklendi.");
    } catch (err) {
      setBranchError(err.detail || "Alt şube eklenirken bir hata oluştu.");
    }
  };

  const handleUpdateBranch = async (_id, updateData) => {
    try {
      await updateBranch(_id, updateData);
      fetchBranches(cityFilter, searchFilter, companyFilter);
      setBranchError("");
      closeBranchModal();
      alert("Şube başarı ile güncellendi.");
    } catch (err) {
      setBranchError(err.detail || "Şube güncellenirken bir hata oluştu.");
    }
  };

  const handleDeleteBranch = async (_id) => {
    if (window.confirm("Bu şubeyi silmek istediğinize emin misiniz?")) {
      try {
        await deleteBranch(_id);
        fetchBranches(cityFilter, searchFilter, companyFilter);
        setBranchError("");
      } catch (err) {
        setBranchError(err.detail || "Şube silinirken bir hata oluştu.");
      }
    }
  };

  const openBranchEditModal = (branch) => {
    setCurrentBranch(branch);
    setIsFormVisible(true);
  };

  const closeBranchModal = () => {
    setIsFormVisible(false);
    setCurrentBranch(null);
  };

  const openSubBranchModal = () => {
    setIsSubBranchFormVisible(true);
  };

  const closeSubBranchModal = () => {
    setIsSubBranchFormVisible(false);
  };

  useEffect(() => {
    fetchCompanies();
    fetchBranches();
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-4 p-4 rounded-lg shadow-lg bg-white border border-gray-300">
        <form className="flex items-center flex-grow mr-4">
          <select
            id="companyFilter"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="border p-2 mr-2 rounded-lg"
          >
            <option value="">Tüm Şirketler</option>
            {companies.map((company) => (
              <option key={company._id} value={company.company_id}>
                {company.name}
              </option>
            ))}
          </select>
          <select
            id="cityFilter"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="border p-2 mr-2 rounded-lg"
          >
            <option value="">Tüm Şehirler</option>
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
            className="border p-2 mr-2 rounded-lg"
          />
        </form>

        <Button
          variant="contained"
          color="success"
          onClick={() => {
            setIsFormVisible(true);
            setCurrentBranch(null);
          }}
          className="flex items-center mr-2"
        >
          <AddBusinessIcon className="mr-2" />
          Şube Ekle
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={openSubBranchModal} // Alt şube modalını aç
          className="flex items-center"
        >
          <AddBusinessIcon className="mr-2" />
          Alt Şube Ekle
        </Button>
      </div>

      {/* Şube Ekleme Modalı */}
      <Modal isOpen={isFormVisible} onClose={closeBranchModal}>
        <BranchForm
          onSubmit={
            currentBranch
              ? handleUpdateBranch.bind(null, currentBranch._id)
              : handleAddBranch
          }
          initialData={currentBranch || {}}
          isEditMode={!!currentBranch}
          onCancel={closeBranchModal}
          companies={companies}
        />
      </Modal>

      {/* Alt Şube Ekleme Modalı */}
      <Modal isOpen={isSubBranchFormVisible} onClose={closeSubBranchModal}>
        <SubBranchForm
          onSubmit={handleAddSubBranch}
          onCancel={closeSubBranchModal}
          companies={companies}
          branches={branches} // Eklenen şubeleri geçir
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
          acc[company.company_id] = company.name;
          return acc;
        }, {})}
        onEdit={openBranchEditModal}
        onDelete={handleDeleteBranch}
      />
    </div>
  );
};

export default BranchManager;

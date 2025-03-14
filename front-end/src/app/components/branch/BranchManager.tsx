import React, { useState, useEffect } from "react";
import BranchForm from "./BranchForm";
import SubBranchForm from "./SubBranchForm"; // Yeni alt şube formu bileşeni
import BranchTable from "./BranchTable";
import Modal from "./Modal";
import { turkishCities } from "./cities";
import {
  createBranch,
  createSubBranch, // Alt şube oluşturma API çağrısı
  getBranchesByCompanyId, // Güncellenmiş fonksiyonu kullan
  updateBranch,
  deleteBranch,
  getAllCompanies,
} from "../../utils/api";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import Button from "@mui/material/Button";
import HolidayVillageIcon from "@mui/icons-material/HolidayVillage";

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
      const data = await getBranchesByCompanyId(company); // Güncellenmiş API çağrısı
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
      const companyId = branchData.company_id; // Şirket ID'sini almak
      await createBranch(companyId, branchData); // API çağrısını yap
      fetchBranches(cityFilter, searchFilter, companyFilter);
      setBranchError("");
      closeBranchModal();
      alert("Şube başarı ile eklendi.");
    } catch (err) {
      setBranchError(err.detail || "Şube eklenirken bir hata oluştu.");
    }
  };
  const handleUpdateBranch = async (branch) => {
    try {
      // branch._id yerine branch.id kullanın
      await updateBranch(branch.id, {
        company_id: branch.company_id,
        name: branch.name,
        address: branch.address,
        city: branch.city,
        phone_number: branch.phone_number,
        branch_note: branch.branch_note,
        location_link: branch.location_link,
      });
      fetchBranches(cityFilter, searchFilter, companyFilter);
      setBranchError("");
      closeBranchModal();
      alert("Şube başarı ile güncellendi.");
    } catch (err) {
      setBranchError(err.detail || "Şube güncellenirken bir hata oluştu.");
    }
  };

  const handleDeleteBranch = async (id) => {
    if (window.confirm("Bu şubeyi silmek istediğinize emin misiniz?")) {
      try {
        await deleteBranch(id);
        fetchBranches(cityFilter, searchFilter, companyFilter); // Silme işlemi sonrası güncelle
        setBranchError(""); // Hata mesajını temizle
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
          <HolidayVillageIcon className="mr-2" />
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
          acc[company.id] = company.name; // Burada 'company.id' doğru mu?
          return acc;
        }, {})}
        onEdit={openBranchEditModal}
        onDelete={handleDeleteBranch} // Burada handleDeleteBranch doğru bir şekilde çağrılmalı
      />
    </div>
  );
};

export default BranchManager;

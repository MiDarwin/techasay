import React, { useState, useEffect } from "react";
import BranchForm from "./BranchForm";
import BranchTable from "./BranchTable";
import Modal from "./Modal";
import { turkishCities } from "./cities";
import {
  createBranch,
  getBranchesByCompanyId, // Güncellenmiş fonksiyonu kullan
  updateBranch,
  deleteBranch,
  getAllCompanies,
  getAllBranches,
  getAllUsersPermissions,
} from "../../utils/api";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import Button from "@mui/material/Button";
import tableStyles from "@/app/styles/tableStyles";

const BranchManager = () => {
  const [branches, setBranches] = useState([]);
  const [branchError, setBranchError] = useState("");
  const [currentBranch, setCurrentBranch] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [cityFilter, setCityFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState(""); // İlçe filtresi
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [companyFilter, setCompanyFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [branchLoading, setBranchLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [permissions, setPermissions] = useState([]); // Kullanıcı izinleri

  const fetchAllBranches = async () => {
    try {
      setBranchLoading(true); // Yüklenme durumunu göster
      const data = await getAllBranches(); // API çağrısı
      setBranches(data); // Gelen şube verilerini state'e ata
      setBranchLoading(false);
    } catch (err) {
      setBranchError(err.message || "Şubeler alınırken bir hata oluştu."); // Hata mesajını state'e ata
      setBranchLoading(false);
    }
  };
  const fetchBranches = async (
    city = "",
    districtFilter = "",
    search = "",
    company = ""
  ) => {
    try {
      setBranchLoading(true);
      console.log("Seçilen İlçe:", districtFilter);
      if (!company) {
        // Eğer companyFilter boşsa tüm şubeleri getir
        await fetchAllBranches();
      } else {
        // Eğer companyFilter doluysa şirket bazlı şubeleri getir
        const data = await getBranchesByCompanyId(
          company,
          city,
          districtFilter,
          search
        );
        setBranches(data); // Gelen şube verilerini state'e ata
      }

      setBranchLoading(false);
    } catch (err) {
      setBranchError(err.message || "Şubeler alınırken bir hata oluştu.");
      setBranchLoading(false);
    }
  };

  // useEffect, filtrelerdeki değişiklikleri izler ve API çağrısını tetikler
  useEffect(() => {
    if (!companyFilter) {
      fetchAllBranches();
    } else {
      fetchBranches(cityFilter, districtFilter, searchFilter, companyFilter);
    }
  }, [cityFilter, districtFilter, searchFilter, companyFilter]);

  const fetchCompanies = async () => {
    try {
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (err) {
      console.error("Şirketler alınırken bir hata oluştu:", err);
    }
  };
  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setCityFilter(selectedCity);
    setDistrictFilter(""); // İl değiştiğinde ilçe filtresini sıfırla
    setAvailableDistricts(turkishCities[selectedCity] || []); // Seçilen ilin ilçelerini getir
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setDistrictFilter(selectedDistrict);
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
      await updateBranch(branch.id, branch); // ID kullanarak güncelle
      fetchBranches(cityFilter, searchFilter, companyFilter);
      setBranchError("");
      closeBranchModal();
      alert("Şube başarıyla güncellendi."); // Başarı mesajı
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
    const mappedBranch = {
      ...branch,
      branch_name: branch.name, // name → branch_name olarak güncelleniyor
    };

    setCurrentBranch(mappedBranch);
    setIsFormVisible(true);
  };

  const closeBranchModal = () => {
    setIsFormVisible(false);
    setCurrentBranch(null);
  };

  useEffect(() => {
    fetchCompanies();
    fetchAllBranches();
  }, []);
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const userPermissions = await getAllUsersPermissions(); // Kullanıcı izinlerini al
        setPermissions(userPermissions); // İzinleri state'e ata
      } catch (error) {
        console.error("Kullanıcı izinleri alınırken hata oluştu:", error);
      }
    };

    fetchPermissions();
  }, []);
  return (
    <div className="flex flex-col">
      <div
        className="flex items-center mb-4 p-4 rounded-lg shadow-lg border border-gray-300"
        style={tableStyles.tableHeaderBackground}
      >
        <form
          className="flex-grow"
          style={{ display: "flex", alignItems: "center" }}
        >
          <select
            id="companyFilter"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="border p-2 mr-2 rounded-lg"
            style={tableStyles.selectInput}
          >
            <option value="">Tüm Şirketler</option>
            {companies.map((company) => (
              <option key={company.id} value={company.company_id}>
                {company.name}
              </option>
            ))}
          </select>
          <select
            id="cityFilter"
            value={cityFilter}
            onChange={handleCityChange}
            className="border p-2 mr-2 rounded-lg"
            style={tableStyles.selectInput}
          >
            <option value="">Tüm Şehirler</option>
            {Object.keys(turkishCities).map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <select
            id="districtFilter"
            value={districtFilter}
            onChange={handleDistrictChange}
            className="border p-2 mr-2 rounded-lg"
            style={tableStyles.selectInput}
            disabled={!availableDistricts.length}
          >
            <option value="">Tüm İlçeler</option>
            {availableDistricts.map((district, index) => (
              <option key={index} value={district}>
                {district}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Arama (Şube Adı, Adres, Telefon Numarası)"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="border p-2 mr-2 rounded-lg"
            style={tableStyles.textInput}
          />
        </form>
        {/* Şube Ekle Butonu */}
        {permissions.includes("branchAdd") && (
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
        )}
      </div>

      {/* Şube Ekleme Modalı */}
      <Modal isOpen={isFormVisible} onClose={closeBranchModal}>
        <BranchForm
          onSubmit={currentBranch ? handleUpdateBranch : handleAddBranch}
          initialData={currentBranch || {}}
          isEditMode={!!currentBranch}
          onCancel={closeBranchModal}
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
          acc[company.company_id] = company.name;
          return acc;
        }, {})}
        onEdit={openBranchEditModal}
        onDelete={handleDeleteBranch}
        fetchBranches={fetchBranches} // Şubeleri yeniden yükleme fonksiyonu
        handleUpdateBranch={handleUpdateBranch}
      />
    </div>
  );
};

export default BranchManager;

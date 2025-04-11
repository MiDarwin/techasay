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
  exportBranches,
} from "../../utils/api";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import Button from "@mui/material/Button";
import tableStyles from "@/app/styles/tableStyles";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
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
  const [showPopup, setShowPopup] = useState(true); // Popup başlangıçta görünsün
  const [loading, setLoading] = useState(false); // İndirme sırasında loading durumu
  const [limit, setLimit] = useState(15);
  const fetchPermissions = async () => {
    try {
      const userPermissions = await getAllUsersPermissions(); // Kullanıcı izinlerini al
      setPermissions(userPermissions); // İzinleri state'e ata
    } catch (error) {
      console.error("Kullanıcı izinleri alınırken hata oluştu:", error);
    }
  };
  const fetchAllBranches = async () => {
    try {
      if (!permissions.includes("branchViewing")) {
        setBranchError(
          "Şube bilgilerini görüntüleme yetkiniz yok. Lütfen sistem yöneticisi ile iletişime geçin."
        );
        return;
      }
      setBranchError(""); // Hata mesajını temizle

      setBranchLoading(true); // Yüklenme durumunu göster
      const data = await getAllBranches(limit); // limit'i API çağrısına ekle
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
      if (!permissions.includes("branchViewing")) {
        setBranchError(
          "Şube bilgilerini görüntüleme yetkiniz yok. Lütfen sistem yöneticisi ile iletişime geçin."
        );
        return;
      }
      setBranchError(""); // Hata mesajını temizle
      setBranchLoading(true);
      console.log("Seçilen İlçe:", districtFilter);
      if (!company) {
        // Eğer companyFilter boşsa tüm şubeleri getir
        await fetchAllBranches();
      } else {
        // Eğer companyFilter doluysa şirket bazlı şubeleri getir
        const data = await getBranchesByCompanyId(
          company,
          limit,
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
  }, [cityFilter, districtFilter, searchFilter, companyFilter, limit]);

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
  const handleUpdateBranch = async (branchId, updatedData) => {
    try {
      await updateBranch(branchId, updatedData);
      const updatedBranches = await fetchBranches();
      setBranches(updatedBranches);
      alert("Şube başarıyla güncellendi.");
    } catch (error) {
      console.error("Şube güncellenirken hata oluştu:", error);
    }
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
    fetchBranches(cityFilter, districtFilter, searchFilter, companyFilter);
  };

  useEffect(() => {
    if (permissions.length > 0) {
      // İzinler yüklendikten sonra fetch et
      fetchCompanies();
      fetchAllBranches();
    }
  }, [permissions]);

  useEffect(() => {
    fetchPermissions();
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(false);
    }, 4000); // 4 saniye sonra popup'u kapat

    return () => clearTimeout(timer);
  }, []);

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleExport = async () => {
    try {
      setLoading(true); // İndirme işlemi başladı
      await exportBranches(companyFilter, cityFilter, districtFilter); // Excel dosyasını indir
      alert("Excel dosyası başarıyla indirildi!");
    } catch (err) {
      console.error(err.message);
      alert(err.message || "Excel dosyası indirilirken bir hata oluştu.");
    } finally {
      setLoading(false); // İndirme işlemi bitti
    }
  };
  return (
    <div className="flex flex-col">
      {showPopup && (
        <div
          className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg cursor-pointer"
          onClick={handleClosePopup}
        >
          Filtreleme işlemleri için bir şirket seçmeniz lazım.
        </div>
      )}
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
          <select
            id="limitFilter"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border p-2 mr-2 rounded-lg"
            style={tableStyles.selectInput}
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={40}>40</option>
          </select>
          <Tooltip
            title={loading ? "İndiriliyor..." : "Excel Olarak İndir"}
            arrow
          >
            <span>
              <IconButton
                onClick={handleExport}
                disabled={loading} // İndirme sırasında buton devre dışı
                style={{
                  color: loading ? "#ddd" : "#007bff",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                <FileDownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
        </form>
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

      <Modal isOpen={isFormVisible} onClose={closeBranchModal}>
        <BranchForm
          onSubmit={currentBranch ? handleUpdateBranch : handleAddBranch}
          initialData={currentBranch || {}}
          isEditMode={!!currentBranch}
          onCancel={closeBranchModal}
          companies={companies}
        />
      </Modal>
      {branchLoading && <div>Yükleniyor...</div>}

      {branchError && (
        <div className="bg-red-500 text-white p-2 rounded mt-3">
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
        cityFilter={cityFilter} // Filtreleri ekleyin
        districtFilter={districtFilter}
        searchFilter={searchFilter}
        companyFilter={companyFilter}
        fetchBranches={fetchBranches} // fetchBranches fonksiyonunu geçiyoruz
      />
    </div>
  );
};

export default BranchManager;

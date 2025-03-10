"use client";
import React, { useState, useEffect } from "react";
import BranchForm from "./BranchForm";
import BranchTable from "./BranchTable";
import {
  createBranch,
  getAllBranches,
  updateBranch,
  deleteBranch,
  getInventoryByBranch,
  getAllCompanies,
} from "../../utils/api";
const BranchManager = () => {
  const [branches, setBranches] = useState([]);
  const [branchError, setBranchError] = useState("");
  const [isBranchEditMode, setIsBranchEditMode] = useState(false);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [cityFilter, setCityFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [branchNameFilter, setBranchNameFilter] = useState("");
  const [branchLoading, setBranchLoading] = useState(false);
  const fetchBranches = async () => {
    try {
      setBranchLoading(true);
      const data = await getAllBranches(cityFilter, searchFilter); // Hem şehir hem de genel arama parametrelerini gönderiyoruz
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
      const data = await getAllCompanies(); // Şirketleri backend'den çekiyoruz
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
    } catch (err) {
      setBranchError(err.detail || "Şube eklenirken bir hata oluştu.");
    }
  };
  const turkishCities = [
    "Adana",
    "Adıyaman",
    "Afyonkarahisar",
    "Ağrı",
    "Amasya",
    "Ankara",
    "Antalya",
    "Artvin",
    "Aydın",
    "Balıkesir",
    "Bilecik",
    "Bingöl",
    "Bitlis",
    "Bolu",
    "Burdur",
    "Bursa",
    "Çanakkale",
    "Çankırı",
    "Çorum",
    "Denizli",
    "Diyarbakır",
    "Edirne",
    "Elazığ",
    "Erzincan",
    "Erzurum",
    "Eskişehir",
    "Gaziantep",
    "Giresun",
    "Gümüşhane",
    "Hakkâri",
    "Hatay",
    "Isparta",
    "Mersin",
    "İstanbul",
    "İzmir",
    "Kars",
    "Kastamonu",
    "Kayseri",
    "Kırklareli",
    "Kırşehir",
    "Kocaeli",
    "Konya",
    "Kütahya",
    "Malatya",
    "Manisa",
    "Kahramanmaraş",
    "Mardin",
    "Muğla",
    "Muş",
    "Nevşehir",
    "Niğde",
    "Ordu",
    "Rize",
    "Sakarya",
    "Samsun",
    "Siirt",
    "Sinop",
    "Sivas",
    "Tekirdağ",
    "Tokat",
    "Trabzon",
    "Tunceli",
    "Şanlıurfa",
    "Uşak",
    "Van",
    "Yozgat",
    "Zonguldak",
    "Aksaray",
    "Bayburt",
    "Karaman",
    "Kırıkkale",
    "Batman",
    "Şırnak",
    "Bartın",
    "Ardahan",
    "Iğdır",
    "Yalova",
    "Karabük",
    "Kilis",
    "Osmaniye",
    "Düzce",
  ];
  // Şube güncelleme
  const handleUpdateBranch = async (_id, updateData) => {
    try {
      await updateBranch(_id, updateData);
      fetchBranches();
      setIsBranchEditMode(false);
      setCurrentBranch(null);
      setBranchError("");
    } catch (err) {
      console.error("Şube güncellenirken hata oluştu:", err);
      if (err.response && err.response.data && err.response.data.detail) {
        const errorMessages = err.response.data.detail
          .map((detail) => detail.msg)
          .join(", ");
        setBranchError(errorMessages);
      } else {
        setBranchError("Şube güncellenirken bir hata oluştu.");
      }
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
    setIsBranchEditMode(true);
    setCurrentBranch(branch);
  };

  // Şube güncelleme formunu kapatma
  const closeBranchEditModal = () => {
    setIsBranchEditMode(false);
    setCurrentBranch(null);
  };

  useEffect(() => {
    fetchCompanies();
    fetchBranches();
  }, []);

  return (
    <div>
      <form onSubmit={handleFilterSubmit} className="mb-4">
        <select
          id="city"
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="border p-2 mr-2"
          required
        >
          <option value="" disabled>
            Şehir Seçin
          </option>
          {turkishCities.map((cityName, index) => (
            <option key={index} value={cityName}>
              {cityName}
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
      <BranchForm
        onSubmit={
          isBranchEditMode
            ? (updateData) => handleUpdateBranch(currentBranch._id, updateData)
            : handleAddBranch
        }
        initialData={currentBranch || {}}
        isEditMode={isBranchEditMode}
        onCancel={closeBranchEditModal}
        companies={companies}
      />
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

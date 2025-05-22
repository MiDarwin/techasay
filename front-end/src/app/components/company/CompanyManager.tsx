"use client";
import React, { useState, useEffect } from "react";
import CompanyForm from "./CompanyForm";
import CompanyTable from "./CompanyTable";
import Modal from "./Modal"; // Modal bileşenini import et
import {
  createCompany,
  getAllCompanies,
  updateCompany,
  deleteCompany,
  getAllUsersPermissions,
} from "../../utils/api";
import TextField from "@mui/material/TextField"; // MUI TextField bileşeni
import AddIcon from "@mui/icons-material/Add"; // Ekleme ikonu
import Button from "@mui/material/Button"; // MUI Button bileşeni
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import tableStyles from "@/app/styles/tableStyles";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
const CompanyManager = () => {
  const [companies, setCompanies] = useState([]);
  const [companyError, setCompanyError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false); // Modal görünürlüğü için durum
  const [searchTerm, setSearchTerm] = useState(""); // Arama terimi durumu
  const [permissions, setPermissions] = useState([]); // Kullanıcı izinleri
  const [view, setView] = useState<"card" | "list">("card");

  const fetchCompanies = async () => {
    try {
      if (!permissions.includes("companyViewing")) {
        setCompanyError(
          "Şirket bilgilerini görüntüleme yetkiniz yok. Lütfen sistem yöneticisi ile iletişime geçin."
        );
        return;
      }
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (err) {
      setCompanyError(err.detail || "Şirketler alınırken hata oluştu.");
    }
  };

  useEffect(() => {
    if (permissions.length > 0) {
      // İzinler yüklendi mi kontrol et
      fetchCompanies();
    }
  }, [permissions]);

  const handleAddCompany = async (companyData) => {
    try {
      await createCompany(companyData);
      fetchCompanies();
      setCompanyError("");
      closeFormModal(); // Modalı kapat
    } catch (err) {
      setCompanyError(err.detail || "Şirket eklenirken hata oluştu.");
    }
  };

  const handleUpdateCompany = async (company_id, updateData) => {
    try {
      await updateCompany(company_id, updateData); // company_id kullan
      fetchCompanies();
      setIsEditMode(false);
      setCurrentCompany(null);
      closeFormModal(); // Modalı kapat
    } catch (err) {
      setCompanyError(err.detail || "Şirket güncellenirken hata oluştu.");
    }
  };

  const handleDeleteCompany = async (company_id) => {
    try {
      await deleteCompany(company_id); // company_id kullan
      fetchCompanies();
    } catch (err) {
      setCompanyError(err.detail || "Şirket silinirken hata oluştu.");
    }
  };

  const openEditModal = (company) => {
    setIsEditMode(true);
    setCurrentCompany(company);
    setIsFormVisible(true); // Modalı aç
  };

  const closeFormModal = () => {
    setIsEditMode(false);
    setCurrentCompany(null);
    setIsFormVisible(false); // Modalı kapat
  };

  // Şirketleri arama terimine göre filtreleme
  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const userPermissions = await getAllUsersPermissions();
        setPermissions(userPermissions);
      } catch (error) {
        console.error("Kullanıcı izinleri alınırken hata oluştu:", error);
      }
    };

    fetchPermissions();
  }, []);
  const sectionStyle =
    view === "card"
      ? { backgroundColor: "#EDF2F7" } // card modunda grey.50
      : { backgroundColor: "#E7F6F2" };
  return (
    <div className="flex flex-col">
      <div
        className="flex items-center mb-4 p-4 rounded-lg shadow-lg border border-gray-300"
        style={sectionStyle}
      >
        <input
          type="text"
          placeholder="Şirket Ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mr-4"
          style={tableStyles.textInput}
        />
        {/* Sağdaki grup: toggle + buton */}
        <div className="ml-auto flex items-center space-x-2">
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, v) => v && setView(v)}
          >
            <ToggleButton value="card">
              <ViewModuleIcon /> Kart
            </ToggleButton>
            <ToggleButton value="list">
              <TableRowsIcon /> Liste
            </ToggleButton>
          </ToggleButtonGroup>

          {permissions.includes("companyAdd") && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                setIsEditMode(false); // Yeni ekleme için mod değiştir
                setIsFormVisible(true); // Modalı aç
              }}
              className="flex items-center"
            >
              <DomainAddIcon className="mr-2" />
              Şirket Ekle
            </Button>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={isFormVisible} onClose={closeFormModal}>
        <CompanyForm
          onSubmit={isEditMode ? handleUpdateCompany : handleAddCompany}
          initialData={currentCompany || {}}
          isEditMode={isEditMode}
          onCancel={closeFormModal}
        />
      </Modal>

      {/* Hata mesajı */}
      {companyError && (
        <div className="bg-red-500 text-white p-2 rounded mt-3">
          {companyError}
        </div>
      )}

      {/* Liste */}
      <CompanyTable
        companies={filteredCompanies} // Filtrelenmiş şirketleri göster
        onEdit={openEditModal}
        onDelete={handleDeleteCompany}
        view={view}
      />
    </div>
  );
};

export default CompanyManager;

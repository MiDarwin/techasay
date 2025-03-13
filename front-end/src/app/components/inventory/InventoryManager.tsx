"use client";

import React, { useState, useEffect } from "react";
import InventoryList from "./InventoryList"; // Envanter Listesi Bileşeni
import AddInventoryModal from "./AddInventoryModal"; // Envanter Ekleme Modalı
import UpdateInventoryModal from "./UpdateInventoryModal"; // Envanter Güncelleme Modalı
import {
  getAllInventory,
  getAllBranches,
  getAllCompanies,
  getBranchesByCompanyId,
  deleteInventory,
} from "../../utils/api"; // API çağrıları
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  TextField,
} from "@mui/material"; // MUI bileşenleri
import DomainAddIcon from "@mui/icons-material/DomainAdd";

const InventoryManager = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [branches, setBranches] = useState([]); // Şube listesi
  const [isInventoryAddModalOpen, setIsInventoryAddModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [activeInventoryBranch, setActiveInventoryBranch] = useState(""); // "" için 'All' seçeneği
  const [allInventories, setAllInventories] = useState([]); // Tüm envanterler
  const [filteredInventories, setFilteredInventories] = useState([]); // Filtrelenmiş envanterler
  const [searchTerm, setSearchTerm] = useState(""); // Arama terimi
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState("");
  const [inventoriesLoading, setInventoriesLoading] = useState(false);
  const [inventoriesError, setInventoriesError] = useState("");
  const [companies, setCompanies] = useState([]); // Şirket listesi
  const [selectedCompanyId, setSelectedCompanyId] = useState(""); // Seçilen Şirket ID'si

  // Şirketleri alma
  const fetchCompanies = async () => {
    try {
      const companyData = await getAllCompanies();
      setCompanies(companyData);
    } catch (err) {
      setInventoriesError(
        err.message || "Şirketler alınırken bir hata oluştu."
      );
    }
  };

  // Şubeleri alma
  const fetchBranches = async (companyId) => {
    try {
      const data = await getBranchesByCompanyId(companyId);
      setBranches(data);
    } catch (err) {
      console.error(err); // Hata mesajını kontrol edin
      setInventoriesError(err.message || "Şubeler alınırken bir hata oluştu.");
    }
  };
  // Envanteri silme fonksiyonu
  const handleInventoryDelete = async (inventoryId) => {
    try {
      await deleteInventory(inventoryId); // Envanteri sil
      handleInventoryDeleted(); // Silme işleminden sonra envanterleri güncelle
    } catch (err) {
      // Hata durumunda bir mesaj göstermek için hata yakalayın
      setInventoriesError(
        err.response?.data?.detail || "Envanter silinirken bir hata oluştu."
      );
    }
  };
  // Tüm Envanterleri Çekme Fonksiyonu
  const fetchAllInventories = async () => {
    try {
      setInventoriesLoading(true);
      const data = await getAllInventory();
      setAllInventories(data);
      setFilteredInventories(data);
      setInventoriesLoading(false);
    } catch (err) {
      setInventoriesError(
        err.response?.data?.detail || "Envanterler alınırken bir hata oluştu."
      );
      setInventoriesLoading(false);
    }
  };

  // İlk açılışta şubeleri ve tüm envanterleri yükle
  useEffect(() => {
    fetchCompanies();
    fetchAllInventories();
  }, []);
  // Seçilen şirket değiştiğinde şubeleri al
  useEffect(() => {
    if (selectedCompanyId) {
      fetchBranches(selectedCompanyId);
    } else {
      setBranches([]); // Şirket seçilmediyse şubeleri temizle
    }
  }, [selectedCompanyId]);
  // Şube seçimi değiştiğinde envanterleri filtrele
  useEffect(() => {
    if (activeInventoryBranch === "") {
      setFilteredInventories(allInventories);
    } else {
      const filtered = allInventories.filter(
        (inventory) => inventory.branch_id === activeInventoryBranch
      );
      setFilteredInventories(filtered);
    }
  }, [activeInventoryBranch, allInventories]);

  // Arama terimi ile filtreleme
  useEffect(() => {
    const filtered = allInventories.filter((inventory) =>
      inventory.device_type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInventories(filtered);
  }, [searchTerm, allInventories]);

  const openInventoryAddModal = () => {
    setIsInventoryAddModalOpen(true);
  };

  const closeInventoryAddModal = () => {
    setIsInventoryAddModalOpen(false);
  };

  const handleInventoryAdded = () => {
    fetchAllInventories();
  };

  const handleInventoryUpdated = () => {
    fetchAllInventories();
    setSelectedInventory(null);
  };

  const handleInventoryDeleted = () => {
    fetchAllInventories();
  };

  return (
    <div>
      <main>
        {activeTab === "inventory" && (
          <Box sx={{ padding: 2 }}>
            {/* Filtreleme ve Ekleme Alanı */}
            <div className="flex items-center justify-between mb-4 p-2 rounded-lg shadow-lg bg-white border border-gray-300">
              {/* Şirket Seçimi */}
              <FormControl
                variant="outlined"
                margin="normal"
                sx={{ minWidth: 150 }} // Genişliği küçült
              >
                <InputLabel>Şirket Seçin</InputLabel>
                <Select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  label="Şirket Seçin"
                  sx={{ height: "40px" }} // Select bileşeninin yüksekliği
                >
                  <MenuItem value="">
                    <em>Tüm Şirketler</em>
                  </MenuItem>
                  {companies.map((company) => (
                    <MenuItem
                      key={company.company_id}
                      value={company.company_id}
                    >
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Şube Seçimi */}
              <FormControl
                variant="outlined"
                margin="normal"
                sx={{ minWidth: 150 }} // Genişliği küçült
              >
                <InputLabel>Şube Seçin</InputLabel>
                <Select
                  value={activeInventoryBranch}
                  onChange={(e) => setActiveInventoryBranch(e.target.value)}
                  label="Şube Seçin"
                  sx={{ height: "40px" }} // Select bileşeninin yüksekliği
                >
                  <MenuItem value="">
                    <em>Tüm Şubeler</em>
                  </MenuItem>
                  {branches.map((branch) => (
                    <MenuItem key={branch._id} value={branch._id}>
                      {branch.branch_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Ekle Butonu */}
              <Button
                variant="contained"
                color="success"
                onClick={openInventoryAddModal}
                className="flex items-center"
                size="small" // Buton boyutunu küçült
              >
                <AddIcon className="mr-1" /> {/* İkonu ekle */}
                Ekle
              </Button>
            </div>

            {/* Envanter Listesi */}
            <div>
              {inventoriesLoading ? (
                <CircularProgress />
              ) : inventoriesError ? (
                <Typography color="error">{inventoriesError}</Typography>
              ) : (
                <InventoryList
                  inventories={filteredInventories}
                  onEdit={setSelectedInventory}
                  onDelete={handleInventoryDelete}
                />
              )}
            </div>

            {/* Envanter Ekleme Modalı */}
            {isInventoryAddModalOpen && (
              <AddInventoryModal
                branches={branches}
                onClose={closeInventoryAddModal}
                onInventoryAdded={handleInventoryAdded}
              />
            )}

            {/* Envanter Güncelleme Modalı */}
            {selectedInventory && (
              <UpdateInventoryModal
                inventory={selectedInventory}
                onClose={() => setSelectedInventory(null)}
                onInventoryUpdated={handleInventoryUpdated}
              />
            )}
          </Box>
        )}
      </main>
    </div>
  );
};

export default InventoryManager;

"use client";

import React, { useState, useEffect } from "react";
import InventoryList from "./InventoryList"; // Envanter Listesi Bileşeni
import AddInventoryModal from "./AddInventoryModal"; // Envanter Ekleme Modalı
import UpdateInventoryModal from "./UpdateInventoryModal"; // Envanter Güncelleme Modalı
import {
  getAllInventory,
  getAllBranches,
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

  // Şube listesini çekme fonksiyonu
  const fetchBranches = async () => {
    try {
      setBranchesLoading(true);
      const data = await getAllBranches();
      setBranches(data);
      setBranchesLoading(false);
    } catch (err) {
      setBranchesError(
        err.response?.data?.detail || "Şubeler alınırken bir hata oluştu."
      );
      setBranchesLoading(false);
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
    fetchBranches();
    fetchAllInventories();
  }, []);

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

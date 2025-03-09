// InventoryManager.tsx

"use client"; // Next.js 13 için client component olduğunu belirtir

import React, { useState, useEffect } from "react";
import InventoryList from "./InventoryList"; // Envanter Listesi Bileşeni
import AddInventoryModal from "./AddInventoryModal"; // Envanter Ekleme Modalı
import UpdateInventoryModal from "./UpdateInventoryModal"; // Envanter Güncelleme Modalı
import {
  getAllInventory,
  getAllBranches,
  deleteInventory,
} from "../../utils/api"; // API çağrıları

const InventoryManager = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [branches, setBranches] = useState([]); // Şube listesi
  const [isInventoryAddModalOpen, setIsInventoryAddModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [activeInventoryBranch, setActiveInventoryBranch] = useState(""); // "" için 'All' seçeneği
  const [allInventories, setAllInventories] = useState([]); // Tüm envanterler
  const [filteredInventories, setFilteredInventories] = useState([]); // Filtrelenmiş envanterler
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
      // Tüm envanterleri göster
      setFilteredInventories(allInventories);
    } else {
      // Seçili şubeye ait envanterleri filtrele
      const filtered = allInventories.filter(
        (inventory) => inventory.branch_id === activeInventoryBranch
      );
      setFilteredInventories(filtered);
    }
  }, [activeInventoryBranch, allInventories]);

  // Envanter Ekleme Fonksiyonları
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

  // Envanter Silme Fonksiyonu
  const handleInventoryDeleted = () => {
    fetchAllInventories();
  };

  return (
    <div>
      <div>
        <main>
          {activeTab === "inventory" && (
            <div className="space-y-6">
              {/* Şube Seçimi */}
              <div className="mb-4">
                <label className="text-xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">
                  Envanterlerini Görüntülemek İstediğiniz Şubeyi Seçin:
                </label>
                <select
                  value={activeInventoryBranch}
                  onChange={(e) => setActiveInventoryBranch(e.target.value)}
                  className="block text-gray-700 dark:text-gray-200 mb-2"
                >
                  <option value="">Tüm Şubeler</option> {/* 'All' seçeneği */}
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Envanter Listesi */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Envanter Listesi</h2>
                  <button
                    onClick={openInventoryAddModal}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Envanter Ekle
                  </button>
                </div>

                {/* Envanter Yükleniyor veya Hata */}
                {inventoriesLoading ? (
                  <p>Envanterler yükleniyor...</p>
                ) : inventoriesError ? (
                  <p className="text-red-500">{inventoriesError}</p>
                ) : (
                  <InventoryList
                    inventories={filteredInventories} // Filtrelenmiş envanterler
                    onEdit={setSelectedInventory}
                    onDelete={handleInventoryDeleted} // onDelete prop'u ekleniyor
                  />
                )}
              </div>

              {/* Envanter Ekleme Modalı */}
              {isInventoryAddModalOpen && (
                <AddInventoryModal
                  branches={branches} // Şubeleri prop olarak geçiyoruz
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
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InventoryManager;

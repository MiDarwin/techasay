"use client"; // Next.js 13 için client component olduğunu belirtir

import React, { useState, useEffect } from "react";
import InventoryList from "./InventoryList"; // Envanter Listesi Bileşeni
import AddInventoryModal from "./AddInventoryModal"; // Envanter Ekleme Modalı
import UpdateInventoryModal from "./UpdateInventoryModal"; // Envanter Güncelleme Modalı
import { getInventoryByBranch, getAllBranches } from "../../utils/api"; // API çağrıları

const InventoryManager = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [branches, setBranches] = useState([]); // Şube listesi
  const [isInventoryAddModalOpen, setIsInventoryAddModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [activeInventoryBranch, setActiveInventoryBranch] = useState(null);
  const [inventories, setInventories] = useState([]); // Envanter listesi
  const [branchIdForInventory, setBranchIdForInventory] = useState(null);
  const [branchLoading, setBranchLoading] = useState(false);
  const [branchError, setBranchError] = useState("");
  useEffect(() => {
    console.log("Gelen branches verisi:", branches);
  }, [branches]);

  // Şube listesini çekme fonksiyonu
  const fetchBranches = async () => {
    try {
      setBranchLoading(true);
      const data = await getAllBranches();
      setBranches(data);
      setBranchLoading(false);
    } catch (err) {
      setBranchError(err.detail || "Şubeler alınırken bir hata oluştu.");
      setBranchLoading(false);
    }
  };

  // Envanter Listeleme Fonksiyonu
  const fetchInventories = async (branchId) => {
    try {
      const data = await getInventoryByBranch(branchId); // API çağrısı
      setInventories(data);
    } catch (error) {
      console.error("Envanterler alınırken hata oluştu:", error);
    }
  };

  // İlk açılışta şubeleri yükle
  useEffect(() => {
    fetchBranches();
  }, []);

  // Seçili şube değiştiğinde envanterleri yükle
  useEffect(() => {
    if (activeTab === "inventory" && activeInventoryBranch) {
      fetchInventories(activeInventoryBranch);
    }
  }, [activeTab, activeInventoryBranch]);

  // Envanter Ekleme Fonksiyonları
  const openInventoryAddModal = (branch_id) => {
    setBranchIdForInventory(branch_id);
    setIsInventoryAddModalOpen(true);
  };

  const closeInventoryAddModal = () => {
    setIsInventoryAddModalOpen(false);
    setBranchIdForInventory(null);
  };

  const handleInventoryAdded = () => {
    fetchInventories(activeInventoryBranch);
  };

  const handleInventoryUpdated = () => {
    fetchInventories(activeInventoryBranch);
    setSelectedInventory(null);
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
                  value={activeInventoryBranch || ""}
                  onChange={(e) => setActiveInventoryBranch(e.target.value)}
                  className="block text-gray-700 dark:text-gray-200 mb-2"
                >
                  <option value="" disabled>
                    Şube Seçin
                  </option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branch_name}{" "}
                      {/* branchName değil, branch_name kullanmalısın */}
                    </option>
                  ))}
                </select>
              </div>

              {/* Envanter Listesi */}
              {activeInventoryBranch && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold">Envanter Listesi</h2>
                    <button
                      onClick={() =>
                        openInventoryAddModal(activeInventoryBranch)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                      Envanter Ekle
                    </button>
                  </div>

                  {/* InventoryList bileşeni */}
                  <InventoryList
                    branchId={activeInventoryBranch}
                    inventories={inventories} // Envanter listesi eklendi
                    onEdit={setSelectedInventory}
                  />
                </div>
              )}

              {/* Envanter Ekleme Modalı */}
              {isInventoryAddModalOpen && (
                <AddInventoryModal
                  branchId={branchIdForInventory}
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

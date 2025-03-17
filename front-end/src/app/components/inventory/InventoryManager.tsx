"use client";

import React, { useState, useEffect } from "react";
import InventoryList from "./InventoryList";
import AddInventoryModal from "./AddInventoryModal";
import UpdateInventoryModal from "./UpdateInventoryModal";
import {
  getAllInventory,
  getAllCompanies,
  getBranchesByCompanyId,
  deleteInventory,
  getInventoryByBranch,
} from "../../utils/api";
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
} from "@mui/material";

const InventoryManager = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [branches, setBranches] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [allInventories, setAllInventories] = useState([]);
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [inventoriesLoading, setInventoriesLoading] = useState(false);
  const [inventoriesError, setInventoriesError] = useState("");
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [isInventoryAddModalOpen, setIsInventoryAddModalOpen] = useState(false);

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

  const fetchAllInventories = async (companyName = "", branchName = "") => {
    try {
      setInventoriesLoading(true);

      let allInventories = [];

      // Seçilen şube bilgilerini bul
      const selectedBranchDetails = branches.find(
        (branch) => branch.name === branchName
      );

      if (selectedBranchDetails) {
        if (selectedBranchDetails.has_sub_branches) {
          // Eğer şube alt şubelere sahipse getInventoryByBranch çağır
          allInventories = await getInventoryByBranch(selectedBranchDetails.id);
        } else {
          // Normal şubeler için getAllInventory çağır
          allInventories = await getAllInventory(companyName, branchName);
        }
      } else {
        // Eğer şube seçilmemişse tüm envanteri çek
        allInventories = await getAllInventory(companyName, branchName);
      }

      setAllInventories(allInventories);
      setFilteredInventories(allInventories);
    } catch (err) {
      setInventoriesError(
        err.message || "Envanterler alınırken bir hata oluştu."
      );
    } finally {
      setInventoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchAllInventories();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      const selectedCompany = companies.find(
        (company) => company.company_id === selectedCompanyId
      );
      fetchAllInventories(selectedCompany?.name || "");
      fetchBranches(selectedCompanyId);
    } else {
      setBranches([]);
      fetchAllInventories();
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    if (selectedCompanyId && selectedBranch) {
      const selectedCompany = companies.find(
        (company) => company.company_id === selectedCompanyId
      );
      fetchAllInventories(selectedCompany?.name || "", selectedBranch);
    }
  }, [selectedBranch]);
  const handleDeleteInventory = async (inventoryId) => {
    if (window.confirm("Bu envanteri silmek istediğinizden emin misiniz?")) {
      try {
        await deleteInventory(inventoryId); // API çağrısı
        alert("Envanter başarıyla silindi!");
        fetchAllInventories(
          companies.find((company) => company.company_id === selectedCompanyId)
            ?.name || "",
          selectedBranch
        ); // Listeyi yenile
      } catch (err) {
        console.error("Envanter silinirken bir hata oluştu:", err);
        alert("Envanter silinirken bir hata oluştu.");
      }
    }
  };
  const fetchBranches = async (companyId) => {
    try {
      const branchData = await getBranchesByCompanyId(companyId);
      setBranches(branchData);
    } catch (err) {
      console.error("Şubeler alınırken hata oluştu:", err);
    }
  };

  return (
    <div>
      <main>
        {activeTab === "inventory" && (
          <Box sx={{ padding: 2 }}>
            <div
              className="flex items-center justify-between mb-4 p-2 rounded-lg shadow-md border"
              style={{
                backgroundColor: "#F8F1E4", // Arka plan rengi
                boxShadow: "0px 4px 10px rgba(0, 0, 0.2)", // Hafif gölge efekti
                borderColor: "#A5B68D", // Çerçeve rengi
                height: "auto", // Daha az yükseklik
              }}
            >
              {/* Şirket ve Şube Seçimi */}
              <div className="flex items-center gap-4">
                {/* Şirket Seçimi */}
                <FormControl
                  variant="outlined"
                  margin="normal"
                  sx={{ minWidth: 150 }}
                >
                  <InputLabel>Şirket Seçin</InputLabel>
                  <Select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    label="Şirket Seçin"
                    sx={{ height: "40px" }}
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
                  sx={{ minWidth: 150 }}
                >
                  <InputLabel>Şube Seçin</InputLabel>
                  <Select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    label="Şube Seçin"
                    sx={{ height: "40px" }}
                    disabled={!selectedCompanyId || branches.length === 0}
                  >
                    <MenuItem value="">
                      <em>Tüm Şubeler</em>
                    </MenuItem>
                    {branches.map((branch) => (
                      <MenuItem key={branch.id} value={branch.name}>
                        {branch.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>

              {/* Envanter Ekle Butonu */}
              <Button
                variant="contained"
                color="success"
                onClick={() => setIsInventoryAddModalOpen(true)}
                className="flex items-center"
                size="small"
                sx={{ height: "40px", ml: "auto" }} // Butonu en sağa almak için margin-left: auto
              >
                <AddIcon className="mr-1" />
                Envanter Ekle
              </Button>
              {isInventoryAddModalOpen && (
                <AddInventoryModal
                  open={isInventoryAddModalOpen}
                  onClose={() => setIsInventoryAddModalOpen(false)}
                  companies={companies}
                  selectedCompanyId={selectedCompanyId}
                  selectedBranchName={selectedBranch} // Şube adını gönderiyoruz
                  onInventoryAdded={() =>
                    fetchAllInventories(
                      companies.find(
                        (company) => company.company_id === selectedCompanyId
                      )?.name || "",
                      selectedBranch
                    )
                  }
                />
              )}
            </div>

            {/* Envanter Listesi ve Yüklenme Durumu */}
            <div>
              {inventoriesLoading ? (
                <CircularProgress />
              ) : inventoriesError ? (
                <Typography color="error">{inventoriesError}</Typography>
              ) : (
                <InventoryList
                  inventories={filteredInventories}
                  onEdit={setSelectedInventory}
                  onDelete={handleDeleteInventory}
                />
              )}
            </div>

            {/* Envanter Güncelle Modal */}
            {selectedInventory && (
              <UpdateInventoryModal
                open={!!selectedInventory}
                onClose={() => setSelectedInventory(null)}
                inventory={selectedInventory}
                onInventoryUpdated={() =>
                  fetchAllInventories(
                    companies.find(
                      (company) => company.company_id === selectedCompanyId
                    )?.name || "",
                    selectedBranch
                  )
                }
              />
            )}
          </Box>
        )}
      </main>
    </div>
  );
};

export default InventoryManager;

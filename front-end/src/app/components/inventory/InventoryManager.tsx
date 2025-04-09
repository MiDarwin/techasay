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
  getAllUsersPermissions,
  getArchivedInventory,
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
  IconButton,
  Drawer,
  List,
  Typography,
  ListItem,
  ListItemText,
} from "@mui/material";
import tableStyles from "@/app/styles/tableStyles";
import HistoryIcon from "@mui/icons-material/History"; // Kum saati simgesi için

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
  const [permissions, setPermissions] = useState([]); // Kullanıcı izinleri
  const [archivedInventories, setArchivedInventories] = useState([]);
  const [isArchiveDrawerOpen, setIsArchiveDrawerOpen] = useState(false);

  // Arşivlenmiş envanterleri çekme fonksiyonu
  const fetchArchivedInventories = async () => {
    try {
      const archivedData = await getArchivedInventory();
      setArchivedInventories(archivedData);
    } catch (err) {
      console.error("Arşivlenmiş envanterler alınırken hata oluştu:", err);
    }
  };

  // Kum saati simgesine tıklanınca arşiv çek ve drawer aç
  const handleOpenArchive = async () => {
    await fetchArchivedInventories();
    setIsArchiveDrawerOpen(true);
  };
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

      if (!permissions.includes("inventoryViewing")) {
        setInventoriesError(
          "Envanter bilgilerini görüntüleme yetkiniz yok. Lütfen sistem yöneticisi ile iletişime geçin."
        );
        setAllInventories([]); // Tablo boş olacak
        setFilteredInventories([]); // Filtrelenmiş de boş olacak
        return; // Alttaki kodlar çalışmasın
      }

      let allInventories = [];

      const selectedBranchDetails = branches.find(
        (branch) => branch.name === branchName
      );

      if (selectedBranchDetails) {
        if (selectedBranchDetails.has_sub_branches) {
          allInventories = await getInventoryByBranch(selectedBranchDetails.id);
        } else {
          allInventories = await getAllInventory(companyName, branchName);
        }
      } else {
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
    if (!inventoryId) {
      console.error("Silme işlemi için geçersiz envanter ID'si:", inventoryId);
      alert("Silme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.");
      return;
    }
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
  useEffect(() => {
    if (selectedBranch === "") {
      // Şube seçimi "Tüm Şubeler" olduğunda sadece şirkete göre filtreleme yap
      const selectedCompany = companies.find(
        (company) => company.company_id === selectedCompanyId
      );
      fetchAllInventories(selectedCompany?.name || "");
    } else if (selectedCompanyId && selectedBranch) {
      // Belirli bir şube seçildiğinde filtreleme yap
      const selectedCompany = companies.find(
        (company) => company.company_id === selectedCompanyId
      );
      fetchAllInventories(selectedCompany?.name || "", selectedBranch);
    }
  }, [selectedBranch]);
  const fetchBranches = async (companyId) => {
    try {
      const branchData = await getBranchesByCompanyId(companyId);
      setBranches(branchData);
    } catch (err) {
      console.error("Şubeler alınırken hata oluştu:", err);
    }
  };
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
    <div>
      <main>
        {activeTab === "inventory" && (
          <Box sx={{ padding: 2 }}>
            <div
              className="flex items-center justify-between mb-4 p-2 rounded-lg shadow-md "
              style={tableStyles.tableHeaderBackground}
            >
              {/* Şirket ve Şube Seçimi */}
              <div className="flex items-center gap-4">
                {/* Şirket Seçimi */}
                <div>
                  <label
                    htmlFor="companyFilter"
                    style={{ marginRight: "10px" }}
                  >
                    Şirket Seçin:
                  </label>
                  <select
                    id="companyFilter"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    style={tableStyles.selectInput}
                  >
                    <option value="">Tüm Şirketler</option>
                    {companies.map((company) => (
                      <option
                        key={company.company_id}
                        value={company.company_id}
                      >
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Şube Seçimi */}
                <div>
                  <label htmlFor="branchFilter" style={{ marginRight: "10px" }}>
                    Şube Seçin:
                  </label>
                  <select
                    id="branchFilter"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    style={tableStyles.selectInput}
                    disabled={!selectedCompanyId || branches.length === 0}
                  >
                    <option value="">Tüm Şubeler</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.name}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>{" "}
                {/* Arşivlenmiş Envanter Butonu */}
                <IconButton color="primary" onClick={handleOpenArchive}>
                  <HistoryIcon />
                </IconButton>
              </div>

              {/* Envanter Ekle Butonu */}
              {permissions.includes("inventoryAdd") && (
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
              )}
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
                <div className="bg-red-500 text-white p-2 rounded mt-3">
                  {inventoriesError}
                </div>
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
      {/* Arşivlenmiş Envanterler Drawer'ı */}
      <Drawer
        anchor="right"
        open={isArchiveDrawerOpen}
        onClose={() => setIsArchiveDrawerOpen(false)}
      >
        <Box sx={{ width: 350, padding: 2 }}>
          <Typography variant="h6">Arşivlenmiş Envanterler</Typography>
          <List>
            {archivedInventories.length > 0 ? (
              archivedInventories.map((inventory, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={inventory.device_type}
                    secondary={`Cihaz Modeli: ${inventory.device_model}, quantity: ${inventory.quantity}`}
                  />
                </ListItem>
              ))
            ) : (
              <Typography color="textSecondary">Arşiv boş</Typography>
            )}
          </List>
        </Box>
      </Drawer>
    </div>
  );
};

export default InventoryManager;

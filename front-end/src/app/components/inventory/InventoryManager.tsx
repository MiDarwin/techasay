"use client";

import React, { useState, useEffect } from "react";
import InventoryList from "./InventoryList";
import AddInventoryModal from "./AddInventoryModal";
import UpdateInventoryModal from "./UpdateInventoryModal";
import {
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
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [inventoriesLoading, setInventoriesLoading] = useState(false);
  const [inventoriesError, setInventoriesError] = useState("");
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [isInventoryAddModalOpen, setIsInventoryAddModalOpen] = useState(false);
  const [permissions, setPermissions] = useState([]); // Kullanıcı izinleri
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [archivedInventories, setArchivedInventories] = useState([]);
  const [isArchiveDrawerOpen, setIsArchiveDrawerOpen] = useState(false);

  // İzinleri çekme fonksiyonu
  const fetchPermissions = async () => {
    try {
      const userPermissions = await getAllUsersPermissions(); // Kullanıcı izinlerini al
      setPermissions(userPermissions); // İzinleri state'e ata
    } catch (error) {
      console.error("Kullanıcı izinleri alınırken hata oluştu:", error);
    } finally {
      setPermissionsLoaded(true); // İzinlerin yüklendiğini belirt
    }
  };

  // Şirketleri çekme fonksiyonu
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

  // Şubeleri çekme fonksiyonu
  const fetchBranches = async (companyId) => {
    try {
      const branchData = await getBranchesByCompanyId(companyId);
      setBranches(branchData);
    } catch (err) {
      console.error("Şubeler alınırken hata oluştu:", err);
    }
  };

  const fetchInventories = async () => {
    if (!permissionsLoaded) return;
    if (!permissions.includes("inventoryViewing")) {
      setInventoriesError(
        "Envanter bilgilerini görüntüleme yetkiniz yok. Lütfen sistem yöneticisi ile iletişime geçin."
      );
      setFilteredInventories([]);
      return;
    }

    // Loading başlat
    setInventoriesLoading(true);

    try {
      // branchName’den branch objesini bul
      const branchObj = branches.find((b) => b.name === selectedBranch);
      if (!branchObj) {
        setFilteredInventories([]);
        return;
      }

      // buradaki id ile API çağrısı
      const invs = await getInventoryByBranch(branchObj.id);
      setFilteredInventories(invs);
    } catch (err) {
      setInventoriesError(
        err.message || "Envanterler alınırken bir hata oluştu."
      );
    } finally {
      setInventoriesLoading(false);
    }
  };

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

  // İzinleri ve ardından şirketleri/envanterleri çek
  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (permissionsLoaded) {
      if (permissions.includes("inventoryViewing")) {
        fetchCompanies();
      } else {
        setInventoriesError(
          "Envanter bilgilerini görüntüleme yetkiniz yok. Lütfen sistem yöneticisi ile iletişime geçin."
        );
      }
    }
  }, [permissionsLoaded, permissions]);

  useEffect(() => {
    if (permissionsLoaded && permissions.includes("inventoryViewing")) {
      if (selectedCompanyId) {
        fetchBranches(selectedCompanyId);
        // Şubeler geldikten sonra ilk şube otomatik seçiliyorsa,
        // `setSelectedBranch(...)` sonrası da fetchInventories çağırabilirsin.
      } else {
        setBranches([]);
        setFilteredInventories([]);
      }
    }
  }, [selectedCompanyId, permissionsLoaded, permissions]);

  useEffect(() => {
    // selectedBranch adı değiştiğinde
    if (
      permissionsLoaded &&
      permissions.includes("inventoryViewing") &&
      selectedBranch
    ) {
      fetchInventories();
    }
  }, [selectedBranch, permissionsLoaded, permissions, branches]);

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
                    style={{ marginRight: "10px", color: "black" }}
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
                  <label
                    htmlFor="branchFilter"
                    style={{ marginRight: "10px", color: "black" }}
                  >
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
                  onInventoryAdded={() => fetchInventories()}
                />
              )}
            </div>
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

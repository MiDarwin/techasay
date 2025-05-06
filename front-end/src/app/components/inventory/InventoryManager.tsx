"use client";

import React, { useState, useEffect, useCallback } from "react";
import InventoryList from "./InventoryList";
import AddInventoryModal from "./AddInventoryModal";
import UpdateInventoryModal from "./UpdateInventoryModal";
import {
  getAllCompanies,
  getBranchesByCompanyId,
  deleteInventory,
  getInventoryByBranch,
  getInventoryByCompany,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import tableStyles from "@/app/styles/tableStyles";
import HistoryIcon from "@mui/icons-material/History"; // Kum saati simgesi için
import InventoryUpdateModal from "./InvetoryUpdate";

const LIMIT_OPTIONS = [15, 25, 40, 100, 200];

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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState(null);
  const [limit, setLimit] = useState<number>(15);

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
      if (companyData.length) setSelectedCompanyId(companyData[0].company_id);
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
      setSelectedBranch("");
    } catch (err) {
      console.error("Şubeler alınırken hata oluştu:", err);
    }
  };
  useEffect(() => {
    if (!permissionsLoaded || !permissions.includes("inventoryViewing")) return;

    if (selectedCompanyId) {
      setInventoriesLoading(true);
      getInventoryByCompany(selectedCompanyId)
        .then((data) => {
          setFilteredInventories(data);
          setInventoriesError("");
        })
        .catch((e) => {
          setInventoriesError(e.message);
          setFilteredInventories([]);
        })
        .finally(() => setInventoriesLoading(false));
    } else {
      setFilteredInventories([]);
    }
  }, [selectedCompanyId, permissionsLoaded, permissions]);

  const fetchInventories = useCallback(async () => {
    if (!permissionsLoaded || !permissions.includes("inventoryViewing")) {
      setFilteredInventories([]);
      return;
    }

    setInventoriesLoading(true);
    try {
      let invs = [];

      // Öncelikli: şube seçili mi?
      const branchObj = branches.find((b) => b.name === selectedBranch);
      if (branchObj) {
        invs = await getInventoryByBranch(branchObj.id, limit);
      }
      // Değilse, company seçili mi?
      else if (selectedCompanyId) {
        invs = await getInventoryByCompany(selectedCompanyId, limit);
      }

      setFilteredInventories(invs);
      setInventoriesError("");
    } catch (err) {
      setInventoriesError(
        err.message || "Envanterler alınırken bir hata oluştu."
      );
      setFilteredInventories([]);
    } finally {
      setInventoriesLoading(false);
    }
  }, [
    permissionsLoaded,
    permissions,
    branches,
    selectedBranch,
    selectedCompanyId,
    limit,
  ]);
  useEffect(() => {
    fetchInventories();
  }, [selectedCompanyId, selectedBranch, limit]);

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

  // Şube seçildiğinde şirket geneli yerine sadece o şubenin envanterini çek
  useEffect(() => {
    if (!permissionsLoaded || !permissions.includes("inventoryViewing")) return;

    // branches: { id, name, … } diziniz; selectedBranch ise name
    const branchObj = branches.find((b) => b.name === selectedBranch);

    if (branchObj) {
      setInventoriesLoading(true);
      getInventoryByBranch(branchObj.id)
        .then((data) => {
          setFilteredInventories(data);
          setInventoriesError("");
        })
        .catch((e) => {
          setInventoriesError(e.message);
          setFilteredInventories([]);
        })
        .finally(() => setInventoriesLoading(false));
    }
    // şube sıfırlandıysa, şirket geneli zaten başka efekt tetikleniyor
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
                <FormControl>
                  <InputLabel>Adet</InputLabel>
                  <Select
                    value={limit}
                    label="Adet"
                    onChange={(e) => setLimit(Number(e.target.value))}
                  >
                    {LIMIT_OPTIONS.map((n) => (
                      <MenuItem key={n} value={n}>
                        {n}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
              onEdit={(inv) => {
                setSelectedInv(inv);
                setModalOpen(true);
              }}
            />
          )}
        </div>
        <InventoryUpdateModal
          open={modalOpen}
          inventory={selectedInv}
          onClose={() => setModalOpen(false)}
          onUpdated={() => {
            fetchInventories(); // Aynı unified fetch kullanılıyor
          }}
        />
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

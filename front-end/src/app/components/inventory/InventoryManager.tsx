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
  downloadInventoryExcel,
  importInventory,
} from "../../utils/api";
import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  TextField,
} from "@mui/material";
import tableStyles from "@/app/styles/tableStyles";
import HistoryIcon from "@mui/icons-material/History"; // Kum saati simgesi için
import InventoryUpdateModal from "./InvetoryUpdate";
import InventoryImportModal from "./InventoryImportModal";

const LIMIT_OPTIONS = [15, 25, 40, 100, 200];

const InventoryManager = () => {
  const [activeTab, setActiveTab] = useState("inventory");
  const [branches, setBranches] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [inventoriesLoading, setInventoriesLoading] = useState(false);
  const [inventoriesError, setInventoriesError] = useState("");
  const [totalCount, setTotalCount] = useState<number>(0);
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
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

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
      let invs: InventoryOut[] = [];
      const branchObj = branches.find((b) => b.name === selectedBranch);

      if (branchObj) {
        invs = await getInventoryByBranch(
          branchObj.id,
          limit ?? undefined,
          searchTerm
        );
      } else if (selectedCompanyId) {
        invs = await getInventoryByCompany(
          selectedCompanyId,
          limit ?? undefined,
          searchTerm
        );
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
    searchTerm, // ← add searchTerm here
  ]);
  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);
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
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        px: 2,
        py: 1,
        bgcolor: "grey.50", // çok açık gri
        minHeight: "100vh",
      }}
    >
      {/* Filtre ve İşlemler */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
        p={2}
        borderRadius={1}
        boxShadow={1}
        bgcolor="#EDF2F7"
      >
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl>
            <InputLabel>Şirket Seçin</InputLabel>
            <Select
              value={selectedCompanyId}
              label="Şirket Seçin"
              onChange={(e) => setSelectedCompanyId(e.target.value)}
            >
              {companies.map((c) => (
                <MenuItem key={c.company_id} value={c.company_id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>Şube Seçin</InputLabel>
            <Select
              value={selectedBranch}
              label="Şube Seçin"
              onChange={(e) => setSelectedBranch(e.target.value)}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">
                <em>Tüm Şubeler</em>
              </MenuItem>
              {branches.map((b) => (
                <MenuItem key={b.id} value={b.name}>
                  {b.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <TextField
              label="Envanterde ara"
              variant="outlined"
              size="medium"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FormControl>
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
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          <Button variant="outlined" onClick={() => setImportModalOpen(true)}>
            EXCEL YÜKLE
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              const branchObj = branches.find((b) => b.name === selectedBranch);
              if (branchObj)
                downloadInventoryExcel(undefined, branchObj.id, limit);
              else if (selectedCompanyId)
                downloadInventoryExcel(selectedCompanyId, undefined, limit);
            }}
          >
            EXCEL İNDİR
          </Button>
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
        </Box>
      </Box>
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
      {/* Liste */}
      <InventoryList
        inventories={filteredInventories}
        onEdit={(inv) => {
          setSelectedInv(inv);
          setModalOpen(true);
        }}
      />

      {/* Modaller */}
      <InventoryUpdateModal
        open={modalOpen}
        inventory={selectedInv}
        onClose={() => setModalOpen(false)}
        onUpdated={() => fetchInventories()}
        companyId={selectedCompanyId}
      />
      <InventoryImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onUploadSuccess={() => {
          setImportModalOpen(false);
          fetchInventories();
        }}
      />
    </Container>
  );
};

export default InventoryManager;

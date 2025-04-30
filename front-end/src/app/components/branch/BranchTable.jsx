import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Paper,
  Modal,
  Box,
  Snackbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BackpackIcon from "@mui/icons-material/Backpack"; // Envanter ikonu
import LocationOnIcon from "@mui/icons-material/LocationOn"; // Konum ikonu
import HolidayVillageIcon from "@mui/icons-material/HolidayVillage"; // Alt şube ikonu
import FavoriteIcon from "@mui/icons-material/Favorite"; // Kırmızı kalp ikonu
import {
  getInventoryByBranch,
  getcombinedinventoryByBranch,
  getSubBranchesByBranchId,
  updateBranch,
  getAllUsersPermissions,
  removeFavoriteBranch,
  addFavoriteBranch,
  getBranchVisits,
  createBranchVisit,
  createSubBranch, // Alt şube silme API çağrısı
} from "../../utils/api"; // API'den envanter ve alt şubeleri almak için kullanılan fonksiyonlar
import UpdateBranchModal from "./UpdateBranchModal";
import SubBranchTable from "./SubBranchTable"; // Alt şube tablosu bileşeni
import SubBranchForm from "./SubBranchForm"; // Alt şube ekleme formu
import InventoryModal from "./InventoryModal"; // Envanter Modalı Component
import InfoIcon from "@mui/icons-material/Info";
import tableStyles from "../../styles/tableStyles";
import VisitModal from "./VisitModal";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #1976d2",
  boxShadow: 24,
  p: 4,
};

const BranchTable = ({
  branches,
  companies,
  onEdit,
  onDelete,
  fetchBranches,
}) => {
  const [openInventory, setOpenInventory] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null); // Genişletilmiş (expanded) satırı takip etmek için
  const [subBranches, setSubBranches] = useState([]); // Alt şube verilerini tutmak için
  const [loading, setLoading] = useState(false); // Yükleme durumunu takip etmek için
  const [isSubBranchModalOpen, setIsSubBranchModalOpen] = useState(false); // Alt şube modal durumu
  const [selectedBranchName, setSelectedBranchName] = useState(""); // Şube adı
  const [permissions, setPermissions] = useState([]); // Kullanıcı izinleri
  const [branchError, setBranchError] = useState("");
  const [branchLoading, setBranchLoading] = useState(false);
  const [parentBranchId, setParentBranchId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar açık mı
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar mesajı
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedBranchForInfo, setSelectedBranchForInfo] = useState(null);
  const [branchVisits, setBranchVisits] = useState([]);
  const [isLoadingVisits, setIsLoadingVisits] = useState(false);

  const handleOpenInventory = async (branchId, branchName) => {
    setSelectedBranchId(branchId);
    setSelectedBranchName(branchName);
    const data = await getcombinedinventoryByBranch(branchId); // API'den envanteri al
    setInventory(data);
    setOpenInventory(true);
  };
  const handleFavoriteClick = async (branchId, isFavorite) => {
    try {
      if (isFavorite) {
        // Şube favorilerde mevcutsa, favoriden sil
        await removeFavoriteBranch(branchId);
        setSnackbarMessage("Favorilerden kaldırıldı!"); // Pop-up mesajı
      } else {
        // Şube favorilerde değilse, favorilere ekle
        await addFavoriteBranch(branchId);
        setSnackbarMessage("Favorilere eklendi!"); // Pop-up mesajı
      }

      setSnackbarOpen(true); // Pop-up'ı aç
      fetchBranches(); // Favori işlemi sonrası şube listesini yenile
    } catch (error) {
      setSnackbarMessage("Favori işlemi sırasında bir hata oluştu!"); // Hata mesajı
      setSnackbarOpen(true); // Pop-up'ı aç
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false); // Snackbar'ı kapat
  };

  const handleCloseInventory = () => {
    setOpenInventory(false);
    setSelectedBranchId(null);
    setSelectedBranchName("");
  };

  const handleEditClick = (branch) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };
  // Alt şubeleri yükleme fonksiyonu
  const handleExpandClick = async (branchId) => {
    if (expandedRow === branchId) {
      // Eğer zaten açık olan satıra tıklanırsa, gizle
      setExpandedRow(null);
      setSubBranches([]);

      return;
    }

    try {
      setLoading(true);
      const data = await getSubBranchesByBranchId(branchId); // Backend'den alt şubeleri al
      setSubBranches(data); // Alt şubeleri state'e ata
      setExpandedRow(branchId); // Genişletilmiş satırı güncelle
      setParentBranchId(branchId); // Üst şube ID'sini ayarla
      setLoading(false);
    } catch (err) {
      alert("Alt şubeler yüklenirken bir hata oluştu.");
      setLoading(false);
    }
  };
  const handleAddSubBranch = async (subBranchData) => {
    try {
      await createSubBranch(selectedBranch.id, subBranchData); // API çağrısı (branchId ile)
      alert("Alt şube başarıyla eklendi!");
      setIsSubBranchModalOpen(false); // Modalı kapat
      fetchBranches(); // Güncellemeden sonra şubeleri yeniden fetch et
    } catch (err) {
      alert("Alt şube eklenirken bir hata oluştu: " + err.message);
    }
  };

  const openSubBranchModal = (branch) => {
    setSelectedBranch(branch);
    setIsSubBranchModalOpen(true);
  };

  const closeSubBranchModal = () => {
    setIsSubBranchModalOpen(false);
    setSelectedBranch(null);
  };
  const openLocationLink = (link) => {
    const formattedLink =
      link.startsWith("http://") || link.startsWith("https://")
        ? link
        : `http://${link}`;

    window.open(formattedLink, "_blank");
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBranch(null);
  };
  const handleUpdateBranch = async (branchId, updatedData) => {
    try {
      await updateBranch(branchId, updatedData); // Şube güncelleme API çağrısı
      alert("Şube başarıyla güncellendi.");
      fetchBranches(); // Güncellemeden sonra şubeleri yeniden fetch et
    } catch (error) {
      console.error("Şube güncellenirken hata oluştu:", error);
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
  const fetchSubBranches = async (parentBranchId) => {
    try {
      const subBranchesData = await getSubBranchesByBranchId(parentBranchId);
      setSubBranches(subBranchesData); // Alt şube listesini güncelle
    } catch (error) {
      console.error("Alt şubeler alınırken hata oluştu:", error);
    }
  };
  const handleInfoClick = async (branch) => {
    setSelectedBranchForInfo(branch);
    setIsInfoModalOpen(true);
    setIsLoadingVisits(true);

    try {
      const visits = await getBranchVisits(
        branch.id,
        localStorage.getItem("token")
      );
      setBranchVisits(visits);
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setIsLoadingVisits(false);
    }
  };

  const handleCloseInfoModal = () => {
    setIsInfoModalOpen(false);
    setSelectedBranchForInfo(null);
    setBranchVisits([]);
  };

  const handleCreateVisit = async (branchId, formData) => {
    try {
      const newVisit = await createBranchVisit(
        branchId,
        formData,
        localStorage.getItem("token")
      );
      setBranchVisits((prev) => [...prev, newVisit]);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const renderFavoriteIcon = (branch) => {
    return (
      <Tooltip
        title={branch.is_favorite ? "Favoriden Kaldır" : "Favorilere Ekle"}
      >
        <IconButton
          onClick={() => handleFavoriteClick(branch.id, branch.is_favorite)}
          aria-label="Favori"
        >
          <FavoriteIcon
            style={{ color: branch.is_favorite ? "red" : "gray" }}
          />
        </IconButton>
      </Tooltip>
    );
  };
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text); // Metni kopyala
    setSnackbarMessage("Kopyalandı!");
    setSnackbarOpen(true); // Snackbar'ı aç
  };
  return (
    <>
      <TableContainer component={Paper} sx={tableStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow sx={tableStyles.tableHeader}>
              <TableCell>Şirket Adı</TableCell>
              <TableCell>Şehir</TableCell>
              <TableCell>İlçe</TableCell>
              <TableCell>Şube Adı</TableCell>
              <TableCell>Telefon Numarası / Yedek Telefon</TableCell>
              <TableCell>Şube Notu</TableCell>
              <TableCell>Kurulum Tarihi</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.map((branch, index) => (
              <React.Fragment key={branch.id}>
                <TableRow key={branch.id} sx={tableStyles.tableRow}>
                  <TableCell onClick={() => handleCopy(branch.company_name)}>
                    {branch.company_name}
                  </TableCell>
                  <TableCell onClick={() => handleCopy(branch.city)}>
                    {branch.city}
                  </TableCell>
                  <TableCell
                    onClick={() => handleCopy(branch.district || "Yok")}
                  >
                    {branch.district || "Yok"}
                  </TableCell>
                  <TableCell onClick={() => handleCopy(branch.name)}>
                    {branch.name}
                  </TableCell>
                  <TableCell
                    onClick={() =>
                      handleCopy(
                        branch.phone_number +
                          (branch.phone_number_2
                            ? ` / ${branch.phone_number_2}`
                            : "")
                      )
                    }
                  >
                    {branch.phone_number}
                    {branch.phone_number_2 ? ` / ${branch.phone_number_2}` : ""}
                  </TableCell>
                  <TableCell>{branch.branch_note || "Yok"}</TableCell>
                  <TableCell>{branch.created_date}</TableCell>

                  <TableCell>
                    <Tooltip title="Şube Bilgileri" key={branch.id}>
                      <IconButton
                        onClick={() => handleInfoClick(branch)}
                        color="info"
                        aria-label="Şube Bilgileri"
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                    {branch.location_link && (
                      <Tooltip title="Konum Göster">
                        <IconButton
                          onClick={() => openLocationLink(branch.location_link)}
                          color="primary"
                          aria-label="Konum Göster"
                        >
                          <LocationOnIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {permissions.includes("branchEdit") && (
                      <Tooltip title="Düzenle">
                        <IconButton
                          onClick={() => handleEditClick(branch)}
                          color="warning"
                          aria-label="Düzenle"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {permissions.includes("branchDelete") && (
                      <Tooltip title="Sil">
                        <IconButton
                          onClick={() => onDelete(branch.id)}
                          color="error"
                          aria-label="Sil"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    <Tooltip title="Şube Envanterini Görüntüle">
                      <IconButton
                        onClick={() => handleOpenInventory(branch.id)}
                        color="primary"
                        aria-label="Şube Envanterini Görüntüle"
                      >
                        <BackpackIcon />
                      </IconButton>
                    </Tooltip>
                    {permissions.includes("subBranchAdd") && (
                      <Tooltip title="Alt Şube Ekle">
                        <IconButton
                          onClick={() => openSubBranchModal(branch)}
                          color="success"
                          aria-label="Alt Şube Ekle"
                        >
                          <HolidayVillageIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {branch.has_sub_branches && (
                      <Tooltip title="Alt Şubeleri Görüntüle">
                        <IconButton
                          onClick={() => handleExpandClick(branch.id)}
                          color="secondary"
                          aria-label="Alt Şubeleri Görüntüle"
                        >
                          <HolidayVillageIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* Favori simgesini ekle */}
                    <Tooltip title="Favori">
                      <IconButton
                        onClick={() =>
                          handleFavoriteClick(branch.id, branch.is_favorite)
                        }
                        aria-label="Favori"
                      >
                        <FavoriteIcon
                          style={{ color: branch.is_favorite ? "red" : "gray" }}
                        />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>

                {/* Alt Şube Tablosu */}
                {expandedRow === branch.id && (
                  <TableRow>
                    <TableCell colSpan={9} sx={tableStyles.tableRow}>
                      {loading ? (
                        <CircularProgress />
                      ) : (
                        <SubBranchTable
                          subBranches={subBranches}
                          fetchSubBranches={() =>
                            fetchSubBranches(parentBranchId)
                          } // Prop olarak geçiş
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000} // 3 saniye sonra otomatik olarak kapanır
        onClose={handleSnackbarClose}
        message={snackbarMessage} // Mesaj içeriği
      />
      <UpdateBranchModal
        open={isModalOpen}
        onClose={handleCloseModal}
        branchData={selectedBranch}
        onUpdate={handleUpdateBranch}
      />
      {/* Envanter Modal */}
      <InventoryModal
        isOpen={openInventory}
        onClose={handleCloseInventory}
        inventory={inventory}
        branchName={selectedBranchName}
      />

      {/* Alt Şube Ekleme Modalı */}
      {selectedBranch && (
        <Modal
          open={isSubBranchModalOpen}
          onClose={closeSubBranchModal}
          aria-labelledby="sub-branch-modal-title"
        >
          <Box sx={style}>
            <SubBranchForm
              parentBranch={selectedBranch}
              onSubmit={handleAddSubBranch}
              onCancel={closeSubBranchModal}
            />
          </Box>
        </Modal>
      )}
      {selectedBranchForInfo && (
        <VisitModal
          branch={selectedBranchForInfo}
          isOpen={isInfoModalOpen}
          onClose={handleCloseInfoModal}
          branchVisits={branchVisits}
          isLoading={isLoadingVisits}
          onCreateVisit={handleCreateVisit}
        />
      )}
    </>
  );
};

BranchTable.propTypes = {
  branches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      company_id: PropTypes.number.isRequired,
      branch_name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
      city: PropTypes.string.isRequired,
      phone_number: PropTypes.string.isRequired,
      location_link: PropTypes.string,
      branch_note: PropTypes.string,
      phone_number_2: PropTypes.string,
      sub_branch: PropTypes.array, // Alt şube durumu
      is_favorite: PropTypes.bool.isRequired,
    })
  ).isRequired,
  companies: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  cityFilter: PropTypes.string, // Yeni eklenen prop
  fetchBranches: PropTypes.func.isRequired, // fetchBranches fonksiyonu zorunlu
  districtFilter: PropTypes.string, // Yeni eklenen prop
  searchFilter: PropTypes.string, // Yeni eklenen prop
  companyFilter: PropTypes.string, // Yeni eklenen prop
};

export default BranchTable;

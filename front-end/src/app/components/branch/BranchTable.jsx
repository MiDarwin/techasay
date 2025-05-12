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
  Typography,
  Snackbar,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
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
import AddIcon from "@mui/icons-material/Add";

export function safeFormatDate(dateStr) {
  if (!dateStr) return "";

  // 1) ISO 8601: 2025-05-06T14:30:00Z vb.
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleDateString();
  }

  // 2) Gün/Ay/Yıl: dd/MM/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [dd, mm, yyyy] = dateStr.split("/").map((n) => parseInt(n, 10));
    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d) ? dateStr : d.toLocaleDateString();
  }

  // 3) Ay/Gün/Yıl: MM/dd/yyyy
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    // Bu regex ikisini de yakalar ama burada illâ da lokal ay/gün/ yıl yazıldıysa:
    // bir tercih yapmak gerek, genelde dd>12 ise kesin gün/ay gözükecektir
    const [p1, p2, yyyy] = dateStr.split("/").map((n) => parseInt(n, 10));
    if (p1 > 12) {
      // aslında dd/mm/yyyy
      const d = new Date(yyyy, p2 - 1, p1);
      return isNaN(d) ? dateStr : d.toLocaleDateString();
    } else {
      // mm/dd/yyyy
      const d = new Date(yyyy, p1 - 1, p2);
      return isNaN(d) ? dateStr : d.toLocaleDateString();
    }
  }

  // 4) Hiçbirine uymadıysa: olduğu gibi göster
  return dateStr;
}
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
  view,
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
  const [infoBranch, setInfoBranch] = useState(null);
  const [detailBranch, setDetailBranch] = useState(null);

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
  const handleOpenInfo = (branch) => {
    setInfoBranch(branch);
  };
  const handleCloseInfo = () => {
    setInfoBranch(null);
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
    setSnackbarMessage("Kopyalandı:" + text);
    setSnackbarOpen(true); // Snackbar'ı aç
  };
  return (
    <>
      <TableContainer component={Paper} sx={tableStyles.tableContainer}>
        {view === "list" && (
          <Table>
            <TableHead>
              <TableRow sx={tableStyles.tableHeader}>
                <TableCell>Şirket Adı</TableCell>
                <TableCell>Şehir</TableCell>
                <TableCell>İlçe</TableCell>
                <TableCell>Şube Adı</TableCell>
                <TableCell>GSM No</TableCell>
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
                    <TableCell onClick={() => handleCopy(branch.phone_number)}>
                      {branch.phone_number}
                    </TableCell>
                    <TableCell>{branch.branch_note || "Yok"}</TableCell>
                    <TableCell>{safeFormatDate(branch.created_date)}</TableCell>
                    <TableCell>
                      {/* Şube Bilgileri Modal Aç */}
                      <Tooltip title="Şube Bilgileri" arrow>
                        <IconButton
                          onClick={() => handleOpenInfo(branch)}
                          color="info"
                          aria-label="Şube Bilgileri"
                        >
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                      {branch.location_link && (
                        <Tooltip title="Konum Göster">
                          <IconButton
                            onClick={() =>
                              openLocationLink(branch.location_link)
                            }
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
                            style={{
                              color: branch.is_favorite ? "red" : "gray",
                            }}
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
        )}
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
      {/* Şube Bilgileri Modal */}
      <Modal open={!!infoBranch} onClose={handleCloseInfo}>
        <Box sx={style}>
          <Typography color="black" variant="h6" mb={2}>
            Şube Bilgileri
          </Typography>
          {infoBranch && (
            <>
              <Box display="flex" alignItems="center" mb={1}>
                <Typography color="black" sx={{ flexGrow: 1 }}>
                  Adres:
                </Typography>
                <Tooltip title="Kopyala" arrow>
                  <IconButton></IconButton>
                </Tooltip>
              </Box>
              <Typography color="black" mb={2}>
                {infoBranch.address}
              </Typography>

              {infoBranch.phone_number_2 && (
                <>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Typography sx={{ flexGrow: 1 }}>Yedek GSM No:</Typography>
                    <Tooltip title="Kopyala" arrow>
                      <IconButton
                        onClick={() => handleCopy(infoBranch.phone_number_2)}
                      ></IconButton>
                    </Tooltip>
                  </Box>
                  <Typography>{infoBranch.phone_number_2}</Typography>
                </>
              )}
            </>
          )}
        </Box>
      </Modal>

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
      {view === "card" && (
        <Grid container spacing={2}>
          {branches.map((b) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={b.id}
              sx={{ display: "flex" }}
            >
              <Card
                sx={{
                  height: 320,
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  borderRadius: 2,
                  boxShadow: 2,
                  backgroundColor: "#EDF2F7",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
                }}
              >
                <CardHeader
                  title={b.name}
                  subheader={b.company_name || "Şirket Yok"}
                />
                <Divider />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Şehir / İlçe:</strong> {b.city} / {b.district}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>GSM No:</strong> {b.phone_number}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Not:</strong> {b.branch_note || "—"}
                  </Typography>
                </CardContent>

                <Divider />

                <CardActions
                  sx={{ justifyContent: "flex-end", flexWrap: "wrap" }}
                >
                  {/* Şube Bilgileri */}
                  <Tooltip title="Şube Bilgileri" arrow>
                    <IconButton
                      onClick={() => handleOpenInfo(b)}
                      color="info"
                      aria-label="Şube Bilgileri"
                    >
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>

                  {/* Konum Göster */}
                  {b.location_link && (
                    <Tooltip title="Konum Göster" arrow>
                      <IconButton
                        onClick={() => openLocationLink(b.location_link)}
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
                        onClick={() => handleEditClick(b)}
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
                        onClick={() => onDelete(b.id)}
                        color="error"
                        aria-label="Sil"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {permissions.includes("subBranchAdd") && (
                    <Tooltip title="Alt Şube Ekle">
                      <IconButton
                        onClick={() => openSubBranchModal(b)}
                        color="success"
                        aria-label="Alt Şube Ekle"
                      >
                        <HolidayVillageIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Alt Şubeleri Görüntüle */}
                  {b.has_sub_branches && (
                    <Tooltip title="Alt Şubeleri Görüntüle" arrow>
                      <IconButton
                        onClick={() => onViewSubBranches(b.id)}
                        color="secondary"
                        aria-label="Alt Şubeleri Görüntüle"
                      >
                        <HolidayVillageIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  {/* Favori */}
                  <Tooltip title="Favori">
                    <IconButton
                      onClick={() => handleFavoriteClick(b.id, b.is_favorite)}
                      aria-label="Favori"
                    >
                      <FavoriteIcon
                        style={{
                          color: b.is_favorite ? "red" : "gray",
                        }}
                      />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
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

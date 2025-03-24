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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BackpackIcon from "@mui/icons-material/Backpack"; // Envanter ikonu
import LocationOnIcon from "@mui/icons-material/LocationOn"; // Konum ikonu
import HolidayVillageIcon from "@mui/icons-material/HolidayVillage"; // Alt şube ikonu
import {
  getInventoryByBranch,
  getcombinedinventoryByBranch,
  getSubBranchesByBranchId,
  updateBranch,
  getAllUsersPermissions,
  createSubBranch, // Alt şube silme API çağrısı
} from "../../utils/api"; // API'den envanter ve alt şubeleri almak için kullanılan fonksiyonlar
import UpdateBranchModal from "./UpdateBranchModal";
import SubBranchTable from "./SubBranchTable"; // Alt şube tablosu bileşeni
import SubBranchForm from "./SubBranchForm"; // Alt şube ekleme formu
import InventoryModal from "./InventoryModal"; // Envanter Modalı Component
import tableStyles from "../../styles/tableStyles";
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

const BranchTable = ({ branches, companies, onEdit, onDelete }) => {
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

  const handleOpenInventory = async (branchId, branchName) => {
    setSelectedBranchId(branchId);
    setSelectedBranchName(branchName);
    const data = await getcombinedinventoryByBranch(branchId); // API'den envanteri al
    setInventory(data);
    setOpenInventory(true);
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
      // Correct API call with branch_id in the URL
      await updateBranch(branchId, updatedData);
      fetchBranches(cityFilter, districtFilter, searchFilter, companyFilter); // Şubeleri yeniden yükle
      alert("Şube başarıyla güncellendi.");
      // Tabloyu yeniden yükleyin veya güncellenen veriyi tabloya yansıtın
    } catch (error) {
      alert("Şube güncellerken bir hata oluştu.");
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
    <>
      <TableContainer component={Paper} sx={tableStyles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow sx={tableStyles.tableHeader}>
              <TableCell>Şirket Adı</TableCell>
              <TableCell>Şehir</TableCell>
              <TableCell>İlçe</TableCell>
              <TableCell>Şube Adı</TableCell>
              <TableCell>Adres</TableCell>
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
                  <TableCell>{branch.company_name}</TableCell>
                  <TableCell>{branch.city}</TableCell>
                  <TableCell>{branch.district || "Yok"}</TableCell>
                  <TableCell>{branch.name}</TableCell>
                  <TableCell>{branch.address}</TableCell>
                  <TableCell>
                    {branch.phone_number}
                    {branch.phone_number_2 ? ` / ${branch.phone_number_2}` : ""}
                  </TableCell>
                  <TableCell>{branch.branch_note || "Yok"}</TableCell>
                  <TableCell>{branch.created_date}</TableCell>

                  <TableCell>
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
                  </TableCell>
                </TableRow>
                {/* Alt Şube Tablosu */}
                {expandedRow === branch.id && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      sx={{
                        backgroundColor: "#EDE8DC", // Alt şube tablosu için arka plan rengi
                        width: "100%", // BranchTable ile aynı genişlikte olması için
                      }}
                    >
                      {loading ? (
                        <CircularProgress />
                      ) : (
                        <SubBranchTable subBranches={subBranches} />
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
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
    })
  ).isRequired,
  companies: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default BranchTable;

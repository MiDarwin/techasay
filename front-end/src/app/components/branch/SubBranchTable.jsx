import React, { useState } from "react";
import PropTypes from "prop-types"; // Prop validation için
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Modal,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import UpdateSubBranchForm from "./UpdateSubBranchForm"; // Yeni modal bileşeni
import {
  updateBranch,
  deleteBranch,
  getInventoryByBranch,
} from "../../utils/api"; // Silme ve güncelleme API fonksiyonları
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BackpackIcon from "@mui/icons-material/Backpack"; // Envanter ikonu
import InventoryModal from "./InventoryModal"; // Envanter Modalı Component

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solidrgb(23, 42, 62)",
  boxShadow: 24,
  p: 4,
};

const SubBranchTable = ({ subBranches, onReload }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubBranch, setSelectedSubBranch] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [openInventory, setOpenInventory] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [selectedBranchName, setSelectedBranchName] = useState("");
  const openModal = (subBranch) => {
    setSelectedSubBranch(subBranch); // Seçilen alt şubenin bilgilerini ayarla
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedSubBranch(null);
    setIsModalOpen(false);
  };

  const openDeleteDialog = (branch) => {
    setBranchToDelete(branch);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setBranchToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleUpdateSubBranch = async (updatedData) => {
    try {
      await updateBranch(selectedSubBranch.id, updatedData); // Güncelleme API çağrısı
      alert("Alt şube başarıyla güncellendi!");
      closeModal();
      onReload(); // Tabloyu yeniden yükle
    } catch (err) {
      alert("Alt şube güncellenirken bir hata oluştu: " + err.message);
    }
  };

  const handleDeleteSubBranch = async () => {
    try {
      await deleteBranch(branchToDelete.id); // Silme API çağrısı
      alert("Alt şube başarıyla silindi!");
      closeDeleteDialog();
      onReload(); // Tabloyu yeniden yükle
    } catch (err) {
      alert("Alt şube silinirken bir hata oluştu: " + err.message);
    }
  };
  const handleOpenInventory = async (branchId, branchName) => {
    setSelectedBranchId(branchId);
    setSelectedBranchName(branchName);
    const data = await getInventoryByBranch(branchId); // API'den envanteri al
    setInventory(data);
    setOpenInventory(true);
  };

  const handleCloseInventory = () => {
    setOpenInventory(false);
    setSelectedBranchId(null);
    setSelectedBranchName("");
  };
  return (
    <TableContainer
      component={Paper}
      sx={{
        marginTop: 2,
        borderRadius: "10px", // Köşeleri yuvarlatma
        boxShadow: "0px 4px 10px rgba(0, 0, 0.2)", // Hafif gölge
      }}
    >
      {/* Tablo */}
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#A5B68D" }}>
            {" "}
            {/* Başlık arka plan rengi */}
            <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>
              ID
            </TableCell>
            <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>
              Şube Adı
            </TableCell>
            <TableCell sx={{ color: "#FFFFFF", fontWeight: "bold" }}>
              Şube Notu
            </TableCell>
            <TableCell
              sx={{
                color: "#FFFFFF",
                fontWeight: "bold",
                textAlign: "center",
                paddingRight: "25px",
              }}
            >
              İşlemler
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subBranches.map((branch) => (
            <TableRow
              key={branch.id}
              sx={{
                "&:nth-of-type(odd)": { backgroundColor: "#F8F1E4" }, // Alternatif satır rengi
                "&:nth-of-type(even)": { backgroundColor: "#FFFFFF" },
              }}
            >
              <TableCell>{branch.id}</TableCell>
              <TableCell>{branch.name}</TableCell>
              <TableCell>{branch.branch_note || "Bilgi Yok"}</TableCell>
              <TableCell
                sx={{
                  textAlign: "center",
                  paddingRight: "20px",
                }}
              >
                <IconButton
                  onClick={() => handleOpenInventory(branch.id, branch.name)}
                  sx={{
                    color: "#6B7280", // Envanter ikonu rengi
                    "&:hover": { color: "#8FA781" }, // Hover rengi
                  }}
                  aria-label="Şube Envanterini Görüntüle"
                >
                  <BackpackIcon />
                </IconButton>
                <IconButton
                  onClick={() => openModal(branch)}
                  sx={{
                    color: "#B17F59", // Düzenle ikonu rengi
                    "&:hover": { color: "#8FA781" }, // Hover rengi
                  }}
                  aria-label="Düzenle"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => openDeleteDialog(branch)}
                  sx={{
                    color: "#E57373", // Sil ikonu rengi
                    "&:hover": { color: "#D32F2F" }, // Hover rengi
                  }}
                  aria-label="Sil"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <InventoryModal
        isOpen={openInventory}
        onClose={handleCloseInventory}
        inventory={inventory}
        branchName={selectedBranchName}
      />
      {/* Güncelleme Modalı */}
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box
          sx={{
            ...style,
            backgroundColor: "#F8F1E4", // Modal arka plan rengi
            borderRadius: "10px", // Köşeleri yuvarlatma
            boxShadow: "0px 4px 10px rgba(0, 0, 0.2)", // Hafif gölge
          }}
        >
          {selectedSubBranch && (
            <UpdateSubBranchForm
              initialData={{
                name: selectedSubBranch.name,
                branch_note: selectedSubBranch.branch_note,
              }}
              onSubmit={handleUpdateSubBranch}
              onCancel={closeModal}
            />
          )}
        </Box>
      </Modal>

      {/* Silme Onay Diyaloğu */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{ color: "#A5B68D", fontWeight: "bold" }}
        >
          Alt Şubeyi Sil
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {branchToDelete
              ? `${branchToDelete.name} alt şubesini silmek istediğinizden emin misiniz?`
              : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeDeleteDialog}
            sx={{
              color: "#FFFFFF",
              backgroundColor: "#B17F59",
              "&:hover": { backgroundColor: "#8FA781" },
            }}
          >
            İptal
          </Button>
          <Button
            onClick={handleDeleteSubBranch}
            sx={{
              color: "#FFFFFF",
              backgroundColor: "#E57373",
              "&:hover": { backgroundColor: "#D32F2F" },
            }}
            autoFocus
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

// Prop Types
SubBranchTable.propTypes = {
  subBranches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      branch_note: PropTypes.string,
    })
  ).isRequired,
  onReload: PropTypes.func.isRequired, // Tabloyu yeniden yüklemek için bir fonksiyon
};

export default SubBranchTable;

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
import { updateBranch, deleteBranch } from "../../utils/api"; // Silme ve güncelleme API fonksiyonları
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

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

const SubBranchTable = ({ subBranches, onReload }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubBranch, setSelectedSubBranch] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);

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

  return (
    <TableContainer component={Paper} sx={{ marginTop: 2 }}>
      {/* Başlık */}
      <Typography variant="h6" align="center" sx={{ padding: 2 }}>
        Alt Şube Detayları
      </Typography>

      {/* Tablo */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Şube Adı</TableCell>
            <TableCell>Şube Notu</TableCell>
            <TableCell>İşlemler</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Alt şubeler verilerini satır olarak render et */}
          {subBranches.map((branch) => (
            <TableRow key={branch.id}>
              <TableCell>{branch.id}</TableCell>
              <TableCell>{branch.name}</TableCell>
              <TableCell>{branch.branch_note || "Bilgi Yok"}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => openModal(branch)}
                  color="primary"
                  aria-label="Düzenle"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => openDeleteDialog(branch)}
                  color="secondary"
                  aria-label="Sil"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Güncelleme Modalı */}
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box sx={style}>
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
        <DialogTitle id="alert-dialog-title">Alt Şubeyi Sil</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {branchToDelete
              ? `${branchToDelete.name} alt şubesini silmek istediğinizden emin misiniz?`
              : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            İptal
          </Button>
          <Button onClick={handleDeleteSubBranch} color="secondary" autoFocus>
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

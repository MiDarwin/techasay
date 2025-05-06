import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  Snackbar,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { importInventory } from "@/app/utils/api";

const modalStyle = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const requiredColumns = ["company_name", "branch_name"];

const InventoryImportModal = ({ open, onClose }) => {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const result = await importInventory(file);
      setFeedback(
        `Eklendi: ${result.added}, Güncellendi: ${result.updated}, Pas: ${result.skipped}`
      );
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        BackdropProps={{ sx: { backdropFilter: "blur(4px)" } }}
      >
        <Box sx={modalStyle}>
          <Typography color="black" variant="h6" mb={2}>
            Excel ile Envanter Yükle
          </Typography>
          <Typography color="black" variant="body2">
            Excel dosyasında bulunması gereken sütunlar:
          </Typography>
          <List color="black" dense>
            {requiredColumns.map((col) => (
              <ListItem style={{ color: "black" }} key={col}>
                - {col}
              </ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileIcon />}
            sx={{ mt: 2 }}
          >
            Dosya Seç
            <input
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {file && (
            <Typography color="black" variant="body2" mt={1}>
              Seçilen dosya: {file.name}
            </Typography>
          )}
          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={onClose}>İptal</Button>
            <Button variant="contained" onClick={handleUpload} disabled={!file}>
              Yükle
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={feedback}
      />
    </>
  );
};

export default InventoryImportModal;

import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  Button,
  Checkbox,
  FormControlLabel,
  Snackbar,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { importInventory, importInventoryByCompany } from "@/app/utils/api";

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

const InventoryImportModal = ({ open, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [useCompany, setUseCompany] = useState(false); // <-- Şenpiliç tiki
  const [feedback, setFeedback] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      let result;
      if (useCompany) {
        // Şenpiliç için sabit company_id = 2
        result = await importInventoryByCompany(2, file);
      } else {
        // Eskiden olduğu gibi branch bazlı
        result = await importInventory(file);
      }
      setFeedback(
        `Eklendi: ${result.added}, Güncellendi: ${result.updated}, Pas: ${result.skipped}`
      );
      onUploadSuccess?.();
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

          {/* ← Buraya ekledik */}

          <Typography color="black" variant="body2">
            Excel dosyasında bulunması gereken sütunlar:
          </Typography>
          <List color="black" dense>
            {requiredColumns.map((col) => (
              <ListItem sx={{ color: "black" }} key={col}>
                – {col}
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
          <FormControlLabel
            control={
              <Checkbox
                checked={useCompany}
                onChange={(e) => setUseCompany(e.target.checked)}
              />
            }
            label="Şenpiliç"
            sx={{ color: "black" }}
          />
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

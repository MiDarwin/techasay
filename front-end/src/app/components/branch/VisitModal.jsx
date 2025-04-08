import React, { useState } from "react";
import {
  Box,
  Modal,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  TextField,
  MenuItem,
  Tooltip,
  IconButton,
  Avatar,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import PropTypes from "prop-types";
import { getPhotoUrl } from "../../utils/api";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  maxHeight: "80vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  borderRadius: "8px",
  boxShadow: 24,
  p: 4,
};

const VisitModal = ({
  branch,
  isOpen,
  onClose,
  branchVisits,
  isLoading,
  onCreateVisit,
}) => {
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [note, setNote] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [plannedVisitDate, setPlannedVisitDate] = useState("");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("note", note);
    formData.append("visit_date", visitDate);
    formData.append("planned_visit_date", plannedVisitDate);
    if (photo) formData.append("photo", photo);

    onCreateVisit(branch.id, formData);
    setShowVisitForm(false);
    setNote("");
    setVisitDate("");
    setPlannedVisitDate("");
    setPhoto(null);
    setPreview(null);
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" mb={2}>
          Ziyaretler
        </Typography>

        {isLoading ? (
          <CircularProgress />
        ) : (
          <List sx={{ maxHeight: "300px", overflowY: "auto" }}>
            {branchVisits.map((visit) => (
              <ListItem
                key={visit.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #eee",
                }}
              >
                <ListItemText
                  primary={`Tarih: ${new Date(
                    visit.visit_date
                  ).toLocaleString()}`}
                  secondary={`Not: ${visit.note}`}
                />
                {visit.photo_id && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      const photoUrl = getPhotoUrl(visit.photo_id); // Fotoğraf URL'sini al
                      window.open(photoUrl, "_blank"); // Yeni sekmede aç
                    }}
                  >
                    Fotoğrafı Gör
                  </Button>
                )}
                <Tooltip
                  title={
                    <>
                      <div>Ad: {visit.user_name}</div>
                      <div>Soyad: {visit.user_surname}</div>
                      <div>Telefon: {visit.user_phone_number}</div>
                    </>
                  }
                >
                  <IconButton>
                    <InfoIcon />
                  </IconButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
        )}

        {showVisitForm ? (
          <>
            <TextField
              fullWidth
              label="Not"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              type="datetime-local"
              label="Ziyaret Tarihi"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="datetime-local"
              label="Planlanan Ziyaret Tarihi"
              value={plannedVisitDate}
              onChange={(e) => setPlannedVisitDate(e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <Box mt={2} display="flex" alignItems="center" gap={2}>
              <Button variant="outlined" component="label">
                Fotoğraf Seç
                <input type="file" hidden onChange={handlePhotoChange} />
              </Button>
              {preview && (
                <Avatar
                  src={preview}
                  variant="rounded"
                  sx={{ width: 56, height: 56 }}
                />
              )}
            </Box>

            <Box mt={2} display="flex" justifyContent="space-between">
              <Button variant="contained" onClick={handleSubmit}>
                Kaydet
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowVisitForm(false)}
              >
                İptal
              </Button>
            </Box>
          </>
        ) : (
          <Button
            fullWidth
            variant="contained"
            onClick={() => setShowVisitForm(true)}
          >
            Yeni Ziyaret Ekle
          </Button>
        )}
      </Box>
    </Modal>
  );
};

VisitModal.propTypes = {
  branch: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  branchVisits: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onCreateVisit: PropTypes.func.isRequired,
};

export default VisitModal;

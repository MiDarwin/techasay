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
} from "@mui/material";
import PropTypes from "prop-types";
import { getPhotoUrl } from "../../utils/api";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
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
  const [photo, setPhoto] = useState(null);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("note", note);
    formData.append("visit_date", visitDate);
    if (photo) {
      formData.append("photo", photo);
    }

    onCreateVisit(branch.id, formData);
    setShowVisitForm(false);
  };

  return (
    <Modal open={isOpen} onClose={onClose} aria-labelledby="visit-modal-title">
      <Box sx={style}>
        <Typography id="visit-modal-title" variant="h6" component="h2">
          {branch.branch_name} Şubesi
        </Typography>

        {isLoading ? (
          <CircularProgress />
        ) : branchVisits.length > 0 ? (
          <List>
            {branchVisits.map((visit) => (
              <ListItem key={visit.id}>
                <ListItemText
                  primary={`Tarih: ${visit.visit_date}`}
                  secondary={`Not: ${visit.note || "Not Yok"}`}
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
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>
            Bu şube için henüz bir ziyaret oluşturulmamış.
          </Typography>
        )}

        <Button
          variant="contained"
          color="success"
          onClick={() => setShowVisitForm(true)}
          sx={{ mt: 2 }}
        >
          Ziyaret Oluştur
        </Button>

        {/* Ziyaret Formu */}
        {showVisitForm && (
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Not"
              fullWidth
              multiline
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Tarih"
              type="datetime-local"
              fullWidth
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button variant="contained" component="label" sx={{ mb: 2 }}>
              Fotoğraf Yükle
              <input
                type="file"
                hidden
                onChange={(e) => setPhoto(e.target.files[0])}
              />
            </Button>
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Ziyaret Oluştur
            </Button>
            <Button
              variant="text"
              color="error"
              onClick={() => setShowVisitForm(false)}
              sx={{ mt: 1 }}
            >
              İptal
            </Button>
          </Box>
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

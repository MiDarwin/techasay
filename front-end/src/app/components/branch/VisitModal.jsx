import React, { useState, useEffect } from "react";
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
  const [plannedVisitDate, setPlannedVisitDate] = useState("");
  const [photo, setPhoto] = useState(null);

  // Varsayılan olarak bugünün tarih ve saatini ayarla
  useEffect(() => {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm formatında
    setVisitDate(formattedDate);
  }, []);

  // Ziyaret tarihini güncelleme
  const handleVisitDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7); // 7 gün öncesi

    // Kullanıcının seçtiği tarih 7 gün öncesinden daha eskiyse engelle
    if (selectedDate < sevenDaysAgo) {
      alert("Ziyaret tarihi en fazla 7 gün geriye gidebilir.");
      return;
    }

    setVisitDate(e.target.value);
  };

  // Planlanan ziyaret tarihini güncelleme
  const handlePlannedVisitDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const now = new Date();

    // Kullanıcının seçtiği tarih geçmiş bir tarih ise engelle
    if (selectedDate < now) {
      alert("Planlanan ziyaret tarihi geçmiş bir tarih olamaz.");
      return;
    }

    setPlannedVisitDate(e.target.value);
  };

  // Belirli bir gün ekleyerek planlanan ziyaret tarihini ayarla
  const handlePlannedVisitDays = (days) => {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days); // Belirtilen gün sayısını ekle
    const formattedDate = futureDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm formatında
    setPlannedVisitDate(formattedDate);
  };

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append("note", note);
    formData.append("visit_date", visitDate);
    if (plannedVisitDate) {
      formData.append("planned_visit_date", plannedVisitDate);
    }
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
              label="Ziyaret Tarihi"
              type="datetime-local"
              fullWidth
              value={visitDate}
              onChange={handleVisitDateChange}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Planlanan Ziyaret Tarihi"
              type="datetime-local"
              fullWidth
              value={plannedVisitDate}
              onChange={handlePlannedVisitDateChange}
              sx={{ mb: 2 }}
            />
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom>
                Planlanan Ziyaret Tarihini Seç:
              </Typography>
              {[10, 20, 30, 40].map((days) => (
                <Button
                  key={days}
                  variant="outlined"
                  sx={{ mr: 1 }}
                  onClick={() => handlePlannedVisitDays(days)}
                >
                  {days} Gün
                </Button>
              ))}
            </Box>
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

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
  // Varsayılan olarak bugünün tarih ve saatini ayarla
  useEffect(() => {
    const now = new Date();

    // Yerel saat dilimine göre tarih ve saat formatla
    const formattedDate = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16); // YYYY-MM-DDTHH:mm formatında

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
  const calculateRemainingPercentage = (plannedDate) => {
    const currentTime = new Date().getTime();
    const plannedTime = new Date(plannedDate).getTime();

    // Planlanan tarih geçmişteyse %100 tamamlanmış olarak göster
    if (currentTime >= plannedTime) {
      return 100;
    }

    // Toplam süreyi ve geçen süreyi hesapla
    const totalDuration = plannedTime - currentTime;
    const elapsedDuration = currentTime - new Date().setHours(0, 0, 0, 0); // Bu şekilde başlangıç için 0'dan güncel saate kadar geçen süreyi hesaplar

    // % tamamlanmayı hesapla
    const percentage = Math.max(
      0,
      Math.min(100, (elapsedDuration / totalDuration) * 100)
    );

    return percentage;
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
            {branchVisits.map((visit) => {
              const percentage = visit.planned_visit_date
                ? calculateRemainingPercentage(visit.planned_visit_date)
                : null;

              return (
                <ListItem
                  key={visit.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
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
                  {visit.planned_visit_date && (
                    <Tooltip
                      title={`Planlanan Tarih: ${new Date(
                        visit.planned_visit_date
                      ).toLocaleString()}`}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <CircularProgress
                          variant="determinate"
                          value={percentage}
                          size={50}
                          thickness={5}
                        />
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: "absolute",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            component="div"
                            color="textSecondary"
                          >
                            {`${Math.round(percentage)}%`}
                          </Typography>
                        </Box>
                      </Box>
                    </Tooltip>
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
              );
            })}
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

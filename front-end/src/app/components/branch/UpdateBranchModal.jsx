import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
} from "@mui/material";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solid #1976d2",
  boxShadow: 24,
  p: 4,
};

const UpdateBranchModal = ({ open, onClose, branchData, onUpdate }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    address: "",
    city: "",
    phone_number: "",
    branch_note: "",
    location_link: "",
  });

  useEffect(() => {
    // Eğer branchData varsa, formu doldur
    if (branchData) {
      setFormData({
        id: branchData.id || branchData._id || "", // Burada branch_id alınıyor
        name: branchData.name || "",
        address: branchData.address || "",
        city: branchData.city || "",
        phone_number: branchData.phone_number || "",
        branch_note: branchData.branch_note || "",
        location_link: branchData.location_link || "",
      });
    }
  }, [branchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      // API çağrısında branch_id ve diğer verileri gönderiyoruz
      await onUpdate(formData.id, {
        branch_name: formData.name,
        address: formData.address,
        city: formData.city,
        phone_number: formData.phone_number,
        branch_note: formData.branch_note,
        location_link: formData.location_link,
      });
      onClose(); // Modalı kapat
    } catch (error) {
      alert("Güncelleme sırasında bir hata oluştu.");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Şube Güncelle
        </Typography>
        <form>
          <TextField
            label="Şube Adı"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Adres"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Şehir"
            name="city"
            value={formData.city}
            onChange={handleChange}
            select
            fullWidth
            margin="normal"
            required
          >
            {[
              "Adana",
              "Ankara",
              "İstanbul",
              "İzmir",
              "Antalya",
              "Bursa",
              "Konya",
            ].map((city) => (
              <MenuItem key={city} value={city}>
                {city}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Telefon Numarası"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Şube Notu"
            name="branch_note"
            value={formData.branch_note}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Konum Linki"
            name="location_link"
            value={formData.location_link}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="outlined"
              color="error"
              onClick={onClose}
              sx={{ mr: 1 }}
            >
              İptal
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Güncelle
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

UpdateBranchModal.propTypes = {
  open: PropTypes.bool.isRequired, // Modalın açık/kapalı durumu
  onClose: PropTypes.func.isRequired, // Modalı kapatma fonksiyonu
  branchData: PropTypes.shape({
    id: PropTypes.string, // Şube id'si
    name: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    phone_number: PropTypes.string,
    branch_note: PropTypes.string,
    location_link: PropTypes.string,
  }), // Düzenlenecek şube verisi
  onUpdate: PropTypes.func.isRequired, // Güncelleme API çağrısı
};

export default UpdateBranchModal;

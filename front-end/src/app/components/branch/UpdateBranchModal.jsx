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
import { turkishCities } from "./cities";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  border: "2px solidrgb(19, 35, 51)",
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
    phone_number_2: "",
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
        phone_number_2: branchData.phone_number_2 || "", // Burada phone_number_2 ekleniyor
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
        phone_number_2: formData.phone_number_2,
      });
      onClose(); // Modalı kapat
    } catch (error) {
      alert("Güncelleme sırasında bir hata oluştu.");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          ...style,
          backgroundColor: "#F8F1E4", // Arka plan rengi
          borderRadius: "10px", // Köşeleri yuvarlatma
          boxShadow: "0px 4px 10px rgba(0, 0, 0.2)", // Gölge efekti
          padding: "20px",
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            mb: 2,
            color: "#A5B68D", // Başlık rengi
            textAlign: "center", // Ortalanmış başlık
            fontWeight: "bold",
          }}
        >
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
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#A5B68D", // Border rengi
                },
                "&:hover fieldset": {
                  borderColor: "#8FA781", // Hover border rengi
                },
              },
            }}
          />
          <TextField
            label="Adres"
            name="address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#A5B68D",
                },
                "&:hover fieldset": {
                  borderColor: "#8FA781",
                },
              },
            }}
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
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#A5B68D",
                },
                "&:hover fieldset": {
                  borderColor: "#8FA781",
                },
              },
            }}
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
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#A5B68D",
                },
                "&:hover fieldset": {
                  borderColor: "#8FA781",
                },
              },
            }}
          />
          <TextField
            label="Yedek Telefon Numarası"
            name="phone_number_2"
            value={formData.phone_number_2}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#A5B68D",
                },
                "&:hover fieldset": {
                  borderColor: "#8FA781",
                },
              },
            }}
          />

          <TextField
            label="Şube Notu"
            name="branch_note"
            value={formData.branch_note}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#A5B68D",
                },
                "&:hover fieldset": {
                  borderColor: "#8FA781",
                },
              },
            }}
          />
          <TextField
            label="Konum Linki"
            name="location_link"
            value={formData.location_link}
            onChange={handleChange}
            fullWidth
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#A5B68D",
                },
                "&:hover fieldset": {
                  borderColor: "#8FA781",
                },
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                color: "#A5B68D",
                borderColor: "#A5B68D",
                "&:hover": {
                  borderColor: "#8FA781",
                  backgroundColor: "#F0EFE6",
                },
                mr: 1,
              }}
            >
              İptal
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                backgroundColor: "#A5B68D",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: "#8FA781",
                },
              }}
            >
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
    phone_number_2: PropTypes.string,
  }), // Düzenlenecek şube verisi
  onUpdate: PropTypes.func.isRequired, // Güncelleme API çağrısı
};

export default UpdateBranchModal;

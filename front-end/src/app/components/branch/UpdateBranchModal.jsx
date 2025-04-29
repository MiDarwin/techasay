import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { turkishCities } from "./cities";
import { MapPin } from "lucide-react";
import { getBranchCoords } from "../../utils/api";

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
  const [districts, setDistricts] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    address: "",
    city: "",
    district: "",
    phone_number: "",
    phone_number_2: "",
    branch_note: "",
    location_link: "",
  });
  const [coordsLoading, setCoordsLoading] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [showCoords, setShowCoords] = useState(false);

  useEffect(() => {
    if (branchData) {
      setFormData({
        id: branchData.id || branchData._id || "",
        name: branchData.name || "",
        address: branchData.address || "",
        city: branchData.city || "",
        district: branchData.district || "",
        phone_number: branchData.phone_number || "",
        phone_number_2: branchData.phone_number_2 || "",
        branch_note: branchData.branch_note || "",
        location_link: branchData.location_link || "",
      });
      if (branchData.city) {
        setDistricts(turkishCities[branchData.city] || []);
      }
      if (branchData.latitude != null && branchData.longitude != null) {
        setLatitude(branchData.latitude);
        setLongitude(branchData.longitude);
        setShowCoords(true);
      } else {
        setShowCoords(false);
      }
    }
  }, [branchData]);

  const handleCityChange = (selectedCity) => {
    setFormData((prev) => ({
      ...prev,
      city: selectedCity,
      district: "",
    }));
    setDistricts(turkishCities[selectedCity] || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoordsExtract = async () => {
    if (!formData.location_link) return;
    try {
      setCoordsLoading(true);
      const { latitude: lat, longitude: lng } = await getBranchCoords(
        formData.location_link
      );
      setLatitude(lat);
      setLongitude(lng);
      setShowCoords(true);
    } catch (err) {
      console.error("Koordinat alınırken hata:", err);
    } finally {
      setCoordsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await onUpdate(formData.id, {
        branch_name: formData.name,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        phone_number: formData.phone_number,
        branch_note: formData.branch_note,
        location_link: formData.location_link,
        phone_number_2: formData.phone_number_2,
        ...(showCoords
          ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
          : {}),
      });
      onClose();
      if (typeof onUpdate === "function") {
        await onUpdate();
      }
    } catch (error) {
      console.error("Şube güncellenirken hata oluştu:", error);
      alert("Şube güncellenirken bir hata oluştu.");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          ...style,
          backgroundColor: "#f5f5f5",
          borderRadius: "10px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0.2)",
          padding: "20px",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{ mb: 2, color: "gray", textAlign: "center", fontWeight: "bold" }}
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
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "gray" },
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
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "gray" },
              },
            }}
          />
          <TextField
            label="Şehir"
            name="city"
            value={formData.city}
            onChange={(e) => handleCityChange(e.target.value)}
            select
            fullWidth
            margin="normal"
            required
          >
            {Object.keys(turkishCities).map((cityName) => (
              <MenuItem key={cityName} value={cityName}>
                {cityName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="İlçe"
            name="district"
            value={formData.district}
            onChange={handleChange}
            select
            fullWidth
            margin="normal"
            required
          >
            {districts.map((districtName) => (
              <MenuItem key={districtName} value={districtName}>
                {districtName}
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
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "gray" },
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
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "gray" },
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
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "gray" },
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
                "& fieldset": { borderColor: "gray" },
                "&:hover fieldset": { borderColor: "gray" },
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleCoordsExtract}
              disabled={coordsLoading}
              sx={{ mr: 1 }}
            >
              {coordsLoading ? (
                <CircularProgress size={20} />
              ) : (
                <MapPin style={{ marginRight: "8px" }} />
              )}
              Koordinat Çıkar
            </Button>
          </Box>
          {showCoords && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mt: 2,
              }}
            >
              <TextField
                label="Enlem"
                name="latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Boylam"
                name="longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                fullWidth
                margin="normal"
              />
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{ color: "black", borderColor: "gray", mr: 1 }}
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
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  branchData: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    address: PropTypes.string,
    city: PropTypes.string,
    district: PropTypes.string,
    phone_number: PropTypes.string,
    branch_note: PropTypes.string,
    location_link: PropTypes.string,
    phone_number_2: PropTypes.string,
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
  onUpdate: PropTypes.func.isRequired,
};

export default UpdateBranchModal;

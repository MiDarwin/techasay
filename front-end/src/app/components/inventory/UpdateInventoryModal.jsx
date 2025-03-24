"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { updateInventory, getInventoryHelpers } from "../../utils/api";

const UpdateInventoryModal = ({
  open,
  onClose,
  inventory,
  onInventoryUpdated,
}) => {
  const [deviceTypes, setDeviceTypes] = useState([]); // Cihaz türleri
  const [deviceModels, setDeviceModels] = useState([]); // Seçili türe ait modeller
  const [deviceType, setDeviceType] = useState(inventory.device_type || "");
  const [deviceModel, setDeviceModel] = useState(inventory.device_model || "");
  const [quantity, setQuantity] = useState(inventory.quantity || 1);
  const [specs, setSpecs] = useState(inventory.specs || "");

  // Cihaz türlerini API'den çek
  useEffect(() => {
    getInventoryHelpers()
      .then(setDeviceTypes)
      .catch((err) =>
        console.error("Cihaz türleri alınırken hata oluştu:", err)
      );
  }, []);

  // Seçili cihaz türüne göre modelleri belirle
  useEffect(() => {
    if (deviceType) {
      const selectedDevice = deviceTypes.find(
        (type) => type.device_type === deviceType
      );
      setDeviceModels(selectedDevice ? selectedDevice.device_models : []);
    } else {
      setDeviceModels([]);
    }
  }, [deviceType, deviceTypes]);

  // Güncelleme işlemi
  const handleSubmit = async () => {
    try {
      if (!deviceType || !deviceModel) {
        alert("Lütfen cihaz türü ve modelini seçin!");
        return;
      }

      const updateData = {
        device_type: deviceType,
        device_model: deviceModel,
        quantity,
        specs,
      };

      await updateInventory(inventory.id, updateData);
      alert("Envanter başarıyla güncellendi!");
      onInventoryUpdated();
      onClose();
    } catch (err) {
      console.error("Envanter güncellenirken hata oluştu:", err);
      alert("Envanter güncellenirken bir hata oluştu.");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "fit-content",
          maxWidth: "90vw",
          maxHeight: "90vh",
          bgcolor: "#F8F1E4",
          boxShadow: "0px 4px 10px rgba(0, 0, 0.2)",
          p: 4,
          borderRadius: "10px",
          overflow: "auto",
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          mb={2}
          sx={{ color: "#A5B68D", textAlign: "center", fontWeight: "bold" }}
        >
          Envanteri Güncelle
        </Typography>

        {/* Cihaz Türü Seçimi */}
        <TextField
          select
          fullWidth
          margin="normal"
          label="Cihaz Türü"
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#A5B68D" },
            },
          }}
        >
          {deviceTypes.map((type) => (
            <MenuItem key={type.device_type} value={type.device_type}>
              {type.device_type}
            </MenuItem>
          ))}
        </TextField>

        {/* Cihaz Modeli Seçimi */}
        <TextField
          select
          fullWidth
          margin="normal"
          label="Cihaz Modeli"
          value={deviceModel}
          onChange={(e) => setDeviceModel(e.target.value)}
          disabled={!deviceType} // Cihaz türü seçilmeden model seçilemez
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#A5B68D" },
            },
          }}
        >
          {deviceModels.map((model) => (
            <MenuItem key={model} value={model}>
              {model}
            </MenuItem>
          ))}
        </TextField>

        {/* Adet Girişi */}
        <TextField
          fullWidth
          margin="normal"
          label="Adet"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#A5B68D" },
            },
          }}
        />

        {/* Özellikler */}
        <TextField
          fullWidth
          margin="normal"
          label="Özellikler"
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#A5B68D" },
            },
          }}
        />

        {/* Güncelle Butonu */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          sx={{
            mt: 2,
            backgroundColor: "#A5B68D",
            color: "#FFFFFF",
            "&:hover": { backgroundColor: "#8FA781" },
          }}
        >
          Güncelle
        </Button>
      </Box>
    </Modal>
  );
};

export default UpdateInventoryModal;

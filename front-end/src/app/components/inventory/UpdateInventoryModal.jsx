"use client";

import React, { useState } from "react";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import { updateInventory } from "../../utils/api";

const UpdateInventoryModal = ({
  open,
  onClose,
  inventory,
  onInventoryUpdated,
}) => {
  const [deviceType, setDeviceType] = useState(inventory.device_type || "");
  const [deviceModel, setDeviceModel] = useState(inventory.device_model || "");
  const [quantity, setQuantity] = useState(inventory.quantity || 1);
  const [specs, setSpecs] = useState(inventory.specs || "");

  // Formu gönder
  const handleSubmit = async () => {
    try {
      const updateData = {
        device_type: deviceType,
        device_model: deviceModel,
        quantity,
        specs, // Opsiyonel alan
      };

      await updateInventory(inventory.id, updateData); // API çağrısı
      alert("Envanter başarıyla güncellendi!");
      onInventoryUpdated(); // Güncelleme işleminden sonra listeyi yenile
      onClose(); // Modalı kapat
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
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" mb={2}>
          Envanteri Güncelle
        </Typography>

        {/* Form Alanları */}
        <TextField
          fullWidth
          margin="normal"
          label="Cihaz Türü"
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Cihaz Modeli"
          value={deviceModel}
          onChange={(e) => setDeviceModel(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Adet"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Özellikler"
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
        />

        {/* Gönder Butonu */}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleSubmit}
        >
          Güncelle
        </Button>
      </Box>
    </Modal>
  );
};

export default UpdateInventoryModal;

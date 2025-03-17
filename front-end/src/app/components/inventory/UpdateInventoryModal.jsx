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
          width: "fit-content", // İçeriğe göre genişlik
          maxWidth: "90vw", // Ekranın %90'ını aşmasın
          maxHeight: "90vh", // Ekranın %90'ını aşmasın
          bgcolor: "#F8F1E4", // Arka plan rengi
          boxShadow: "0px 4px 10px rgba(0, 0, 0.2)", // Hafif gölge efekti
          p: 4,
          borderRadius: "10px", // Köşeleri yuvarlatma
          overflow: "auto", // İçerik taşması durumunda kaydırma çubuğu
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          mb={2}
          sx={{
            color: "#A5B68D", // Başlık rengi
            textAlign: "center", // Ortalanmış başlık
            fontWeight: "bold",
          }}
        >
          Envanteri Güncelle
        </Typography>

        {/* Form Alanları */}
        <TextField
          fullWidth
          margin="normal"
          label="Cihaz Türü"
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#A5B68D", // Çerçeve rengi
              },
              "&:hover fieldset": {
                borderColor: "#8FA781", // Hover çerçeve rengi
              },
            },
          }}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Cihaz Modeli"
          value={deviceModel}
          onChange={(e) => setDeviceModel(e.target.value)}
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
          fullWidth
          margin="normal"
          label="Adet"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
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
          fullWidth
          margin="normal"
          label="Özellikler"
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
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

        {/* Gönder Butonu */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          sx={{
            mt: 2,
            backgroundColor: "#A5B68D", // Buton arka plan rengi
            color: "#FFFFFF", // Buton metin rengi
            "&:hover": {
              backgroundColor: "#8FA781", // Hover rengi
            },
          }}
        >
          Güncelle
        </Button>
      </Box>
    </Modal>
  );
};

export default UpdateInventoryModal;

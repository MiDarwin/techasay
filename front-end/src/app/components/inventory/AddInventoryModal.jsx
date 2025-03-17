"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Modal,
} from "@mui/material";
import { createInventory, getBranchesByCompanyId } from "../../utils/api";

const AddInventoryModal = ({
  open,
  onClose,
  companies,
  selectedCompanyId,
  selectedBranchId,
  onInventoryAdded,
}) => {
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState(selectedBranchId || "");
  const [companyId, setCompanyId] = useState(selectedCompanyId || "");
  const [deviceType, setDeviceType] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [quantity, setQuantity] = useState(1); // Default olarak 1
  const [specs, setSpecs] = useState("");

  // Şubeleri alma
  const fetchBranches = async (companyId) => {
    try {
      const branchData = await getBranchesByCompanyId(companyId);
      setBranches(branchData);
    } catch (err) {
      console.error("Şubeler alınırken hata oluştu:", err);
    }
  };

  // Şirket değiştiğinde şubeleri yükle
  useEffect(() => {
    if (companyId) {
      fetchBranches(companyId);
    }
  }, [companyId]);

  // Formu gönder
  const handleSubmit = async () => {
    try {
      if (!branchId || !deviceType || !deviceModel) {
        alert("Lütfen gerekli tüm alanları doldurun!");
        return;
      }

      const inventoryData = {
        device_type: deviceType,
        device_model: deviceModel,
        quantity,
        specs, // specs opsiyonel olduğu için boş gönderilebilir
      };

      await createInventory(branchId, inventoryData);
      alert("Envanter başarıyla eklendi!");
      onInventoryAdded(); // Envanter eklendikten sonra listeyi güncelle
      onClose(); // Modalı kapat
    } catch (err) {
      console.error("Envanter eklenirken hata oluştu:", err);
      alert("Envanter eklenirken bir hata oluştu.");
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
          width: "fit-content", // İçeriğe göre genişlik ayarı
          maxWidth: "90vw", // Ekranın %90'ını aşmasın
          maxHeight: "90vh", // Ekranın %90'ını aşmasın
          bgcolor: "#F8F1E4", // Arka plan rengi
          boxShadow: "0px 4px 10px rgba(0, 0, 0.2)", // Hafif gölge efekti
          p: 4,
          borderRadius: "10px", // Köşeleri yuvarlatma
          overflow: "auto", // Taşma durumunda kaydırma çubuğu
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            color: "#A5B68D", // Başlık rengi
            textAlign: "center", // Ortalanmış başlık
            fontWeight: "bold",
          }}
        >
          Yeni Envanter Ekle
        </Typography>

        {/* Şirket Seçimi */}
        <FormControl fullWidth margin="normal">
          <InputLabel sx={{ color: "#6B7280" }}>Şirket Seçin</InputLabel>
          <Select
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value);
              setBranchId(""); // Şirket değiştiğinde şube sıfırlanır
            }}
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
          >
            <MenuItem value="">
              <em>Şirket Seçin</em>
            </MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.company_id} value={company.company_id}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Şube Seçimi */}
        <FormControl
          fullWidth
          margin="normal"
          disabled={!companyId}
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
          <InputLabel sx={{ color: "#6B7280" }}>Şube Seçin</InputLabel>
          <Select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
          >
            <MenuItem value="">
              <em>Şube Seçin</em>
            </MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Envanter Bilgileri */}
        <TextField
          fullWidth
          margin="normal"
          label="Cihaz Türü"
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value)}
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
          Envanter Ekle
        </Button>
      </Box>
    </Modal>
  );
};

export default AddInventoryModal;

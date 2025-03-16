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
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2">
          Yeni Envanter Ekle
        </Typography>

        {/* Şirket Seçimi */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Şirket Seçin</InputLabel>
          <Select
            value={companyId}
            onChange={(e) => {
              setCompanyId(e.target.value);
              setBranchId(""); // Şirket değiştiğinde şube sıfırlanır
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
        <FormControl fullWidth margin="normal" disabled={!companyId}>
          <InputLabel>Şube Seçin</InputLabel>
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
          Envanter Ekle
        </Button>
      </Box>
    </Modal>
  );
};

export default AddInventoryModal;

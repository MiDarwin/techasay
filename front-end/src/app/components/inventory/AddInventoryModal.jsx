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
import {
  createInventory,
  getBranchesByCompanyId,
  getSubBranchesByBranchId,
  getInventoryHelpers, // Cihaz türlerini çekmek için API fonksiyonu
  getModelsByDeviceType,
} from "../../utils/api";

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
  const [deviceTypes, setDeviceTypes] = useState([]); // Cihaz türleri
  const [deviceModels, setDeviceModels] = useState([]); // Seçilen türün modelleri
  const [quantity, setQuantity] = useState(1); // Default olarak 1
  const [specs, setSpecs] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [subBranches, setSubBranches] = useState([]); // Alt şubeleri tutmak için state
  const [hasSubBranches, setHasSubBranches] = useState("");
  const [selectedSubBranchId, setSelectedSubBranchId] = useState(""); // Seçilen alt şube ID'si

  // Şubeleri alma
  const fetchBranches = async (companyId) => {
    try {
      const branchData = await getBranchesByCompanyId(companyId);
      setBranches(branchData);
    } catch (err) {
      console.error("Şubeler alınırken hata oluştu:", err);
    }
  };

  // Alt şubeleri alma
  const fetchSubBranches = async (branchId) => {
    try {
      const selectedBranch = branches.find((branch) => branch.id === branchId);

      // Eğer seçilen şubenin alt şubesi yoksa sorgu yapma
      if (!selectedBranch || !selectedBranch.has_sub_branches) {
        setSubBranches([]); // Alt şubeleri sıfırla
        setHasSubBranches(false);
        return;
      }

      const data = await getSubBranchesByBranchId(branchId);
      setSubBranches(data);
      setHasSubBranches(data.length > 0);
    } catch (error) {
      console.error("Alt şubeler alınırken hata oluştu:", error);
    }
  };

  // Şirket değiştiğinde şubeleri yükle
  useEffect(() => {
    if (companyId) {
      fetchBranches(companyId);
    }
  }, [companyId]);

  // Şube değiştiğinde alt şubeleri kontrol et
  useEffect(() => {
    if (branchId) {
      fetchSubBranches(branchId);
    } else {
      setSubBranches([]);
      setHasSubBranches(false);
    }
    setSelectedSubBranchId(""); // Şube değiştiğinde alt şube seçimini sıfırla
  }, [branchId]);

  // **Cihaz türlerini API'den çek**
  useEffect(() => {
    getInventoryHelpers().then(setDeviceTypes).catch(console.error);
  }, []);

  // **Cihaz türü seçildiğinde modelleri API'den çek**
  useEffect(() => {
    if (deviceType) {
      const selectedDevice = deviceTypes.find(
        (type) => type.device_type === deviceType
      );
      setDeviceModels(selectedDevice ? selectedDevice.device_models : []);
    } else {
      setDeviceModels([]);
    }
    setDeviceModel("");
  }, [deviceType]);

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
        specs,
      };

      const targetBranchId = selectedSubBranchId || branchId;

      await createInventory(targetBranchId, inventoryData);
      alert("Envanter başarıyla eklendi!");
      onInventoryAdded();
      onClose();
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
        {/* Alt Şube Seçimi */}
        {hasSubBranches && (
          <FormControl fullWidth margin="normal">
            <InputLabel sx={{ color: "#6B7280" }}>Alt Şube Seçin</InputLabel>
            <Select
              value={selectedSubBranchId}
              onChange={(e) => setSelectedSubBranchId(e.target.value)}
            >
              <MenuItem value="">
                <em>Alt Şube Seçin</em>
              </MenuItem>
              {subBranches.map((subBranch) => (
                <MenuItem key={subBranch.id} value={subBranch.id}>
                  {subBranch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {/* Cihaz Türü Seçimi */}
        <FormControl fullWidth margin="normal">
          <InputLabel sx={{ color: "#6B7280" }}>Cihaz Türü</InputLabel>
          <Select
            value={deviceType}
            onChange={(e) => {
              setDeviceType(e.target.value);
              const selectedDevice = deviceTypes.find(
                (type) => type.device_type === e.target.value
              );
              setDeviceModels(
                selectedDevice ? selectedDevice.device_models : []
              );
              setDeviceModel(""); // Yeni tür seçildiğinde model sıfırlansın
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#A5B68D" },
                "&:hover fieldset": { borderColor: "#8FA781" },
              },
            }}
          >
            <MenuItem value="">
              <em>Cihaz Türü Seçin</em>
            </MenuItem>
            {deviceTypes.map((type) => (
              <MenuItem key={type.id} value={type.device_type}>
                {type.device_type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Cihaz Modeli Seçimi */}
        <FormControl fullWidth margin="normal" disabled={!deviceType}>
          <InputLabel sx={{ color: "#6B7280" }}>Cihaz Modeli</InputLabel>
          <Select
            value={deviceModel}
            onChange={(e) => setDeviceModel(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#A5B68D" },
                "&:hover fieldset": { borderColor: "#8FA781" },
              },
            }}
          >
            <MenuItem value="">
              <em>Cihaz Modeli Seçin</em>
            </MenuItem>
            {deviceModels.map((model, index) => (
              <MenuItem key={`${deviceType}-${index}`} value={model}>
                {model}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

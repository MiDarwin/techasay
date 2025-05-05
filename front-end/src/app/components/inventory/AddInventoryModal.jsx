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
  Autocomplete,
} from "@mui/material";
import {
  createInventory,
  getBranchesByCompanyId,
  getInventoryHelpers, // Cihaz türlerini çekmek için API fonksiyonu
  getSubBranchesByBranchId,
  getInventoryFieldsByBranch,
} from "../../utils/api";
import { turkishCities } from "../branch/cities"; // Şehir ve ilçeler için dosya importu
import tableStyles from "@/app/styles/tableStyles";

const AddInventoryModal = ({
  open,
  onClose,
  companies,
  selectedCompanyId,
  onInventoryAdded,
}) => {
  const [companyId, setCompanyId] = useState(selectedCompanyId || "");
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [deviceTypes, setDeviceTypes] = useState([]); // Cihaz türleri
  const [deviceModels, setDeviceModels] = useState([]); // Seçilen türün modelleri
  const [quantity, setQuantity] = useState(1); // Default olarak 1
  const [specs, setSpecs] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [subBranches, setSubBranches] = useState([]); // Alt şubeleri tutmak için state
  const [hasSubBranches, setHasSubBranches] = useState("");
  const [selectedSubBranchId, setSelectedSubBranchId] = useState(""); // Seçilen alt şube ID'si
  const [detailFields, setDetailFields] = useState([{ key: "", value: "" }]);
  const [fieldSuggestions, setFieldSuggestions] = useState([]);
  // Şirket değiştiğinde şubeleri yükleme
  const fetchBranches = async (companyId) => {
    try {
      const limit = 200; // İsteğe bağlı olarak limit değerini ayarlayın
      const data = await getBranchesByCompanyId(companyId, limit);
      setBranches(data);
    } catch (err) {
      console.error("Şubeler alınırken bir hata oluştu:", err);
    }
  };

  // Şirket değiştiğinde filtreleri sıfırlayıp şubeleri getir
  useEffect(() => {
    if (companyId) {
      setBranchId("");
      setAvailableDistricts([]);
      fetchBranches(companyId);
    }
  }, [companyId]);

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
    } catch (error) {}
  };
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
  // Cihaz türlerini API'den çek
  useEffect(() => {
    getInventoryHelpers().then(setDeviceTypes).catch(console.error);
  }, []);

  // Cihaz türü seçildiğinde modelleri API'den çek
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
      if (!branchId) {
        alert("Lütfen gerekli tüm alanları doldurun!");
        return;
      }

      // JSONB olarak gönderilecek detaylar
      const details = {};
      detailFields.forEach(({ key, value }) => {
        if (key) details[key] = value;
      });
      if (!Object.keys(details).length) {
        alert("Lütfen en az bir envanter alanı girin!");
        return;
      }

      // Alt şube seçildiyse onun ID'sini, aksi takdirde seçilen şubenin ID'sini kullan
      const targetBranchId = selectedSubBranchId || branchId;

      await createInventory({ branch_id: targetBranchId, details }); // Doğru branch ID kullanılıyor
      alert("Envanter başarıyla eklendi!");
      onInventoryAdded();
      onClose();
    } catch (err) {
      console.error("Envanter eklenirken hata oluştu:", err);
      alert("Envanter eklenirken bir hata oluştu.");
    }
  };
  useEffect(() => {
    if (branchId) {
      const id = selectedSubBranchId || branchId;
      getInventoryFieldsByBranch(id)
        .then(setFieldSuggestions)
        .catch(console.error);
    }
  }, [branchId, selectedSubBranchId]);
  const handleAddDetailField = () => {
    setDetailFields([...detailFields, { key: "", value: "" }]);
  };

  const handleDetailChange = (index, field, newValue) => {
    const updated = [...detailFields];
    updated[index][field] = newValue;
    setDetailFields(updated);
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
          bgcolor: "#f5f5f5",
          boxShadow: "0px 4px 10px rgba(0, 0, 0.2)",
          p: 4,
          borderRadius: "10px",
          overflow: "auto",
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            color: "gray",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Yeni Envanter Ekle
        </Typography>

        {/* Şirket Seçimi */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Şirket Seçin</InputLabel>
          <Select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            disabled={companies.length === 0}
          >
            <MenuItem value="">
              <em>Şirket Seçin</em>
            </MenuItem>
            {companies.map((c) => (
              <MenuItem key={c.company_id} value={c.company_id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Şube Seçimi */}
        <FormControl fullWidth margin="normal" disabled={!companyId}>
          <InputLabel>Şube Seçin</InputLabel>
          <Select
            value={branchId}
            onChange={async (e) => {
              const id = e.target.value;
              setBranchId(id);
              // Alt şubeleri çek
              const subs = await getSubBranchesByBranchId(id);
              setSubBranches(subs);
              setSelectedSubBranchId("");
            }}
          >
            <MenuItem value="">
              <em>Şube Seçin</em>
            </MenuItem>
            {branches.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
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
          {/* Dinamik Envanter Alanları */}
          {detailFields.map((df, idx) => (
            <Box key={idx} display="flex" alignItems="center" gap={2} mt={2}>
              <Autocomplete
                freeSolo
                options={fieldSuggestions}
                value={df.key}
                onInputChange={(e, val) => handleDetailChange(idx, "key", val)}
                renderInput={(params) => (
                  <TextField {...params} label="Alan Adı" fullWidth />
                )}
                sx={{ width: 240 }}
              />
              <TextField
                label="Değer"
                value={df.value}
                onChange={(e) =>
                  handleDetailChange(idx, "value", e.target.value)
                }
                fullWidth
              />
              {idx === detailFields.length - 1 && (
                <Button onClick={handleAddDetailField}>+ Ekle</Button>
              )}
            </Box>
          ))}
        </FormControl>

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          sx={{
            mt: 2,
            backgroundColor: "#A5B68D",
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#8FA781",
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

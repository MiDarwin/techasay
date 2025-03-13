import React, { useState, useEffect } from "react";
import { createInventory, getSubBranchesByBranchId } from "../../utils/api";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const AddInventoryModal = ({ branches, onClose, onInventoryAdded }) => {
  const [branchId, setBranchId] = useState("");
  const [subBranchId, setSubBranchId] = useState(""); // Alt şube ID'si için state
  const [deviceType, setDeviceType] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [subBranches, setSubBranches] = useState([]); // Alt şubeleri tutmak için state

  useEffect(() => {
    const fetchSubBranches = async () => {
      if (branchId) {
        try {
          const data = await getSubBranchesByBranchId(branchId);
          setSubBranches(data);
        } catch (error) {
          console.error("Alt şubeler alınırken hata oluştu:", error);
        }
      } else {
        setSubBranches([]); // Şube seçilmediğinde alt şubeleri sıfırla
      }
    };

    fetchSubBranches();
  }, [branchId]); // branchId değiştiğinde alt şubeleri çek

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!branchId) {
      setError("Lütfen bir şube seçin.");
      return;
    }

    const inventoryData = {
      branch_id: branchId,
      sub_branch_id: subBranchId, // Alt şube ID'sini ekle
      device_type: deviceType,
      device_model: deviceModel,
      quantity: parseInt(quantity, 10),
      note: note,
    };

    try {
      setIsSubmitting(true);
      await createInventory(inventoryData);
      onInventoryAdded();
      onClose();
    } catch (error) {
      console.error("Envanter eklenirken hata oluştu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Envanter Ekle</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel>Şube Seçin</InputLabel>
          <Select
            value={branchId}
            onChange={(e) => {
              setBranchId(e.target.value);
              setSubBranchId(""); // Yeni şube seçildiğinde alt şube ID'sini sıfırla
            }}
            required
          >
            <MenuItem value="" disabled>
              Şube Seçin
            </MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch._id} value={branch._id}>
                {branch.branch_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Alt Şube Seçim Alanı */}
        <FormControl
          fullWidth
          margin="normal"
          disabled={subBranches.length === 0}
        >
          <InputLabel>Alt Şube Seçin</InputLabel>
          <Select
            value={subBranchId}
            onChange={(e) => setSubBranchId(e.target.value)}
          >
            <MenuItem value="" disabled>
              Alt Şube Seçin
            </MenuItem>
            {subBranches.map((subBranch) => (
              <MenuItem key={subBranch._id} value={subBranch._id}>
                {subBranch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Ürün Türü"
          value={deviceType}
          onChange={(e) => setDeviceType(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Ürün Modeli"
          value={deviceModel}
          onChange={(e) => setDeviceModel(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Miktar"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <TextField
          label="Not"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          İptal
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          color="success"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Ekleniyor..." : "Ekle"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddInventoryModal;

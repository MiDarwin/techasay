import React, { useState } from "react";
import { createInventory } from "../../utils/api";
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
  const [deviceType, setDeviceType] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!branchId) {
      setError("Lütfen bir şube seçin.");
      return;
    }

    const inventoryData = {
      branch_id: branchId,
      device_type: deviceType,
      device_model: deviceModel,
      quantity: parseInt(quantity, 10),
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
            onChange={(e) => setBranchId(e.target.value)}
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

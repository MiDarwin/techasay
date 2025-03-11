import React, { useState } from "react";
import { updateInventory } from "../../utils/api";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

const UpdateInventoryModal = ({ inventory, onClose, onInventoryUpdated }) => {
  const [deviceType, setDeviceType] = useState(inventory.device_type);
  const [deviceModel, setDeviceModel] = useState(inventory.device_model);
  const [quantity, setQuantity] = useState(inventory.quantity);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updateData = {
      device_type: deviceType,
      device_model: deviceModel,
      quantity: parseInt(quantity, 10),
    };

    try {
      setIsSubmitting(true);
      await updateInventory(inventory.id, updateData);
      onInventoryUpdated();
      onClose();
    } catch (error) {
      console.error("Envanter güncellenirken hata oluştu:", error);
      setError("Envanteri güncellerken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Envanteri Güncelle</DialogTitle>
      <DialogContent>
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
          {isSubmitting ? "Güncelleniyor..." : "Güncelle"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateInventoryModal;

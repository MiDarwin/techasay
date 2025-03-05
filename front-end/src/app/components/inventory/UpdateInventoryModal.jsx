// UpdateInventoryModal.jsx
import React, { useState } from "react";
import { updateInventory } from "../../utils/api";

const UpdateInventoryModal = ({ inventory, onClose, onInventoryUpdated }) => {
  const [deviceType, setDeviceType] = useState(inventory.device_type);
  const [deviceModel, setDeviceModel] = useState(inventory.device_model);
  const [quantity, setQuantity] = useState(inventory.quantity);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updateData = {
      device_type: deviceType,
      device_model: deviceModel,
      quantity: parseInt(quantity, 10),
    };

    try {
      await updateInventory(inventory.id, updateData);
      onInventoryUpdated();
      onClose();
    } catch (error) {
      console.error("Envanter güncellenirken hata oluştu:", error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="text-xl font-semibold mb-4">Envanteri Güncelle</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Ürün Türü:</label>
          <input
            type="text"
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded mb-4"
          />

          <label className="block mb-2">Ürün Modeli:</label>
          <input
            type="text"
            value={deviceModel}
            onChange={(e) => setDeviceModel(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded mb-4"
          />

          <label className="block mb-2">Miktar:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded mb-4"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2"
            >
              Güncelle
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateInventoryModal;

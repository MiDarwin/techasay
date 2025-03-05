// AddInventoryModal.jsx
import React, { useState } from 'react';
import { createInventory } from '../utils/api';

const AddInventoryModal = ({ branchId, onClose, onInventoryAdded }) => {
  const [deviceType, setDeviceType] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const inventoryData = {
      branch_id: branchId,
      device_type: deviceType,
      device_model: deviceModel,
      quantity: parseInt(quantity, 10),
    };

    try {
      await createInventory(inventoryData);
      onInventoryAdded();
      onClose();
    } catch (error) {
      console.error("Envanter eklenirken hata oluştu:", error);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2 className="text-xl font-semibold mb-4">Envanter Ekle</h2>
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
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2"
            >
              Ekle
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

export default AddInventoryModal;

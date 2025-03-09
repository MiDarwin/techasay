// UpdateInventoryModal.jsx
import React, { useState } from "react";
import { updateInventory } from "../../utils/api";

const UpdateInventoryModal = ({ inventory, onClose, onInventoryUpdated }) => {
  const [deviceType, setDeviceType] = useState(inventory.device_type);
  const [deviceModel, setDeviceModel] = useState(inventory.device_model);
  const [quantity, setQuantity] = useState(inventory.quantity);
  const [isSubmitting, setIsSubmitting] = useState(false); // Yüklenme durumu
  const [error, setError] = useState(""); // Hata mesajı

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
      onInventoryUpdated(); // Parent bileşene bildir
      onClose(); // Modalı kapat
    } catch (error) {
      console.error("Envanter güncellenirken hata oluştu:", error);
      setError("Envanteri güncellerken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Envanteri Güncelle</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Ürün Türü:</label>
          <select
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded mb-4"
          >
            <option value="" disabled>
              Ürün Türü Seçin
            </option>
            <option value="Adaptör">Adaptör</option>
            <option value="Anten">Anten</option>
            <option value="Ethernet Kablosu">Ethernet Kablosu</option>
            <option value="SIM Kart">SIM Kart</option>
            {/* Diğer seçenekleri buraya ekleyebilirsiniz */}
          </select>

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

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Güncelleniyor..." : "Güncelle"}
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

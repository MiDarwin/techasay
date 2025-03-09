// AddInventoryModal.jsx
import React, { useState } from "react";
import { createInventory } from "../../utils/api";

const AddInventoryModal = ({ branches, onClose, onInventoryAdded }) => {
  const [branchId, setBranchId] = useState(""); // Seçili şube ID'si
  const [deviceType, setDeviceType] = useState("");
  const [deviceModel, setDeviceModel] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Yüklenme durumu
  const [error, setError] = useState(""); // Hata mesajı

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Gerekli alanları kontrol et
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
      console.info("Envanter başarıyla eklendi.");
      onInventoryAdded();
      onClose();
    } catch (error) {
      console.error("Envanter eklenirken hata oluştu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Envanter Ekle</h2>
        <form onSubmit={handleSubmit}>
          {/* Şube Seçimi */}
          <label className="block mb-2">Şube:</label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded mb-4"
          >
            <option value="" disabled>
              Şube Seçin
            </option>
            {branches.map((branch) => (
              <option key={branch._id} value={branch._id}>
                {branch.branch_name}
              </option>
            ))}
          </select>

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
              className={`bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Ekleniyor..." : "Ekle"}
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

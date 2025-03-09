// InventoryList.jsx
import React from "react";
import { deleteInventory } from "../../utils/api"; // deleteInventory fonksiyonunu import edin

const InventoryList = ({ inventories, onEdit, onDelete }) => {
  const handleDelete = async (id) => {
    if (window.confirm("Envanteri silmek istediğinizden emin misiniz?")) {
      try {
        await deleteInventory(id); // API çağrısı
        // Silme işlemi başarılıysa, parent bileşene bildir
        if (onDelete) onDelete(id);
      } catch (error) {
        console.error("Silme işlemi sırasında hata oluştu:", error);
        alert("Envanteri silerken bir hata oluştu.");
      }
    }
  };

  return (
    <table className="min-w-full bg-white dark:bg-gray-800 text-black dark:text-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">Şube Adı</th>
          <th className="py-2 px-4 border-b">Ürün Türü</th>
          <th className="py-2 px-4 border-b">Ürün Modeli</th>
          <th className="py-2 px-4 border-b">Miktar</th>
          <th className="py-2 px-4 border-b">İşlemler</th>
        </tr>
      </thead>
      <tbody>
        {inventories.length === 0 ? (
          <tr>
            <td colSpan="5" className="py-2 px-4 text-center">
              Envanter bulunamadı.
            </td>
          </tr>
        ) : (
          inventories.map((inventory) => (
            <tr key={inventory.id}>
              <td className="py-2 px-4 border-b">{inventory.branch_name}</td>
              <td className="py-2 px-4 border-b">{inventory.device_type}</td>
              <td className="py-2 px-4 border-b">{inventory.device_model}</td>
              <td className="py-2 px-4 border-b">{inventory.quantity}</td>
              <td className="py-2 px-4 border-b flex space-x-2">
                <button
                  onClick={() => onEdit(inventory)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                >
                  Güncelle
                </button>
                <button
                  onClick={() => handleDelete(inventory.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Sil
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default InventoryList;

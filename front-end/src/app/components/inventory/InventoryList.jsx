// InventoryList.jsx
import React, { useEffect, useState } from "react";
import { getInventoryByBranch, deleteInventory } from "../../utils/api";

const InventoryList = ({ branchId, onEdit, onDelete }) => {
  const [inventories, setInventories] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (branchId) {
      // branchId'nin geçerli olup olmadığını kontrol edin
      fetchInventories();
    }
  }, [branchId]);

  const fetchInventories = async () => {
    setIsLoading(true);
    try {
      const data = await getInventoryByBranch(branchId);
      console.log("Fetched Inventories:", data); // Veriyi kontrol etmek için ekleyin

      // Gelen veriyi filtreleyin (ekstra güvenlik için)
      const filteredInventories = data.filter(
        (item) => item.branch_id === branchId
      );
      setInventories(filteredInventories);
      setError(null); // Hata varsa temizleyin
    } catch (error) {
      console.error("Envanterler alınırken hata oluştu:", error);
      setError("Envanterler alınırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Envanteri silmek istediğinizden emin misiniz?")) {
      try {
        await deleteInventory(id);
        fetchInventories(); // Silme sonrası veriyi yenileyin
        if (onDelete) onDelete(id);
      } catch (error) {
        console.error("Silme işlemi sırasında hata oluştu:", error);
        setError("Envanteri silerken bir hata oluştu.");
      }
    }
  };

  return (
    <table className="min-w-full bg-white dark:bg-gray-800 text-black dark:text-white">
      <thead>
        <tr>
          <th className="py-2 px-4 border-b">ID</th>
          <th className="py-2 px-4 border-b">Ürün Türü</th>
          <th className="py-2 px-4 border-b">Ürün Modeli</th>
          <th className="py-2 px-4 border-b">Miktar</th>
          <th className="py-2 px-4 border-b">İşlemler</th>
        </tr>
      </thead>
      <tbody>
        {inventories.map((inventory) => (
          <tr key={inventory.id}>
            <td className="py-2 px-4 border-b">{inventory.id}</td>
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
        ))}
      </tbody>
    </table>
  );
};

export default InventoryList;

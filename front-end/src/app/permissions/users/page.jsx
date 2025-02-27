"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../utils/api";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiRequest("/permissions/users/", "GET");
      setUsers(data.users);
    } catch (error) {
      console.error("Kullanıcıları çekerken hata oluştu", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (_id) => {
    try {
      const data = await apiRequest(`/permissions/users/?_id=${_id}`, "GET");
      console.log("Detaylı kullanıcı verisi:", data);
  
      // `data.users` bir dizi olduğundan, ilgili kullanıcıyı bul ve set et
      const user = data.users.find((user) => user._id === _id);
      if (user) {
        setSelectedUser(user);
        setIsManageOpen(true);
      } else {
        console.error(`Kullanıcı bulunamadı (ID: ${_id})`);
      }
    } catch (error) {
      console.error("Detayları çekerken hata oluştu", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kullanıcılar</h1>
      {loading ? (
        <p>Yükleniyor...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">ID</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">İzinler</th>
              <th className="border p-2">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {users.map((users) => (
              <tr key={users._id} className="border">
                <td className="border p-2">{users._id}</td>
                <td className="border p-2">{users.email}</td>
                <td className="border p-2">{users.permissions?.join(", ") || "Yetki yok"}</td>
                <td className="border p-2">
                  <button
                    onClick={() => handleViewDetails(users._id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Detayı Görüntüle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Yönetim Paneli */}
      {isManageOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <h2 className="text-xl font-bold mb-4">Kullanıcı Yönetimi</h2>
            <p><strong>ID:</strong> {selectedUser._id}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>İzinler:</strong> {selectedUser.permissions?.join(", ") || "Yetki yok"}</p>
            <button
              onClick={() => setIsManageOpen(false)}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
            >
              X
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import adminPanelStyles from "../styles/adminPanelStyles"; // Stil dosyasını içe aktar
import { getUserPermissions } from "../utils/api"; // Tüm kullanıcıları getiren API fonksiyonu

const AdminPanelPage = () => {
  const [users, setUsers] = useState([]); // Kullanıcı verilerini tutmak için state
  const [loading, setLoading] = useState(true); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata durumu

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUserPermissions(); // API çağrısı
        setUsers(usersData); // Kullanıcı verilerini kaydet
      } catch (error) {
        console.error("Kullanıcılar alınırken bir hata oluştu:", error);
        setError("Kullanıcılar alınırken bir hata oluştu.");
      } finally {
        setLoading(false); // Yüklenme durumunu kapat
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <p style={adminPanelStyles.description}>Yükleniyor...</p>;
  }

  if (error) {
    return <p style={adminPanelStyles.description}>{error}</p>;
  }

  return (
    <div style={adminPanelStyles.container}>
      <h1 style={adminPanelStyles.title}>Admin Panel</h1>
      <table style={adminPanelStyles.table}>
        <thead>
          <tr>
            <th style={adminPanelStyles.tableHeader}>ID</th>
            <th style={adminPanelStyles.tableHeader}>İsim</th>
            <th style={adminPanelStyles.tableHeader}>Soyisim</th>
            <th style={adminPanelStyles.tableHeader}>Yetkiler</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td style={adminPanelStyles.tableCell}>{user.id}</td>
              <td style={adminPanelStyles.tableCell}>{user.name}</td>
              <td style={adminPanelStyles.tableCell}>{user.surname}</td>
              <td style={adminPanelStyles.tableCell}>
                {user.permissions.map((permission, index) => (
                  <button
                    key={`${user.id}-${permission}-${index}`}
                    style={{
                      ...adminPanelStyles.permissionButton,
                      backgroundColor: "#4CAF50", // Varsayılan olarak yeşil
                    }}
                  >
                    {permission.toUpperCase()}
                  </button>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanelPage;

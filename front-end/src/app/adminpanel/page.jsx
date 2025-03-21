"use client";
import { useEffect, useState, useCallback } from "react";
import adminPanelStyles from "../styles/adminPanelStyles"; // Stil dosyasını içe aktar
import { getUserPermissions } from "../utils/api"; // Tüm kullanıcıları getiren API fonksiyonu

const AdminPanelPage = () => {
  const [users, setUsers] = useState([]); // Kullanıcı verilerini tutmak için state
  const [loading, setLoading] = useState(false); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata durumu
  const [search, setSearch] = useState(""); // Arama kutusu için state

  // API'den kullanıcıları getiren fonksiyon
  const fetchUsers = useCallback(
    async (searchValue = "") => {
      try {
        setLoading(true); // Yüklenme durumunu başlat
        const usersData = await getUserPermissions(searchValue); // API çağrısı
        setUsers(usersData); // Kullanıcıları state'e kaydet
      } catch (error) {
        console.error("Kullanıcılar alınırken bir hata oluştu:", error);
        setError("Kullanıcılar alınırken bir hata oluştu.");
      } finally {
        setLoading(false); // Yüklenme durumunu kapat
      }
    },
    [] // Sadece bir kez oluşturulacak
  );

  // İlk yükleme sırasında kullanıcıları getir
  useEffect(() => {
    fetchUsers(); // İlk yüklemede tüm kullanıcıları getir
  }, [fetchUsers]);

  // Arama kutusundaki değişiklikleri işleyen fonksiyon
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearch(value); // Arama değerini güncelle
    fetchUsers(value); // Yeni arama değeriyle kullanıcıları getir
  };

  return (
    <div style={adminPanelStyles.container}>
      <h1 style={adminPanelStyles.title}>Admin Panel</h1>
      {/* Arama Kutusu */}
      <input
        type="text"
        value={search} // Arama state'i
        onChange={handleSearchChange} // Değişiklik olduğunda tetiklenir
        placeholder="Kullanıcı arayın..."
        style={adminPanelStyles.searchInput}
      />
      {/* Tablo */}
      {loading ? (
        <p style={adminPanelStyles.description}>Tablo Yükleniyor...</p>
      ) : error ? (
        <p style={adminPanelStyles.description}>{error}</p>
      ) : (
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
      )}
    </div>
  );
};

export default AdminPanelPage;

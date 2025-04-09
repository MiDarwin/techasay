"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation"; // Next.js'in yönlendirme hook'u
import adminPanelStyles from "../styles/adminPanelStyles"; // Stil dosyasını içe aktar
import { getUserPermissions, updateUserPermissions } from "../utils/api"; // API fonksiyonları

const AdminPanelPage = () => {
  const [users, setUsers] = useState([]); // Kullanıcı verilerini tutmak için state
  const [loading, setLoading] = useState(false); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata durumu
  const [search, setSearch] = useState(""); // Arama kutusu için state
  const router = useRouter(); // Yönlendirme hook'u

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

  // Kullanıcı izinlerini güncelleyen fonksiyon
  const handlePermissionChange = async (userId, permission, isEnabled) => {
    try {
      // İlgili kullanıcıyı bul
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      // Kullanıcının izinlerini güncelle
      const updatedPermissions = isEnabled
        ? [...user.permissions, permission] // İzin ekle
        : user.permissions.filter((perm) => perm !== permission); // İzni çıkar

      // Backend'e PUT isteği gönder
      await updateUserPermissions(userId, updatedPermissions);

      // Kullanıcı state'ini güncelle
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId ? { ...u, permissions: updatedPermissions } : u
        )
      );
    } catch (error) {
      console.error(
        "Kullanıcı izinleri güncellenirken bir hata oluştu:",
        error
      );
      alert("Kullanıcı izinleri güncellenirken bir hata oluştu.");
    }
  };

  return (
    <div style={adminPanelStyles.container}>
      <h1 style={adminPanelStyles.title}>Admin Panel</h1>
      <button
        style={adminPanelStyles.permissionButton}
        onClick={() => router.push("/InventoryManagerPage")} // Next.js yönlendirme
      >
        Envanter Model Yönetimi
      </button>
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
              <th style={adminPanelStyles.tableHeader}>Email</th>
              <th style={adminPanelStyles.tableHeader}>Yetkiler</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={adminPanelStyles.tableCell}>{user.id}</td>
                <td style={adminPanelStyles.tableCell}>{user.name}</td>
                <td style={adminPanelStyles.tableCell}>{user.surname}</td>
                <td style={adminPanelStyles.tableCell}>{user.email}</td>
                <td style={adminPanelStyles.tableCell}>
                  {[
                    "companyViewing",
                    "branchViewing",
                    "inventoryViewing",
                    "permission_management",
                    "companyAdd",
                    "companyDelete",
                    "companyEdit",
                    "branchAdd",
                    "branchDelete",
                    "branchEdit",
                    "subBranchAdd",
                    "subBranchDelete",
                    "subBranchEdit",
                    "inventoryAdd",
                    "inventoryDelete",
                    "inventoryEdit",
                  ].map((permission) => (
                    <label
                      key={`${user.id}-${permission}`}
                      style={{ marginRight: "10px" }}
                    >
                      {permission.charAt(0).toUpperCase() + permission.slice(1)}
                      <input
                        type="checkbox"
                        checked={user.permissions.includes(permission)} // İzin aktifse işaretli
                        onChange={(e) =>
                          handlePermissionChange(
                            user.id,
                            permission,
                            e.target.checked
                          )
                        }
                      />
                    </label>
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

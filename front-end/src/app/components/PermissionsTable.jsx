"use client";
import { useEffect, useState } from "react";
import settingsStyles from "../styles/settingsStyles"; // Stil dosyasını içe aktar
import { getUserPermissions } from "../utils/api"; // Yetki API'sini içe aktar

const PermissionsTable = () => {
  const [permissions, setPermissions] = useState([]); // Kullanıcı yetkilerini tutmak için state
  const [loading, setLoading] = useState(true); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata durumu

  const allPermissions = ["permission_management", "read", "write", "delete"]; // Tabloda gösterilecek tüm yetkiler

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const userPermissions = await getUserPermissions(); // API çağrısı
        setPermissions(userPermissions); // Kullanıcı yetkilerini kaydet
      } catch (error) {
        console.error("Yetkiler alınırken bir hata oluştu:", error);
        setError("Yetkiler alınırken bir hata oluştu.");
      } finally {
        setLoading(false); // Yüklenme durumunu kapat
      }
    };

    fetchPermissions();
  }, []);

  if (loading) {
    return <p style={settingsStyles.description}>Yükleniyor...</p>;
  }

  if (error) {
    return <p style={settingsStyles.description}>{error}</p>;
  }

  return (
    <div style={settingsStyles.container}>
      <table style={settingsStyles.table}>
        <thead>
          <tr>
            {allPermissions.map((permission) => (
              <th key={permission} style={settingsStyles.tableHeader}>
                {permission.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {allPermissions.map((permission) => (
              <td key={permission} style={settingsStyles.tableCell}>
                {permissions.includes(permission) ? (
                  <span style={settingsStyles.greenTick}>✔</span>
                ) : (
                  <span style={settingsStyles.redCross}>✘</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PermissionsTable;

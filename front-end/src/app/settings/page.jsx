"use client";
import { useEffect, useState } from "react";
import PersonIcon from "@mui/icons-material/Person"; // Kullanıcı simgesi
import EditIcon from "@mui/icons-material/Edit"; // Kalem simgesi
import Switch from "@mui/material/Switch"; // Switch bileşeni
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // Çıkış simgesi

import settingsStyles from "../styles/settingsStyles"; // Stil dosyasını içe aktar
import { getCurrentUser, getUserPermissions } from "../utils/api"; // API fonksiyonlarını içe aktar
import { useRouter } from "next/navigation"; // Router kullanımı için

const SettingsPage = () => {
  const [user, setUser] = useState(null); // Kullanıcı verilerini tutmak için state
  const [permissions, setPermissions] = useState([]); // Kullanıcı yetkilerini tutmak için state
  const [loading, setLoading] = useState(true); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata durumu
  const router = useRouter(); // Kullanıcıyı yönlendirmek için router

  const allPermissions = ["permission_management", "read", "write", "delete"]; // Tüm yetkiler

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getCurrentUser(); // API çağrısı (kullanıcı bilgileri)
        const userPermissions = await getUserPermissions(); // API çağrısı (yetkiler)
        setUser(userData); // Kullanıcı verilerini kaydet
        setPermissions(userPermissions); // Kullanıcı yetkilerini kaydet
      } catch (error) {
        console.error("Veriler alınırken bir hata oluştu:", error);
        setError("Veriler alınırken bir hata oluştu.");
      } finally {
        setLoading(false); // Yüklenme durumunu kapat
      }
    };

    fetchData();
  }, []);
  // Admin Paneline gitme fonksiyonu
  const goToAdminPanel = () => {
    router.push("/adminpanel"); // Admin Panel sayfasına yönlendir
  };
  if (loading) {
    return <p style={settingsStyles.description}>Yükleniyor...</p>;
  }

  if (error) {
    return <p style={settingsStyles.description}>{error}</p>;
  }
  // Kullanıcı çıkış fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Token'ı sil
    router.push("/auth/login"); // Login ekranına yönlendir
  };

  if (loading) {
    return <p style={settingsStyles.description}>Yükleniyor...</p>;
  }

  if (error) {
    return <p style={settingsStyles.description}>{error}</p>;
  }
  return (
    <div style={settingsStyles.container}>
      <div style={settingsStyles.box}>
        {/* Kullanıcı Bilgileri */}
        <div style={settingsStyles.userInfo}>
          <PersonIcon style={settingsStyles.icon} />
          <span style={settingsStyles.userName}>
            {user.name} {user.surname}
          </span>
          <div style={settingsStyles.iconWrapper}>
            <ExitToAppIcon
              style={settingsStyles.logoutIcon}
              onClick={handleLogout}
            />
            <span style={settingsStyles.tooltip}>Çıkış Yap</span>
          </div>
        </div>

        <div style={settingsStyles.changePassword}>
          <span>Şifre Değiştir</span>
          <div style={settingsStyles.iconWrapper}>
            <EditIcon style={settingsStyles.editIcon} />
            <span style={settingsStyles.tooltip}>Şifre Değiştir</span>
          </div>
          <div style={settingsStyles.adminPanel}>
            <button
              style={settingsStyles.adminPanelButton}
              onClick={goToAdminPanel}
            >
              Admin Panel
            </button>
          </div>
        </div>

        {/* Yetkilerim */}
        <div style={settingsStyles.permissions}>
          <h3 style={settingsStyles.permissionsTitle}>Yetkilerim</h3>
          {allPermissions.map((permission) => (
            <div key={permission} style={settingsStyles.permissionItem}>
              <span>{permission.toUpperCase()}</span>
              {permissions.includes(permission) ? (
                <span style={settingsStyles.greenTick}>✔</span>
              ) : (
                <span style={settingsStyles.redCross}>✘</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

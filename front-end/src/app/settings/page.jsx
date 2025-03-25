"use client";
import { useEffect, useState } from "react";
import PersonIcon from "@mui/icons-material/Person"; // Kullanıcı simgesi
import EditIcon from "@mui/icons-material/Edit"; // Kalem simgesi
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // Çıkış simgesi
import Modal from "@mui/material/Modal"; // Modal bileşeni
import TextField from "@mui/material/TextField"; // Textfield bileşeni
import Button from "@mui/material/Button"; // Button bileşeni
import { SketchPicker } from "react-color"; // Renk seçici kütüphanesi
import ColorModal from "./ColorModal";

import settingsStyles from "../styles/settingsStyles"; // Stil dosyasını içe aktar
import {
  getCurrentUser,
  getAllUsersPermissions,
  updatePassword,
} from "../utils/api"; // API fonksiyonlarını içe aktar
import { useRouter } from "next/navigation"; // Router kullanımı için

const SettingsPage = () => {
  const [user, setUser] = useState(null); // Kullanıcı verilerini tutmak için state
  const [permissions, setPermissions] = useState([]); // Kullanıcı yetkilerini tutmak için state
  const [loading, setLoading] = useState(true); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata durumu
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false); // Şifre değiştirme modal aç/kapa durumu
  const [email, setEmail] = useState(""); // Email field
  const [oldPassword, setOldPassword] = useState(""); // Eski şifre field
  const [newPassword, setNewPassword] = useState(""); // Yeni şifre field
  const [passwordError, setPasswordError] = useState(""); // Hata mesajı
  const [passwordSuccess, setPasswordSuccess] = useState(""); // Başarı mesajı
  const [tableColor, setTableColor] = useState("#395B64"); // Varsayılan renk
  const [open, setOpen] = useState(false);

  const router = useRouter(); // Kullanıcıyı yönlendirmek için router

  const allPermissions = ["permission_management", "read", "write", "delete"]; // Tüm yetkiler

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getCurrentUser(); // API çağrısı (kullanıcı bilgileri)
        const userPermissions = await getAllUsersPermissions(); // API çağrısı (yetkiler)
        setUser(userData); // Kullanıcı verilerini kaydet
        setPermissions(userPermissions); // Kullanıcı yetkilerini kaydet
        setEmail(userData.email); // Kullanıcı emailini otomatik olarak doldur
      } catch (error) {
        console.error("Veriler alınırken bir hata oluştu:", error);
        setError("Veriler alınırken bir hata oluştu.");
      } finally {
        setLoading(false); // Yüklenme durumunu kapat
      }
    };

    fetchData();
  }, []);
  useEffect(() => {
    const savedColor = localStorage.getItem("tableColor");
    if (savedColor) {
      setTableColor(savedColor);
    }
  }, []);

  const handleColorChange = (color) => {
    setTableColor(color.hex);
    localStorage.setItem("tableColor", color.hex);
  };
  // Admin Paneline gitme fonksiyonu
  const goToAdminPanel = () => {
    router.push("/adminpanel"); // Admin Panel sayfasına yönlendir
  };

  // Kullanıcı çıkış fonksiyonu
  const handleLogout = () => {
    localStorage.removeItem("access_token"); // Token'ı sil
    router.push("/auth/login"); // Login ekranına yönlendir
  };

  // Şifre değiştirme modalını aç/kapat
  const togglePasswordModal = () => {
    setIsPasswordModalOpen(!isPasswordModalOpen);
    setPasswordError(""); // Hata mesajını sıfırla
    setPasswordSuccess(""); // Başarı mesajını sıfırla
  };

  // Şifre değiştirme işlemi
  const handleChangePassword = async () => {
    try {
      // Gerekli alanların doldurulup doldurulmadığını kontrol et
      if (!email || !oldPassword || !newPassword) {
        setPasswordError("Lütfen tüm alanları doldurun!");
        return;
      }

      // Backend API çağrısı
      await updatePassword({
        email,
        old_password: oldPassword,
        new_password: newPassword,
      });

      // Başarı mesajı
      setPasswordSuccess("Şifreniz başarıyla güncellendi!");
      setPasswordError(""); // Hata mesajını sıfırla
      setOldPassword(""); // Eski şifreyi sıfırla
      setNewPassword(""); // Yeni şifreyi sıfırla
    } catch (error) {
      console.error("Şifre değiştirme sırasında hata oluştu:", error);
      setPasswordError("Şifre değiştirme sırasında bir hata oluştu.");
    }
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
            <EditIcon
              style={settingsStyles.editIcon}
              onClick={togglePasswordModal} // Şifre değiştirme modalını aç
            />
            <span style={settingsStyles.tooltip}>Şifre Değiştir</span>
          </div>
        </div>
        <div style={settingsStyles.adminPanel}>
          <button
            style={settingsStyles.adminPanelButton}
            onClick={goToAdminPanel}
          >
            Admin Panel
          </button>
        </div>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Renkleri Değiştir
        </Button>
        <ColorModal open={open} handleClose={() => setOpen(false)} />
        {/* Yetkilerim */}
        <h3 style={settingsStyles.permissionsTitle}>Yetkilerim</h3>{" "}
        <div style={settingsStyles.permissions}>
          {permissions.map((permission) => (
            <div key={permission} style={settingsStyles.permissionItem}>
              <span>{permission.toUpperCase()}</span>
              <span style={settingsStyles.greenTick}>✔</span>
            </div>
          ))}
        </div>
      </div>

      {/* Şifre Değiştirme Modal */}
      <Modal
        open={isPasswordModalOpen}
        onClose={togglePasswordModal}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div
          style={{
            ...settingsStyles.modal,
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h2 style={{ ...settingsStyles.modalTitle, marginBottom: "20px" }}>
            Şifre Değiştir
          </h2>

          <TextField
            label="Mevcut Şifre"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            fullWidth
            margin="normal"
            sx={{ mb: 2 }}
          />

          <TextField
            label="Yeni Şifre"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin="normal"
            sx={{ mb: 2 }}
          />

          {passwordError && (
            <div style={{ color: "error.main", marginBottom: "10px" }}>
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div style={{ color: "success.main", marginBottom: "10px" }}>
              {passwordSuccess}
            </div>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleChangePassword}
            fullWidth
            sx={{ mt: 2 }}
          >
            Şifreyi Güncelle
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;

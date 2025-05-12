"use client";
import { useEffect, useState } from "react";
import PersonIcon from "@mui/icons-material/Person"; // Kullanıcı simgesi
import EditIcon from "@mui/icons-material/Edit"; // Kalem simgesi
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // Çıkış simgesi
import ColorModal from "./ColorModal";
import StoreIcon from "@mui/icons-material/Store"; // Anasayfa simgesi
import {
  Box,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Button,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
  Modal,
  TextField,
} from "@mui/material";
import settingsStyles from "../styles/settingsStyles"; // Stil dosyasını içe aktar
import {
  getCurrentUser,
  getAllUsersPermissions,
  updatePassword,
  updateBranchCoords,
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
  const [coordLoading, setCoordLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [coordResult, setCoordResult] = useState(null);
  const router = useRouter(); // Kullanıcıyı yönlendirmek için router
  const [tabIndex, setTabIndex] = useState(0);

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
  const handleTabChange = (e, newIndex) => setTabIndex(newIndex);

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
  const handleExtractCoords = async () => {
    setCoordLoading(true);
    try {
      const { total, updated } = await updateBranchCoords();
      setCoordResult({ total, updated });
      setSnackbarOpen(true);
    } catch (e) {
      console.error("Koordinat güncelleme hatası:", e);
    } finally {
      setCoordLoading(false);
    }
  };

  if (loading) {
    return <p style={settingsStyles.description}>Yükleniyor...</p>;
  }

  if (error) {
    return <p style={settingsStyles.description}>{error}</p>;
  }

  return (
    <Box
      sx={{ display: "flex", height: "100%", bgcolor: "background.default" }}
    >
      {/* ---------- Solda Dikey Sekmeler ---------- */}
      <Box
        sx={{
          borderRight: 1,
          borderColor: "divider",
          width: 200,
          bgcolor: "background.paper",
          p: 2,
        }}
      >
        <Tabs
          orientation="vertical"
          value={tabIndex}
          onChange={handleTabChange}
        >
          <Tab label="Profil" />
          <Tab label="Tema & Koordinat" />
          <Tab label="Yetkilerim" />
        </Tabs>
      </Box>

      {/* ---------- Sağda İçerik Panelleri ---------- */}
      <Box sx={{ flexGrow: 1, p: 3, position: "relative" }}>
        {/* Ana Sayfa ikonu */}
        <IconButton
          onClick={() => router.push("/homepage")}
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            bgcolor: "primary.main",
            color: "white",
            width: 48,
            height: 48,
            "&:hover": { bgcolor: "primary.dark", transform: "scale(1.1)" },
            transition: "all 0.2s",
            borderRadius: "50%",
          }}
        >
          <StoreIcon fontSize="large" />
        </IconButton>

        {/* --- Profil Paneli --- */}
        {tabIndex === 0 && (
          <Box sx={{ maxWidth: 600, mx: "auto" }}>
            <Box sx={settingsStyles.userInfo}>
              <PersonIcon sx={settingsStyles.icon} />
              <Typography variant="h6">
                {user.name} {user.surname}
              </Typography>
              <Box sx={settingsStyles.iconWrapper}>
                <ExitToAppIcon
                  sx={settingsStyles.logoutIcon}
                  onClick={handleLogout}
                />
                <Typography sx={settingsStyles.tooltip}>Çıkış Yap</Typography>
              </Box>
            </Box>
            <Box sx={settingsStyles.changePassword}>
              <Typography>Şifre Değiştir</Typography>
              <Box sx={settingsStyles.iconWrapper}>
                <EditIcon
                  sx={settingsStyles.editIcon}
                  onClick={togglePasswordModal}
                />
                <Typography sx={settingsStyles.tooltip}>
                  Şifre Değiştir
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 2,
                alignItems: "center",
              }}
            >
              <Button onClick={goToAdminPanel} variant="outlined">
                Admin Panel
              </Button>
              <Tooltip
                title="Varolan şubelerdeki link'lerden koordinatını çıkartmak için basın işlem uzun sürebilir"
                arrow
              >
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleExtractCoords}
                  disabled={coordLoading}
                >
                  {coordLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    "Koordinat Çıkar"
                  )}
                </Button>
              </Tooltip>
            </Box>
          </Box>
        )}

        {/* --- Tema & Koordinat Paneli --- */}
        {tabIndex === 1 && (
          <Box sx={{ maxWidth: 600, mx: "auto", textAlign: "center" }}>
            <Button
              variant="contained"
              onClick={() => setOpen(!open)}
              sx={{
                width: "100%",
                py: 1.5,
                background:
                  "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)",
                backgroundSize: "400% 400%",
                animation: "rainbowEffect 5s linear infinite",
                color: "white",
                fontWeight: "bold",
                boxShadow: 3,
                borderRadius: 2,
                "&:hover": {
                  animation: "rainbowEffect 3s linear infinite",
                  boxShadow: 4,
                },
              }}
            >
              Renkleri Değiştir
            </Button>
            <ColorModal open={open} handleClose={() => setOpen(false)} />
            <Box sx={{ mt: 4 }}>
              <Typography variant="body1">Koordinat güncelleme:</Typography>
              <Button
                variant="contained"
                onClick={handleExtractCoords}
                disabled={coordLoading}
                sx={{ mt: 1 }}
              >
                {coordLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Koordinat Çıkar"
                )}
              </Button>
            </Box>
          </Box>
        )}

        {/* --- Yetkiler Paneli --- */}
        {tabIndex === 2 && (
          <Box sx={{ maxWidth: 600, mx: "auto" }}>
            <Typography variant="h5" sx={settingsStyles.permissionsTitle}>
              Yetkilerim
            </Typography>
            <Box sx={settingsStyles.permissionsGrid}>
              {permissions.map((perm) => (
                <Box key={perm} sx={settingsStyles.permissionItem}>
                  <Typography>{perm.toUpperCase()}</Typography>
                  <Typography sx={settingsStyles.greenTick}>✔</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Şifre Değiştirme Modal & Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {coordResult
              ? `${coordResult.updated}/${coordResult.total} şube koordinatı eklendi!.`
              : "Güncelleme tamamlandı."}
          </Alert>
        </Snackbar>

        <Modal
          open={isPasswordModalOpen}
          onClose={togglePasswordModal}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              ...settingsStyles.modal,
              bgcolor: "background.paper",
              p: 4,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ ...settingsStyles.modalTitle, mb: 2 }}
            >
              Şifre Değiştir
            </Typography>
            <TextField
              label="Mevcut Şifre"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Yeni Şifre"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
            {passwordError && (
              <Typography color="error.main" mb={1}>
                {passwordError}
              </Typography>
            )}
            {passwordSuccess && (
              <Typography color="success.main" mb={1}>
                {passwordSuccess}
              </Typography>
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
          </Box>
        </Modal>
      </Box>
    </Box>
  );
};

export default SettingsPage;

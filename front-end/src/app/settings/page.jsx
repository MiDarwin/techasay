"use client";
import PersonIcon from "@mui/icons-material/Person"; // Kullanıcı simgesi
import settingsStyles from "../styles/settingsStyles"; // Stilleri içe aktar

const SettingsPage = () => {
  return (
    <div style={settingsStyles.container}>
      {/* Kullanıcı Simgesi */}
      <PersonIcon style={settingsStyles.icon} />

      {/* Başlık */}
      <h1 style={settingsStyles.title}>Kullanıcı Sayfası</h1>

      {/* Açıklama */}
      <p style={settingsStyles.description}>
        Bu sayfa kullanıcının profil bilgilerini veya ayarlarını barındıracak.
      </p>
    </div>
  );
};

export default SettingsPage;

"use client";
import { useEffect, useState } from "react";
import PersonIcon from "@mui/icons-material/Person"; // Kullanıcı simgesi
import settingsStyles from "../styles/settingsStyles"; // Stilleri içe aktar
import { getCurrentUser } from "../utils/api"; // API fonksiyonunu içe aktar

const SettingsPage = () => {
  const [user, setUser] = useState(null); // Kullanıcı verilerini tutmak için state
  const [loading, setLoading] = useState(true); // Yüklenme durumu
  const [error, setError] = useState(null); // Hata durumu

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUser(); // API çağrısı
        setUser(userData); // Kullanıcı verilerini kaydet
        console.log("Kullanıcı Bilgileri:", userData);
      } catch (error) {
        console.error("Kullanıcı bilgileri alınırken bir hata oluştu:", error);
        setError("Kullanıcı bilgileri alınırken bir hata oluştu.");
      } finally {
        setLoading(false); // Yüklenme durumunu kapat
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <p style={settingsStyles.description}>Yükleniyor...</p>;
  }

  if (error) {
    return <p style={settingsStyles.description}>{error}</p>;
  }

  return (
    <div style={settingsStyles.container}>
      {/* Kullanıcı Simgesi */}
      <div style={settingsStyles.iconContainer}>
        <PersonIcon style={settingsStyles.icon} />
      </div>

      {/* Hoşgeldiniz Mesajı */}
      {user && (
        <h2 style={settingsStyles.welcomeMessage}>
          Hoşgeldiniz {user.name} {user.surname}
        </h2>
      )}

      {/* Sayfa Başlığı */}
      <h1 style={settingsStyles.title}>Kullanıcı Sayfası</h1>

      {/* Açıklama */}
      <p style={settingsStyles.description}>
        Bu sayfa kullanıcının profil bilgilerini veya ayarlarını barındıracak.
      </p>
    </div>
  );
};

export default SettingsPage;

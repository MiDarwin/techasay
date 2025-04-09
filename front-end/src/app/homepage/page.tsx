"use client";
import { useState, useEffect } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box"; // Box bileşeni eklendi
import CompanyManager from "../components/company/CompanyManager";
import BranchManager from "../components/branch/BranchManager";
import InventoryManager from "../components/inventory/InventoryManager";
import CompanyIcon from "@mui/icons-material/Business"; // Şirket ikonu
import StoreIcon from "@mui/icons-material/Store"; // Şube ikonu
import BackpackIcon from "@mui/icons-material/Backpack"; // Envanter ikonu
import SettingsIcon from "@mui/icons-material/Settings"; // Çark simgesi (Ayarlar)
import { useRouter } from "next/navigation";
import CircularProgress from "@mui/material/CircularProgress"; // Yükleme göstergesi

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("branch");
  const router = useRouter(); // Router instance
  const [isLoading, setIsLoading] = useState(true); // Yükleme durumu
  useEffect(() => {
    // Token kontrolü
    const token = localStorage.getItem("access_token");

    if (!token) {
      // Token yoksa login sayfasına yönlendir
      router.replace("/auth/login");
    } else {
      // Token varsa yükleme tamamlandı
      setIsLoading(false);
    }
  }, [router]);
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  const navigateToSettings = () => {
    router.push("/settings"); // "settings" sayfasına yönlendir
  };
  // Aktif sekme için uygun ikonu döndür
  const getActiveIcon = () => {
    switch (activeTab) {
      case "company":
        return <CompanyIcon />;
      case "branch":
        return <StoreIcon />;
      case "inventory":
        return <BackpackIcon />;
      default:
        return null;
    }
  };
  // Yükleme durumu için geri dönüş
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#E7F6F2",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div style={{ backgroundColor: "#E7F6F2", flexGrow: 1 }}>
      <header>
        <Box
          sx={{
            display: "flex", // Flexbox düzeni
            justifyContent: "space-between", // Yatay eksende boşluk dağılımı
            alignItems: "center", // Dikey eksende ortalama
            margin: "0", // Üst ve alt boşlukları tamamen kaldırır
          }}
        >
          {/* Sol taraftaki ikon */}
          <Box sx={{ display: "flex", alignItems: "center" }}></Box>

          {/* Ortada Breadcrumbs */}
          <Box
            sx={{
              display: "flex", // Flexbox düzeni
              justifyContent: "center", // Yatay eksende ortalama
              flexGrow: 1, // Alanın tamamını kapla
            }}
          >
            <Breadcrumbs aria-label="breadcrumb">
              {getActiveIcon()} {/* Aktif sekmeye göre ikon */}
              <Link
                underline="hover"
                color={activeTab === "company" ? "text.primary" : "inherit"}
                onClick={() => handleTabChange("company")}
                sx={{
                  cursor: "pointer",
                  fontWeight: activeTab === "company" ? "bold" : "normal",
                }}
              >
                Şirket
              </Link>
              <Link
                underline="hover"
                color={activeTab === "branch" ? "text.primary" : "inherit"}
                onClick={() => handleTabChange("branch")}
                sx={{
                  cursor: "pointer",
                  fontWeight: activeTab === "branch" ? "bold" : "normal",
                }}
              >
                Şube
              </Link>
              <Link
                underline="hover"
                color={activeTab === "inventory" ? "text.primary" : "inherit"}
                onClick={() => handleTabChange("inventory")}
                sx={{
                  cursor: "pointer",
                  fontWeight: activeTab === "inventory" ? "bold" : "normal",
                }}
              >
                Envanter
              </Link>
            </Breadcrumbs>
          </Box>

          {/* Sağ tarafta Settings */}
          <Box>
            <SettingsIcon
              sx={{
                fontSize: "30px", // İkon boyutu
                color: "black", // İkon rengi
                cursor: "pointer", // İmleç göstergesi
                "&:hover": { color: "gray" }, // Hover rengi
              }}
              onClick={navigateToSettings} // Settings sayfasına yönlendirme
            />
          </Box>
        </Box>
      </header>

      <main
        style={{
          backgroundColor: "#2C3333",
          padding: "20px",
          minHeight: "100vh",
        }}
      >
        {activeTab === "company" && <CompanyManager />}
        {activeTab === "branch" && <BranchManager />}
        {activeTab === "inventory" && <InventoryManager />}
      </main>
    </div>
  );
};

export default HomePage;

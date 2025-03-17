"use client";
import { useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box"; // Box bileşeni eklendi
import CompanyManager from "../components/company/CompanyManager";
import BranchManager from "../components/branch/BranchManager";
import InventoryManager from "../components/inventory/InventoryManager";
import CompanyIcon from "@mui/icons-material/Business"; // Şirket ikonu
import StoreIcon from "@mui/icons-material/Store"; // Şube ikonu
import BackpackIcon from "@mui/icons-material/Backpack"; // Envanter ikonu

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("branch");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
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

  return (
    <div>
      <header>
        <Box
          sx={{
            display: "flex", // Flexbox düzeni
            justifyContent: "center", // Yatay eksende ortalama
            alignItems: "center", // Dikey eksende ortalama
            margin: "16px 0", // Üst ve alt boşluk
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", marginRight: 2 }}>
            {getActiveIcon()} {/* Aktif sekmeye göre ikon */}
          </Box>
          <Breadcrumbs aria-label="breadcrumb">
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
      </header>

      <main
        style={{
          backgroundColor: "#EDE8DC",
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

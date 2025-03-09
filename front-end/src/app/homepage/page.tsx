"use client";
import { useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box"; // Box bileşeni eklendi
import CompanyManager from "../components/company/CompanyManager";
import BranchManager from "../components/branch/BranchManager";
import InventoryManager from "../components/inventory/InventoryManager";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("company");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
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

      <main>
        {activeTab === "company" && <CompanyManager />}
        {activeTab === "branch" && <BranchManager />}
        {activeTab === "inventory" && <InventoryManager />}
      </main>
    </div>
  );
};

export default HomePage;

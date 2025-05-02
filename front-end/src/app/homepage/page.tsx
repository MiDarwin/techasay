"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Breadcrumbs,
  Link,
  IconButton,
  Typography,
  CircularProgress,
} from "@mui/material";
import CompanyIcon from "@mui/icons-material/Business";
import StoreIcon from "@mui/icons-material/Store";
import BackpackIcon from "@mui/icons-material/Backpack";
import SettingsIcon from "@mui/icons-material/Settings";
import { useRouter } from "next/navigation";
import CompanyManager from "../components/company/CompanyManager";
import BranchManager from "../components/branch/BranchManager";
import InventoryManager from "../components/inventory/InventoryManager";

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("branch");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/auth/login");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const navigateToSettings = () => {
    router.push("/settings");
  };

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

  const breadcrumbItems = [
    { label: "Şirket", icon: <CompanyIcon fontSize="large" />, key: "company" },
    { label: "Şube", icon: <StoreIcon fontSize="large" />, key: "branch" },
    {
      label: "Envanter",
      icon: <BackpackIcon fontSize="large" />,
      key: "inventory",
    },
  ];

  return (
    <Box sx={{ backgroundColor: "#E7F6F2", flexGrow: 1 }}>
      <Box
        component="header"
        sx={{
          backgroundColor: "background.paper",
          boxShadow: 1,
          borderRadius: 1,
          px: 3,
          py: 2,
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Breadcrumbs
            separator="›"
            aria-label="breadcrumb"
            sx={{ display: "flex", alignItems: "center", gap: 3 }}
          >
            {breadcrumbItems.map(({ label, icon, key }) => (
              <Link
                key={key}
                underline="none"
                color={activeTab === key ? "primary" : "text.secondary"}
                onClick={() => handleTabChange(key)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "1.2rem",
                  fontWeight: activeTab === key ? "bold" : "normal",
                  cursor: "pointer",
                }}
              >
                {icon}
                <Typography component="span" sx={{ ml: 0.5 }}>
                  {label}
                </Typography>
              </Link>
            ))}
          </Breadcrumbs>

          <IconButton
            onClick={navigateToSettings}
            sx={{
              color: "text.primary",
              "&:hover": { color: "primary.main", transform: "scale(1.1)" },
              transition: "all 0.2s ease-in-out",
            }}
          >
            <SettingsIcon fontSize="large" />
          </IconButton>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          backgroundColor: "#2C3333",
          p: 3,
          minHeight: "calc(100vh - 120px)",
        }}
      >
        {activeTab === "company" && <CompanyManager />}
        {activeTab === "branch" && <BranchManager />}
        {activeTab === "inventory" && <InventoryManager />}
      </Box>
    </Box>
  );
};

export default HomePage;

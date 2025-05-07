"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Breadcrumbs,
  Link,
  IconButton,
  Typography,
  CircularProgress,
  Container,
} from "@mui/material";
import CompanyIcon from "@mui/icons-material/Business";
import StoreIcon from "@mui/icons-material/Store";
import BackpackIcon from "@mui/icons-material/Backpack";
import SettingsIcon from "@mui/icons-material/Settings";
import { useRouter } from "next/navigation";
import CompanyManager from "../components/company/CompanyManager";
import BranchManager from "../components/branch/BranchManager";
import InventoryManager from "../components/inventory/InventoryManager";
import { alpha } from "@mui/material";

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
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <Box
        component="header"
        sx={{
          bgcolor: "#EDF2F7",
          boxShadow: 1,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container disableGutters maxWidth={false} sx={{ px: 2, py: 1 }}>
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
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              {breadcrumbItems.map(({ key, label, icon }) => (
                <Link
                  key={key}
                  underline="none"
                  color={activeTab === key ? "primary.main" : "text.secondary"}
                  onClick={() => handleTabChange(key)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "1.1rem",
                    fontWeight: activeTab === key ? "bold" : "normal",
                    cursor: "pointer",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: (theme) =>
                        alpha(theme.palette.primary.main, 0.08),
                    },
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
        </Container>
      </Box>

      {/* MAIN CONTENT */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          pt: 2,
        }}
      >
        <Container disableGutters maxWidth={false} sx={{ px: 2, pb: 3 }}>
          {activeTab === "company" && <CompanyManager />}
          {activeTab === "branch" && <BranchManager />}
          {activeTab === "inventory" && <InventoryManager />}
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;

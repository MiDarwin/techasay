"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Button from "@mui/joy/Button";
import { apiRequest } from "../utils/api";
import CompanyManager from "../components/company/CompanyManager";
import BranchManager from "../components/branch/BranchManager";
import InventoryManager from "../components/inventory/InventoryManager";
const homePage = () => {
  const [activeTab, setActiveTab] = useState("company");

  return (
    <div>
      <header>
        <Button
          onClick={() => setActiveTab("company")}
          sx={{ padding: "8px 16px" }} // Yatay ve dikey padding
        >
          Şirket
        </Button>
        <Button
          onClick={() => setActiveTab("branch")}
          sx={{ padding: "8px 16px" }}
        >
          Şube
        </Button>
        <Button
          onClick={() => setActiveTab("inventory")}
          sx={{ padding: "8px 16px" }}
        >
          Envanter
        </Button>
      </header>

      <main>
        {activeTab === "company" && <CompanyManager />}
        {activeTab === "branch" && <BranchManager />}
        {activeTab === "inventory" && <InventoryManager />}
      </main>
    </div>
  );
};

export default homePage;

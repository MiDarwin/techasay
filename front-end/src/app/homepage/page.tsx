"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import CompanyTable from "../components/company/CompanyTable";
import CompanyDetailsModal from "../components/CompanyDetailsModal";
import ErrorLogsModal from "../components/ErrorLogsModal";
import { apiRequest } from "../utils/api";
import Head from "next/head"; // Google Fonts için Head bileşeni
import CompanyManager from "../components/company/CompanyManager";
import BranchManager from "../components/branch/BranchManager";
import InventoryManager from "../components/inventory/InventoryManager";
const homePage = () => {
  const [activeTab, setActiveTab] = useState("company");

  return (
    <div>
      <header>
        <button onClick={() => setActiveTab("company")}>Şirket</button>
        <button onClick={() => setActiveTab("branch")}>Şube</button>
        <button onClick={() => setActiveTab("inventory")}>Envanter</button>
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

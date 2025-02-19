// app/dashboard/page.tsx
"use client";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useRouter } from "next/navigation";

const Dashboard = () => {
    const { token, permissions } = useContext(AuthContext)!;
    const router = useRouter();

    if (!token) {
        router.push("/auth/login");
        return null;
    }

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Permissions: {permissions.join(", ")}</p>
        </div>
    );
};
export default Dashboard;
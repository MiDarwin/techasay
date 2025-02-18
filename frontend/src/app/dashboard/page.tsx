"use client";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
    const { user, logout } = useAuth();

    if (!user) return <p>Yetkisiz giriş, lütfen giriş yapın.</p>;

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Hoş geldin!</p>
            <button onClick={logout}>Çıkış Yap</button>
        </div>
    );
};

export default Dashboard;
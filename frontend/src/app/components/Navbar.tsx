"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    return (
        <nav>
            <Link href="/">Ana Sayfa</Link>
            {user ? (
                <>
                    <Link href="/dashboard">Dashboard</Link>
                    <button onClick={logout}>Çıkış Yap</button>
                </>
            ) : (
                <>
                    <Link href="/auth/login">Giriş Yap</Link>
                    <Link href="/auth/register">Kayıt Ol</Link>
                </>
            )}
        </nav>
    );
};

export default Navbar;

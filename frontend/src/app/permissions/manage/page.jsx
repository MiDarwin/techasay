"use client";
import { useState } from "react";
import { apiRequest } from "@/utils/api";

export default function ManagePermissionsPage() {
  const [userId, setUserId] = useState("");
  const [permissions, setPermissions] = useState("");
  const token = localStorage.getItem("access_token");

  const handleUpdatePermissions = async () => {
    try {
      const newPermissions = permissions.split(",").map((p) => p.trim());
      const data = await apiRequest(
        "/permissions/update/",
        "POST",
        { target_user_id: parseInt(userId), new_permissions: newPermissions },
        token
      );
      alert(data.message);
    } catch (error) {
      alert(error.detail || "Bir hata oluştu.");
    }
  };

  return (
    <div>
      <h2>İzinleri Güncelle</h2>
      <input
        type="text"
        placeholder="Kullanıcı ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Yeni İzinler (örn: read, write)"
        value={permissions}
        onChange={(e) => setPermissions(e.target.value)}
      />
      <button className="button" onClick={handleUpdatePermissions}>Güncelle</button>
    </div>
  );
}

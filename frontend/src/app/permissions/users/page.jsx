"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "../../utils/api";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiRequest("/permissions/users/", "GET");
        setUsers(data.users);
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        } else {
          alert("Bilinmeyen bir hata oluştu.");
        }
      }
    };

    fetchUsers();
  }, []);

  return (
    <div>
      <h2>Kullanıcılar ve İzinler</h2>
      <ul>
        {users.map((user) => (
          <li key={user.user_id}>
            Kullanıcı ID: {user.user_id}, İzinler: {user.permissions.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}

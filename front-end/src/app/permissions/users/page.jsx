"use client";
import { useEffect, useState } from "react";
import { apiRequest } from "../../utils/api";

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiRequest("/permissions/users/", "GET");
        // Kullanıcıları izin sayısına göre çoktan aza sıralıyoruz
        const sortedUsers = data.users.sort(
          (a, b) => b.permissions.length - a.permissions.length
        );
        setUsers(sortedUsers);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Kullanıcılar ve İzinler
      </h2>

      <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-3 px-4 text-left">Kullanıcı ID</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">İzinler</th>
              <th className="py-3 px-4 text-left">İzin Sayısı</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.user_id}
                className={index % 2 === 0 ? "bg-gray-100" : "bg-blue-100"}
              >
                <td className="py-3 px-4">{user.user_id}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.permissions.join(", ")}</td>
                <td className="py-3 px-4">{user.permissions.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

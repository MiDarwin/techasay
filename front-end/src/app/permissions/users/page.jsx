"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Yönlendirme için
import { apiRequest } from "../../utils/api";

export default function UsersPage() {
  const [users, setUsers] = useState([]); // Kullanıcı listesi
  const router = useRouter(); // Next.js yönlendirme özelliği

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiRequest("/permissions/users/", "GET");
        const sortedUsers = data.users.sort(
          (a, b) => b.permissions.length - a.permissions.length
        );
        setUsers(sortedUsers);
      } catch (error) {
        console.error("API isteği sırasında bir hata oluştu:", error);
        alert("Kullanıcı verileri alınırken bir hata oluştu.");
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (userId) => {
    // Kullanıcı detay sayfasına yönlendirme
    router.push(`/permissions/manage?user_id=${userId}`);
  };

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
              <th className="py-3 px-4 text-left">İzin Sayısı</th>
              <th className="py-3 px-4 text-left">Aksiyon</th>
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
                <td className="py-3 px-4">{user.permissions.length}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleUserClick(user.user_id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    Detay Gör
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

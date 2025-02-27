"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // URL parametrelerini almak için
import { apiRequest } from "../../utils/api";

export default function ManagePermissionsPage() {
  const [user, setUser] = useState(null); // Seçilen kullanıcı bilgisi
  const [allPermissions, setAllPermissions] = useState([
    "Bpet",
    "permissions_control",
  ]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const searchParams = useSearchParams(); // URL parametrelerini almak için
  const router = useRouter();

  useEffect(() => {
    const userId = searchParams.get("_id"); // `_id` parametresi alınıyor
    if (!userId) {
      router.push("/permissions/users"); // Eğer `_id` yoksa kullanıcılar sayfasına geri yönlendir
      return;
    }

    const fetchUser = async () => {
      try {
        const data = await apiRequest(`/permissions/user/${userId}`, "GET"); // Backend'e `_id` ile API isteği
        setUser(data);
        setSelectedPermissions(data.permissions);
      } catch (error) {
        console.error("Kullanıcı bilgisi alınırken hata oluştu:", error);
        setErrorMessage("Kullanıcı bilgisi alınırken bir hata oluştu.");
      }
    };

    fetchUser();
  }, [searchParams, router]);

  const handlePermissionToggle = (permission) => {
    if (selectedPermissions.includes(permission)) {
      setSelectedPermissions((prev) =>
        prev.filter((perm) => perm !== permission)
      );
    } else {
      setSelectedPermissions((prev) => [...prev, permission]);
    }
  };

  const handleSavePermissions = async () => {
    if (!user) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiRequest("/permissions/update/", "POST", {
        target_user_id: user._id, // Backend'e `_id` ile izin güncelleme
        new_permissions: selectedPermissions,
      });
      setSuccessMessage(`İzinler başarıyla güncellendi: ${user._id}`);
    } catch (error) {
      console.error("İzinler güncellenirken hata oluştu:", error);
      setErrorMessage(
        error?.detail || "İzinler güncellenirken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Görevleri Yönet</h2>

        <div className="mb-6">
          <p className="text-lg">
            <strong>Kullanıcı ID:</strong> {user._id}
          </p>
          <p className="text-lg">
            <strong>Email:</strong> {user.email}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4">İzinler</h3>
          <div className="flex flex-wrap gap-4">
            {allPermissions.map((permission) => (
              <button
                key={permission}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  selectedPermissions.includes(permission)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-500"
                } hover:bg-blue-600`}
                onClick={() => handlePermissionToggle(permission)}
              >
                {permission}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 text-red-500 text-center">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="mb-4 text-green-500 text-center">{successMessage}</div>
        )}

        <button
          onClick={handleSavePermissions}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? "Kaydediliyor..." : "İzinleri Kaydet"}
        </button>
      </div>
    </div>
  );
}
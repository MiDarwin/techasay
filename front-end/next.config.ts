import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/auth/login",
        permanent: true, // Kalıcı yönlendirme (HTTP 308). Geçici ise `false` yapın.
      },
    ];
  },
  // Diğer yapılandırma seçenekleriniz varsa buraya ekleyebilirsiniz.
};

export default nextConfig;
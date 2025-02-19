import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>Kullanıcı Yönetimi</h1>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

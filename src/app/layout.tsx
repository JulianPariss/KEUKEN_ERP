import { AuthProvider } from "@/contexts/AuthContext";
import { DxConfigProvider } from "@/contexts/DxConfigProvider";
import { LocaleProvider } from "@/contexts/LocaleContext";
import type { Metadata } from "next";
import '@repo/ui/styles.css';

export const metadata: Metadata = {
  title: "ERP Keuken",
  description: "Sistema de gestión empresarial",
  icons: {
    icon: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`antialiased`}
      >
        <DxConfigProvider>
          <LocaleProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LocaleProvider>
        </DxConfigProvider>
      </body>
    </html>
  );
}

import { APP_VERSION } from "../lib/constants/app.constants";
import { ThemeProvider } from '@repo/ui/theme';

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const appPort = process.env.APP_PORT ? process.env.APP_PORT.replace(/"/g, '') : '';
  const environment = appPort === '9000' ? 'prod' : appPort === '9008' ? 'dev' : 'desconocido';

  return (
    <ThemeProvider>
      <section className="w-screen h-screen bg-dx-main-bg relative overflow-hidden">
        {children}
      <div className="absolute bottom-4 right-4 z-50 bg-focus-300 text-variant text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
        {environment}{` v${APP_VERSION}`}
      </div>
      </section>
    </ThemeProvider>
  );
}

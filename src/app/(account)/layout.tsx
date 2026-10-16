import { ThemeProvider } from '@repo/ui/theme';
import { DeployBadge } from '@repo/ui/brand';

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <section className="w-screen h-screen bg-dx-main-bg relative overflow-hidden">
        {children}
        <DeployBadge className="absolute bottom-4 right-4 z-50" />
      </section>
    </ThemeProvider>
  );
}

import { ThemeProvider } from '@repo/ui/theme';

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <section className="w-screen h-screen bg-dx-main-bg relative overflow-hidden">
        {children}
      </section>
    </ThemeProvider>
  );
}

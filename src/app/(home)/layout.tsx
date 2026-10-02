import { CompanyProvider } from '@/contexts/CompanyContext';
import { BranchProvider } from '@/contexts/BranchContext';
import { RecoveryProvider } from '@/contexts/RecoveryContext';
import { ThemeProvider } from '@repo/ui/theme';
import { Box, Item } from 'devextreme-react/box';
import DevExtremeIntlBridge from '../lib/locale/localeHandler';
import { getAppRoutes } from '../lib/routes/getRoutes';
import Footer from './components/layout/customFooter';
import Header from './components/layout/customHeader';
import Sidebar from './components/layout/navSidebar';
import { APP_VERSION } from '../lib/constants/app.constants';

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const routes = getAppRoutes();
  const appPort = process.env.APP_PORT ? process.env.APP_PORT.replace(/"/g, '') : '';
  const environment = appPort === '9000' ? 'prod' : appPort === '9008' ? 'dev' : 'desconocido';

  return (
    <ThemeProvider>
      <CompanyProvider>
        <BranchProvider>
          <RecoveryProvider>
            <section className="h-screen w-screen flex flex-col overflow-hidden">
              <DevExtremeIntlBridge />
              <Box direction="row" width="100%" height="100%">
                {/* Sidebar */}
                <Item ratio={0} baseSize="auto">
                  <Sidebar initialRoutes={routes} />
                </Item>

                {/* Main Content Area */}
                <Item ratio={1}>
                  <Box direction="col" width="100%" height="100%">
                    {/* Header */}
                    <Item ratio={0} baseSize="56px">
                      <Header routes={routes} />
                    </Item>
                    {/* Main Content */}
                    <Item ratio={1}>
                      <div className="h-full w-full overflow-y-auto flex flex-col relative bg-primary-950/80 backdrop-blur-sm p-4">
                        {children}
                      </div>
                    </Item>
                    {/* Footer */}
                    <Item ratio={0} baseSize="31px">
                      <div className="h-full w-full relative flex items-center">
                        <Footer />
                        <div className="absolute right-4 z-50 bg-focus-300 text-variant text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase">
                          {environment}{` v${APP_VERSION}`}
                        </div>
                      </div>
                    </Item>
                  </Box>
                </Item>
              </Box>
            </section>
          </RecoveryProvider>
        </BranchProvider>
      </CompanyProvider>
    </ThemeProvider>
  );
}

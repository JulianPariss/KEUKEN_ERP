'use client';

import { getCustomData } from '@/app/lib/routes/customData';
import { IAppRoute } from '@/app/lib/routes/getRoutes';
import { useAuth } from '@/contexts/AuthContext';
import { useBranch } from '@/contexts/BranchContext';
import DropDownButton from 'devextreme-react/drop-down-button';
import { useRouter } from 'next/navigation';
import Breadcrumb from './breadcrumb';
import ThemeSwitcher from './themeSwitcher';

interface HeaderProps {
  routes: IAppRoute[];
}

export default function CustomHeader({ routes }: HeaderProps) {
  const router = useRouter();
  const { logout, user, companies, currentCompany, changeCompany } = useAuth();
  const { branches, currentBranch, changeBranch, loadingBranches } = useBranch();

  const customRoutes = routes.map(route => ({
    ...route,
    ...getCustomData(route.routeKey),
  }));

  const accountMenuItems = [
    { id: 'profile', text: 'Perfil', icon: 'user', hint: 'Ver y editar mi perfil' },
    { id: 'settings', text: 'Configuración', icon: 'preferences', hint: 'Configuración de la cuenta' },
    { id: 'logout', text: 'Cerrar sesión', icon: 'export', hint: 'Cerrar sesión de forma segura' },
  ];

  const renderItemWithHint = (item: any) => (
    <div className="w-full h-full flex items-center gap-2" title={item.hint}>
      {item.icon && <i className={`dx-icon-${item.icon}`} />}
      <span>{item.text}</span>
    </div>
  );

  const handleAccountMenuClick = (e: any) => {
    const item = e.itemData;
    switch (item.id) {
      case 'profile':
        router.push('/users/me');
        break;
      case 'settings':
        console.log('Navigate to settings');
        break;
      case 'logout':
        logout();
        break;
      default:
        break;
    }
  };

  const companyItems = companies.map(company => ({
    id: company.id,
    text: company.name,
    icon: 'home',
    hint: `Cambiar a la empresa ${company.name}`
  }));

  const handleCompanyClick = (e: any) => {
    const selectedCompany = companies.find(c => c.id === e.itemData.id);
    if (selectedCompany) {
      changeCompany(selectedCompany);
    }
  };

  const branchItems = branches.map(branch => ({
    id: branch.id,
    text: branch.name,
    icon: 'store',
    hint: `Cambiar a la sucursal ${branch.name}`
  }));

  const handleBranchClick = (e: any) => {
    const selectedBranch = branches.find(b => b.id === e.itemData.id);
    if (selectedBranch) {
      changeBranch(selectedBranch);
    }
  };

  return (
    <header className="w-full h-14 bg-primary-500 border-b border-main/10 flex items-center justify-between px-4 z-20 sticky top-0 left-0">
      {/* Logo Section */}
      <div className="flex items-center gap-3 h-full">
        {/* Breadcrumb */}
        <div className="ml-4">
          <Breadcrumb routes={customRoutes} />
        </div>
      </div>
      {/* Account Menu Section */}
      <div className="flex items-center gap-3">
        <ThemeSwitcher />
        <DropDownButton
          text={currentCompany?.name || 'Empresa'}
          hint={currentCompany?.name || 'Empresa'}
          icon="home"
          items={companyItems}
          onItemClick={handleCompanyClick}
          stylingMode="text"
          keyExpr="id"
          displayExpr="text"
          useItemTextAsTitle={false}
          itemRender={renderItemWithHint}
          dropDownOptions={{
            width: 240,
            wrapperAttr: {
              class: "popup-menu-container"
            }
          }}
        />
        <DropDownButton
          text={loadingBranches ? 'Cargando sucursales...' : (currentBranch?.name || 'Sucursal')}
          hint={currentBranch?.name || 'Sucursal'}
          icon="store"
          items={branchItems}
          onItemClick={handleBranchClick}
          disabled={loadingBranches || branches.length === 0}
          stylingMode="text"
          keyExpr="id"
          displayExpr="text"
          useItemTextAsTitle={false}
          itemRender={renderItemWithHint}
          dropDownOptions={{
            width: 240,
            wrapperAttr: {
              class: "popup-menu-container"
            }
          }}
        />
        <DropDownButton
          text={user?.name || 'Cuenta'}
          icon="user"
          items={accountMenuItems}
          onItemClick={handleAccountMenuClick}
          itemRender={renderItemWithHint}
          useItemTextAsTitle={false}
          displayExpr="text"
          stylingMode="text"
          className="text-dx-text hover:text-dx-link transition-colors"
          dropDownOptions={{
            wrapperAttr: {
              class: "popup-menu-container"
            }
          }}
        />
      </div>
    </header>
  );
}

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@repo/devextreme';
import { ITextBoxOptions } from 'devextreme-react/cjs/text-box';
import Form, { FormRef, GroupItem, RequiredRule, SimpleItem } from 'devextreme-react/form';
import notify from 'devextreme/ui/notify';
import Link from 'next/link';
import { useCallback, useRef, useState } from 'react';

export default function Login() {
  const formRef = useRef<FormRef>(null);
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const formData = useRef({
    email: '',
    password: ''
  });

  const handleSubmit = useCallback(async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();

    const result = formRef.current?.instance().validate();
    if (!result?.isValid) {
      notify('Por favor completa todos los campos correctamente', 'error', 3000);
      return;
    }

    setLoading(true);

    try {
      await login(formData.current.email, formData.current.password);
      notify({
        message: `¡Bienvenido de nuevo!`,
        width: 300,
        direction: "up-push",
        position: {
          at: 'bottom right',
          my: 'bottom right',
          offset: '-20 -20'
        },
      }, 'success', 3000);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Credenciales incorrectas';
      notify(errorMessage, 'error', 3000);
    } finally {
      setLoading(false);
    }
  }, [login]);

  const changePasswordMode = useCallback((name: string): void => {
    const editor = formRef.current?.instance().getEditor(name);
    editor?.option('mode', editor?.option('mode') === 'text' ? 'password' : 'text');
  }, []);

  const getPasswordOptions = useCallback((): ITextBoxOptions => ({
    mode: 'password',
    buttons: [
      {
        name: 'password',
        location: 'after',
        options: {
          stylingMode: 'text',
          icon: 'eyeopen',
          onClick: (): void => changePasswordMode('password'),
        },
      },
    ],
  }), [changePasswordMode]);

  return (
    <div className="flex min-h-screen bg-dx-main-bg transition-colors duration-300">
      <div
        className="
      flex flex-col justify-center 
      items-center bg-primary-900/80
      backdrop-blur-lg 
      p-8 w-1/4 relative border-focus-100 
      border-r-2 
      duration-300
      ">
        <div className='w-full'>
          <div className="mb-12">
            <h1 className="text-2xl font-bold text-main">Bienvenido de nuevo</h1>
            <p className="text-main/70 text-sm  mt-1">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit}>
            <Form
              ref={formRef}
              formData={formData.current}
              labelLocation="top"
              colCount={2}
            >
              <GroupItem colSpan={2}>

                <SimpleItem
                  dataField="email"
                  label={{ text: "Correo Electrónico" }}
                  editorType="dxTextBox"
                  editorOptions={{
                    valueChangeEvent: 'keyup blur change',
                    stylingMode: 'filled',
                    placeholder: "ejemplo@correo.com",
                    elementAttr: {
                      name: "email",
                      autocomplete: "username",
                      class: "!bg-main/5 !rounded-dx"
                    }
                  }}
                >
                  <RequiredRule message="El correo es requerido" />
                  {/* <EmailRule message="El correo no es válido" /> */}
                </SimpleItem>

                <SimpleItem
                  dataField="password"
                  label={{ text: "Contraseña" }}
                  editorType="dxTextBox"
                  editorOptions={{
                    ...getPasswordOptions(),
                    valueChangeEvent: 'keyup blur change ',
                    stylingMode: 'filled',
                    placeholder: "********",
                    elementAttr: {
                      name: "password",
                      autocomplete: "current-password",
                      class: "!bg-main/5 !rounded-dx"
                    }
                  }}
                >
                  <RequiredRule message="La contraseña es requerida" />
                </SimpleItem>
              </GroupItem>
            </Form>

            <div className="mt-6 flex flex-col gap-4">
              <Button
                type="default"
                stylingMode="contained"
                useSubmitBehavior={true}
                disabled={loading}
                width="100%"
                height={36}
                className="bg-focus-300! rounded-dx! shadow-lg shadow-black/15 py-3"
              >
                <div className="flex items-center justify-center gap-2">
                  {loading && <i className="dx-icon-refresh dx-icon-spin text-sm text-variant" />}
                  <p className="text-sm font-medium text-variant!">
                    {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                  </p>
                </div>
              </Button>

              <div className="text-center">
                <p className="text-main text-sm ">
                  {'¿No tienes una cuenta?  '}
                  <Link
                    href="/"
                    className="!text-focus-300 hover:underline font-medium"
                  >
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>

      </div>
      <div className='w-full absolute -z-10'>
        <img src='https://res.cloudinary.com/dbfuxwpmh/image/upload/v1773250632/banner_lbo3yn.png' className='w-full h-screen object-cover' alt="Banner" />
      </div>
    </div>
  );
}

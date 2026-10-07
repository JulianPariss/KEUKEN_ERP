---
name: ui-components-standard
description: Reglas y convenciones obligatorias para la maquetación, estilos y composición de componentes de UI (ej. modales de creación/edición, botones, formularios), asegurando una estética y comportamiento consistente en toda la aplicación.
---

# Estandarización de Componentes de UI

Esta skill debe aplicarse cada vez que se cree o modifique un componente visual, especialmente Modales de Creación, Edición y Formularios (ABM). 

## 1. Modales (Popups de DevExtreme)

Todos los modales de creación, edición o actualización deben seguir **estrictamente** la siguiente estructura y estilos, basados en el componente de referencia `cityCreation.tsx`.

### Configuración del `<Popup>`
Se debe utilizar el componente `Popup` de `devextreme-react/popup` con las siguientes propiedades por defecto:
- `dragEnabled={false}`
- `hideOnOutsideClick={true}`
- `showCloseButton={true}`
- `showTitle={true}`
- Refresco en apertura: `onShown={(e) => { e.component.repaint(); }}`

**Estructura interna básica:**
1. `<Position at="center" my="center" />` como primer hijo del Popup.
2. Contenedor principal con padding: `<div className="p-4">` envolviendo al formulario.

### Configuración del `<Form>`
- Se debe utilizar el componente `Form` de `devextreme-react/form`.
- `labelLocation="top"`.
- Los inputs deben agruparse con `<GroupItem colCount={2}>` (u otro valor según diseño, pero usar GroupItem).
- Cada campo se define con `<SimpleItem>`.

**Estilos de los Inputs (`editorOptions`):**
- Todos los inputs (`dxTextBox`, `dxSelectBox`, etc.) deben usar:
  - `stylingMode: 'filled'`
- Los campos de texto (`dxTextBox`) deben tener `valueChangeEvent: "blur"`.

### Botones de Acción (ToolbarItem)
Los botones de acción en el modal deben renderizarse utilizando `<ToolbarItem toolbar="bottom" location="after">`. Se requiere seguir un orden y estilización exacta:

1. **Botón de Cancelar:**
   Debe ir antes del botón de Guardar en la jerarquía.
   - `stylingMode="text"`
   - `className="!rounded-dx !bg-main/10"`
   - `disabled={loading}`

2. **Botón de Guardar / Confirmar:**
   - `text="Guardar"`
   - `type="default"`
   - `stylingMode="contained"`
   - `className="!bg-focus-300 shadow-lg shadow-black/20 !text-variant"`
   ```tsx
   <Button
       text="Guardar"
       type="default"
       stylingMode="contained"
       onClick={handleSubmit}
       disabled={loading}
       className="!bg-focus-300 shadow-lg shadow-black/20 !text-variant"
   />
   ```

## 2. Formularios Compartidos e Importaciones

- Mantén el objeto `formData` en una referencia o deje que DevExtreme lo mute directamente sin provocar re-renderizados continuos en cada pulsación (ver `solve-modal-wrong-re-rendering` skill).

> [!IMPORTANT]
> **No utilizar estilos en línea ni colores hardcodeados.** Todo el diseño debe depender de clases utilitarias de Tailwind, la configuración global de DevExtreme y las variables temáticas.

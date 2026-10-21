---
name: solve-modal-wrong-re-rendering
description: Guía obligatoria para solucionar problemas de re-renderizado indeseado, pérdida de foco y reseteo de scroll en modales y formularios (especialmente al utilizar DevExtreme Form). Validada contra documentación oficial DevExtreme (Dxdocs).
---

# Solución de Re-renderizados en Modales y Formularios

Al trabajar con formularios complejos (especialmente el componente `<Form>` de DevExtreme) dentro de modales (como `<Popup>`), es un error común gestionar el estado de manera que provoque el re-renderizado constante de todo el modal. Esto genera una pésima UX, manifestándose en la **pérdida del foco del input** al escribir y el **reseteo molesto de la barra de scroll** interna.

> **Base oficial (Dxdocs):** las APIs citadas están en la documentación React de DevExtreme. Esta skill es más estricta que los demos oficiales de React en el caso **Popup + Form con scroll**, porque el ejemplo de `setState` con spread de `formData` de DX provoca justo el freeze/foco/scroll que queremos evitar.

Para evitar estos comportamientos, debes seguir estrictamente los siguientes patrones:

## 1. No sincronizar escritura con `setState` (sí puedes usar `onFieldDataChanged` con cuidado)

**Nunca** vincules la escritura del formulario a un `useState` que se actualice en cada pulsación de tecla copiando el estado anterior (`...prev`), ni en `onFieldDataChanged` ni en `onValueChanged` del editor.

*   **Comportamiento nativo (Dxdocs):** la prop [`formData`](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxForm/Configuration/#formData) *“Gets updated every time form fields change”* — DevExtreme muta el objeto que le pasaste.
*   **Reemplazar el objeto completo** con `form.option("formData", newObject)` o `setFormData({ ... })` **rerenderiza el Form desde cero** ([Update Form Data Using the API](https://js.devexpress.com/React/Documentation/Guide/UI_Components/Form/Update_Form_Data_Using_the_API/)).
*   **`onFieldDataChanged` no está prohibido:** es el evento oficial ([Handle the Value Change Event](https://js.devexpress.com/React/Documentation/Guide/UI_Components/Form/Handle_the_Value_Change_Event/)). Lo prohibido es usarlo para `setFormData` / `setState` del padre en cada cambio. Úsalo solo para efectos laterales baratos (refs, contadores, flags) que **no** remonte el `<Form>` ni cambien la referencia de `formData`.
*   **Para guardar:** lee el mismo objeto `formData` (ya mutado) o `form.option("formData")`.

## 2. Selectores en cascada y cambios de editor sin estado React

Cuando un campo depende de otro (País → Provincia), **no** uses `useState` + `useEffect` en el padre del modal si eso re-renderiza el `<Form>` y recrea `editorOptions={{ ... }}` inline.

**Dxdocs — camino correcto:**

1. Actualizar valores con [`updateData(dataField, value)`](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxForm/Methods/#updateDatadataField_value) (solo ese editor, sin rerender completo).
2. Cambiar props del editor con [`getEditor(dataField).option(...)`](https://js.devexpress.com/React/Documentation/Guide/UI_Components/Form/Change_Properties_at_Runtime/Editor_Properties/) (`dataSource`, `disabled`, `readOnly`, etc.).
3. Evitar [`itemOption`](https://js.devexpress.com/React/Documentation/Guide/UI_Components/Form/Change_Properties_at_Runtime/Item_Properties/) para cambios frecuentes: DX advierte que al modificar un ítem **refresca el grupo** y **re-inicializa los editores** (vuelven a `editorOptions` iniciales). Úsalo solo para toggles puntuales (ej. mostrar/ocultar una sección opcional una vez).

**Patrón del proyecto:**

```tsx
const stateEditorRef = useRef<any>(null);

// Hijo: capturar instancia
editorOptions={{
  onInitialized: (e: any) => { stateEditorRef.current = e.component; },
}}

// Padre: onValueChanged
onValueChanged: (e: any) => {
  if (!e.event) return; // solo interacción de usuario
  formRef.current?.instance().updateData("stateCode", "");
  stateEditorRef.current?.option("dataSource", []);
  stateEditorRef.current?.option("disabled", true);
  if (e.value) {
    statesService.getAll(token, e.value).then(res => {
      stateEditorRef.current?.option("dataSource", res.items);
      stateEditorRef.current?.option("disabled", false);
    });
  }
}
```

## 3. Carga de datos iniciales (modo edición)

Cuando abras el modal para **editar** un registro con valores encadenados, carga las dependencias **antes** de montar/mostrar el formulario (spinner/`isLoading`).

1. Guarda arrays iniciales en `useRef`.
2. Asigna `dataSource: initialStatesRef.current` al montar.
3. Después manipula con `getEditor` / refs como en §2.

## 4. Geometría del Popup (`onShown` + `repaint` / `updateDimensions`)

**Problema:** con `height="auto"` o contenido async, el título/layout se calcula antes de tiempo y puede truncarse.

**Solución (Dxdocs):**

*   [`onShown`](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxPopup/Configuration/#onShown): después de mostrar el Popup.
*   [`Popup.repaint()`](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxPopup/Methods/): recalcula tamaño/posición (en overlays suele ser “sin rerender completo” del contenido).
*   Tras montar contenido pesado o cambiar de step, preferí [`Form.updateDimensions()`](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxForm/Methods/#updateDimensions) o un único `Popup.repaint()` — **no** dispares `repaint` en cada tecla, ni en cada ítem añadido a una lista.

```tsx
<Popup
  onShown={(e) => {
    e.component.repaint();
    // Si el Form monta después (contentReady), llamar de nuevo
    // formRef.current?.instance()?.updateDimensions?.();
  }}
>
```

> **Nota DX:** `Form.repaint()` / varios `repaint` de widgets **re-inicializan** estado interno. No uses `Form.repaint()` como atajo de layout; preferí `updateDimensions` o `Popup.repaint`.

## 5. Limpieza en `onHidden`, no en `onHiding` / `onClose`

*   [`onHiding`](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxPopup/Configuration/#onHiding): **antes** de ocultar (aquí solo `setIsOpen(false)` / animación).
*   [`onHidden`](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxPopup/Configuration/#onHidden): **después** de ocultar — aquí limpiá `selectedEntity`, `formData` de edición, spinners, etc.

Si limpiás `initialData` en `onClose`/`onHiding`, el título y el form cambian **durante** la animación de salida (glitch).

```tsx
<PeriodCreationModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onHidden={() => setSelectedPeriod(null)}
  initialData={selectedPeriod}
/>
```

## 6. Sub-elementos en arreglos (mutación in-place de `formData`)

**Problema:** `setFormData(prev => ({ ...prev, presentations: [...] }))` cambia la referencia de `formData` → Form se reinicializa → scroll a top.

**Solución:**

1. `formData.presentations.push(newPres)` (misma referencia).
2. `setRenderTrigger(t => t + 1)` solo en el subcomponente lista.
3. No reemplaces el objeto raíz que alimenta `<Form formData={...}>`.

## 7. Reset de borradores / `ValidationGroup` (API nativa primero, `key` como fallback)

**Problema:** tras validar y añadir un borrador, vaciar campos y llamar mal a `reset` puede dejar el UI en rojo o con valores residuales.

**Orden recomendado (Dxdocs):**

1. Preferí [`ValidationGroup.reset()`](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxValidationGroup/Methods/#reset) o [`validationEngine.resetGroup(group)`](https://js.devexpress.com/React/Documentation/ApiReference/Common/Utils/validationEngine/#resetGroupgroup): resetea **valores y resultado de validación** de los editores del grupo.
2. Para el Form principal al abrir el modal, preferí [`Form.reset(editorsData)`](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxForm/Methods/#reseteditorsData) con un clone de los datos deseados (o sin args para volver a iniciales). Evitá el doble `option("formData")` + `reset()` a ciegas.
3. **Fallback React:** si el grupo usa editores no controlados con `defaultValue` y el reset no deja el borrador prístino, entonces sí: `<ValidationGroup key={groupKey}>` e incrementar `groupKey` tras el alta. Documentá por qué el remount es necesario.

```tsx
// Preferido tras añadir un ítem al borrador:
tempRef.current = emptyDraft;
validationGroupRef.current?.instance()?.reset();
setListTick(t => t + 1); // solo la lista, no remount del Form padre

// Fallback si reset no alcanza:
setGroupKey(k => k + 1);
```

## 8. Memoizar el JSX del `<Form>` ante estados de cabecera

Estados de UI (`isEditing`, botones) no deben forzar a React a recrear el árbol de `<SimpleItem>`.

1. Excluí esos flags de las deps de `editorOptions` / `useMemo` del Form.
2. Activá `readOnly`/`disabled` con `getEditor(...).option(...)`.
3. Envolvé `<Form>` en `useMemo` con deps estables (catálogos, modo, mapas de opciones), **sin** `isEditing` / toggles de toolbar.

## 9. `useState` para `formData` solo al abrir; escritura = mutación DX

1. `const [formData, setFormData] = useState(...)`.
2. En `useEffect` al abrir (`isOpen` / `initialData`):

```tsx
useEffect(() => {
  if (!isOpen) return;
  const nextData = initialData ? { ...initialData } : { ...emptyDefaults };
  setFormData(nextData);

  // Tras montar el Form (rAF / onShown + contentReady):
  requestAnimationFrame(() => {
    const form = formRef.current?.instance();
    if (!form) return;
    // Preferido (Dxdocs):
    form.reset({ ...nextData });
    // o, si hace falta sustituir el objeto:
    // form.option("formData", nextData);
    form.updateDimensions?.();
  });
}, [isOpen, initialData]);
```

3. **No** `setFormData` durante la escritura del usuario.
4. Padre: `onClose` solo cierra; `onHidden` limpia `selectedEntity`.

> **Nota DX sobre `reset`:** Form actualiza valores iniciales en cada `repaint`. Si llamás `Popup.repaint()` tras `reset`, pasá un clone de `formData` a `reset(editorsData)` si necesitás fijar de nuevo los valores.

---

## Resumen de oro

Minimiza `setState` atado al modal principal durante la interacción con el Form.  
`setFormData` / `Form.reset(editorsData)` solo al abrir.  
Dejá que DX mute `formData`; usá `updateData`, `getEditor().option` y `ValidationGroup.reset` / `validationEngine.resetGroup`.  
Arreglos hijos: mutación in-place.  
`key={groupKey}` solo si el reset nativo no deja el borrador limpio.  
`Popup.repaint` / `Form.updateDimensions` con mesura (no por cada keystroke).  
Limpieza de entidad seleccionada estrictamente en `onHidden`.

### Referencias Dxdocs

- [Form - formData](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxForm/Configuration/#formData)
- [Form - Update Form Data Using the API](https://js.devexpress.com/React/Documentation/Guide/UI_Components/Form/Update_Form_Data_Using_the_API/)
- [Form - Handle the Value Change Event](https://js.devexpress.com/React/Documentation/Guide/UI_Components/Form/Handle_the_Value_Change_Event/)
- [Form - Editor Properties at Runtime](https://js.devexpress.com/React/Documentation/Guide/UI_Components/Form/Change_Properties_at_Runtime/Editor_Properties/)
- [Form - Item Properties at Runtime](https://js.devexpress.com/React/Documentation/Guide/UI_Components/Form/Change_Properties_at_Runtime/Item_Properties/)
- [Form.reset(editorsData)](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxForm/Methods/#reseteditorsData)
- [ValidationGroup.reset](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxValidationGroup/Methods/#reset)
- [validationEngine.resetGroup](https://js.devexpress.com/React/Documentation/ApiReference/Common/Utils/validationEngine/#resetGroupgroup)
- [Popup onShown / onHidden / onHiding](https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxPopup/Configuration/)

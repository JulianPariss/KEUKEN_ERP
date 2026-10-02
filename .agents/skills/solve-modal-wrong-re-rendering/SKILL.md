---
name: solve-modal-wrong-re-rendering
description: Guía obligatoria para solucionar problemas de re-renderizado indeseado, pérdida de foco y reseteo de scroll en modales y formularios (especialmente al utilizar DevExtreme Form).
---

# Solución de Re-renderizados en Modales y Formularios

Al trabajar con formularios complejos (especialmente el componente `<Form>` de DevExtreme) dentro de modales (como `<Popup>`), es un error común gestionar el estado de manera que provoque el re-renderizado constante de todo el modal. Esto genera una pésima UX, manifestándose en la **pérdida del foco del input** al escribir y el **reseteo molesto de la barra de scroll** interna.

Para evitar estos comportamientos, debes seguir estrictamente los siguientes patrones:

## 1. Eliminar `onFieldDataChanged` para la escritura en tiempo real
**Nunca** vincules el formulario a una variable de estado (`useState`) que se actualice en cada pulsación de tecla copiando el estado anterior (`...prev`).

*   **Comportamiento Nativo:** El componente `<Form>` de DevExtreme muta (modifica) directamente el objeto de JavaScript que le pasas en la propiedad `formData`.
*   **Solución:** Permite que ocurra esa mutación directa. Al no ejecutar el `setFormData`, el modal padre no se re-renderización al escribir texto, preservando el foco y el scroll intactos. Para guardar, simplemente lee tu objeto `formData` inicial que ya contendrá los valores más recientes.

## 2. Gestión de SelectBox y Selectores en Cascada (Sin Estados de React)
Cuando tienes campos que dependen de otros (ej: País -> Provincia -> Ciudad), la forma tradicional es usar un `useState` para el "País seleccionado" y un `useEffect` para llamar a la API y cargar las Provincias. **Esto es incorrecto si causa el re-renderizado del modal padre**.

El re-renderizado del padre provoca que React envíe nuevas referencias en línea (ej. `editorOptions={{ ... }}`) a DevExtreme, forzando la reconstrucción del DOM de los inputs y perdiendo el scroll.

**Patrón Correcto (Mutación Nativa mediante Referencias):**

1.  **Captura la instancia del editor:** En el campo hijo, utiliza la opción `onInitialized` para guardar la referencia del componente nativo.
    ```tsx
    const stateEditorRef = useRef<any>(null);
    // ...
    <Item
        dataField="stateCode"
        editorOptions={{
            onInitialized: (e: any) => { stateEditorRef.current = e.component; },
            // ...
        }}
    />
    ```

2.  **Actualización directa y asíncrona:** En el evento `onValueChanged` del campo padre, dispara el fetch asíncrono y actualiza las propiedades del hijo **directamente en su instancia**, sin modificar ningún estado principal de React (`useState`).
    ```tsx
    <Item
        dataField="countryIsoCode"
        editorOptions={{
            onValueChanged: (e: any) => {
                // e.event asegura que el cambio fue por interacción real del usuario
                if (e.event) {
                    // Resetea visualmente los hijos dependientes
                    formRef.current?.instance().updateData("stateCode", "");
                    
                    // Bloquea los hijos temporalmente y vacía sus datos
                    stateEditorRef.current?.option("dataSource", []);
                    stateEditorRef.current?.option("disabled", true);
                    
                    if (e.value) {
                        // Trae los datos y asigna sin re-renderizar React!
                        statesService.getAll(token, e.value).then(res => {
                            stateEditorRef.current?.option("dataSource", res.items);
                            stateEditorRef.current?.option("disabled", false);
                        });
                    }
                }
            }
        }}
    />
    ```

## 3. Carga de Datos Iniciales (Modo Edición)
Cuando abras el modal para **editar** un registro que ya tiene valores encadenados (ej. ya tiene País y Provincia), carga todos los recursos de dependencias de golpe en el bloque de carga (spinner/isLoading) antes de montar el formulario.

1.  Usa `useRef` para guardar los arrays iniciales.
    ```tsx
    const initialStatesRef = useRef<any[]>([]);
    ```
2.  Antes de quitar el "Loading", carga las dependencias:
    ```tsx
    if (customer.countryIsoCode) {
        const res = await statesService.getAll(token, customer.countryIsoCode);
        initialStatesRef.current = res.items;
    }
    ```
3.  Asígnalas como propiedad inicial (`dataSource: initialStatesRef.current`) para que cuando el formulario monte, el hijo ya posea las opciones de su valor por defecto, pero dejándolo listo para ser manipulado por el `stateEditorRef` posteriormente.

## 4. Evitar truncamiento de título en modales con altura dinámica (`height="auto"`)
**El Problema:** Cuando un `<Popup>` se configura con `height="auto"`, o su contenido se dibuja de forma asíncrona, el modal calcula sus dimensiones iniciales e interna del título *antes* de que todo el contenido esté renderizado en el DOM. Esto causa que el título se calcule más pequeño y aparezca truncado (ej. `"Editar ..."`).

**La Solución:** Implementar el evento `onShown` en el `<Popup>` y ejecutar `e.component.repaint()`. Esto fuerza a DevExtreme a recalcular la geometría del modal y su cabecera una vez que está visible y renderizado en pantalla:
```tsx
<Popup
    visible={isOpen}
    onHiding={onClose}
    title={initialData ? "Editar Proveedor" : "Nuevo Proveedor"}
    height="auto"
    // ...
    onShown={(e) => {
        e.component.repaint();
    }}
>
```

## 5. Limpieza de datos en `onHidden` en lugar de `onClose`/`onHiding`
**El Problema:** Cuando se cierra un modal que cambia de UI según si está en edición o creación (ej. `initialData ? "Editar" : "Nuevo"`) o que tiene estados de carga, vaciar el estado del registro seleccionado (ej: `setSelectedPeriod(null)` o `setData(null)`) inmediatamente en el evento de cierre (`onClose` / `onHiding`) provoca que la interfaz cambie abruptamente de forma (o muestre un spinner) *mientras* el modal hace su animación de salida. Esto causa un "glitch" o salto visual de mala calidad.

**La Solución:** Mantener los datos intactos durante la transición de cierre. La limpieza de los datos del formulario o del spinner de carga debe realizarse **únicamente** cuando el modal ha desaparecido por completo del DOM, usando la propiedad `onHidden` de `<Popup>`:
```tsx
// En el componente padre:
<PeriodCreationModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)} // Dispara la animación de salida
    onHidden={() => setSelectedPeriod(null)} // Limpia el estado de edición al finalizar la animación
    initialData={selectedPeriod}
/>

// En el componente modal:
<Popup
    visible={isOpen}
    onHiding={onClose}
    onHidden={onHidden} // Callback enviado desde el padre
    // ...
/>
```

## 6. Agregado de Sub-elementos en Arreglos (Mutación in-place de `formData`)
**El Problema:** Al añadir elementos a un arreglo dentro de un registro (ej. presentaciones de un producto o ítems de una orden), ejecutar `setFormData(prev => ({ ...prev, presentations: [...prev.presentations, newPres] }))` reemplaza la referencia del objeto `formData`. Al cambiar la referencia del objeto que alimenta al `<Form formData={...}>` de DevExtreme, el formulario re-inicializa sus controles y **el scroll del modal vuelve hasta arriba de todo**.

**La Solución:** 
1. Muta el arreglo hijo directamente en el objeto de datos en memoria: `formData.presentations.push(newPres)`.
2. Utiliza un estado local entero ligero (ej: `setRenderTrigger(t => t + 1)`) únicamente para el sub-componente de la tabla/lista de elementos agregados.
3. Como la referencia principal de `formData` recibida por el `<Form>` del padre no cambió, DevExtreme no re-inicializa la vista y la posición del scrollbar se mantiene intacta.

## 7. Limpieza Prístina de `ValidationGroup` con `key={groupKey}`
**El Problema:** Tras validar y añadir exitosamente un borrador o formulario secundario (ej. un formulario de presentaciones dentro de la pantalla de productos), vaciar la referencia de datos en memoria y llamar a `validationGroup.reset()` a menudo desencadena la evaluación de reglas como `RequiredRule`, mostrando de inmediato todos los campos vacíos en rojo con mensajes de error sin que el usuario haya intentado interactuar.

**La Solución:** Asignar una clave reactiva `key={groupKey}` al contenedor `<ValidationGroup key={groupKey}>`. Tras añadir el elemento borrador, incrementa la clave (`setGroupKey(k => k + 1)`). Esto obliga a React a desmontar y volver a montar exclusivamente los campos borradores en estado totalmente prístino e in-evaluado, garantizando campos vacíos limpios sin alertas rojas de error y sin alterar la posición del scrollbar.

## 8. Memoización del Árbol JSX del `<Form>` ante Cambios de Estado en la Cabecera (`useMemo`)
**El Problema:** Cuando el componente del formulario posee estados secundarios de UI (ej. `isEditing`, `isSaving`, alternancia de botones de edición en la cabecera), modificar esos estados provoca el re-renderizado del componente en React. Si el componente `<Form>` de DevExtreme se evalúa directamente en el render principal sin estar memoizado, DevExtreme vuelve a examinar la lista de sus componentes hijos (`<SimpleItem>`, `<GroupItem>`), reconstruyendo internamente su estructura y **provocando saltos en la barra de scroll**.

**La Solución:**
1. Excluye los estados de UI (`isEditing`) de las dependencias de `editorOptionsMap`.
2. Habilita o deshabilita los editores **nativamente** con `useEffect`:
   `formRef.current?.instance().getEditor(attr.code)?.option("readOnly", isFormReadOnly)`
3. Envuelve el elemento JSX de `<Form>` en un `useMemo`:
   ```tsx
   const formContent = useMemo(() => {
       return (
           <Form ref={formRef} formData={formDataRef.current} ...>
               ...
           </Form>
       );
   }, [visibleAttributes, unGroupedAttrs, mode, groups, attrsByGroup, validationRulesMap, editorOptionsMap, handleFieldDataChanged]);
   ```
   Al no incluir `isEditing` en las dependencias del `useMemo`, React reutiliza exactamente el mismo nodo JSX para `<Form>`, impidiendo que DevExtreme vuelva a analizar la lista de hijos y manteniendo el scrollbar 100% fijo.

## 9. Vinculación de Formulario con `useState` y Reseteo Explícito al Abrir

**El Problema:** Pasar un objeto gestionado únicamente con `useRef` (`formDataRef.current`) a `<Form formData={...}>` impide que DevExtreme detecte cuando el modal se abre en modo Creación o Edición. Por otro lado, usar `useState` actualizándolo en cada pulsación de tecla (`onFieldDataChanged`) desencadena re-renderizados continuos de React, perdiendo el foco del teclado y reseteando el scroll. Además, si DevExtreme conserva la instancia previa en memoria al pasar de una edición a un alta nueva, los controles pueden mostrar datos residuales o estados de validación anteriores.

**La Solución:**
1. Utiliza `useState` para el objeto `formData`: `const [formData, setFormData] = useState(...)`.
2. Actualiza `setFormData` y limpia la instancia interna de DevExtreme **únicamente** dentro del `useEffect` al abrir el modal (`isOpen` / `initialData`):
   ```tsx
   useEffect(() => {
       if (isOpen) {
           const nextData = initialData ? { ...initialData } : { ...emptyDefaults };
           setFormData(nextData);

           // Garantiza la limpieza profunda de la instancia interna de DevExtreme Form
           setTimeout(() => {
               const formInstance = formRef.current?.instance();
               if (formInstance) {
                   formInstance.option("formData", nextData);
                   if (typeof formInstance.reset === 'function') {
                       formInstance.reset();
                   }
                   formInstance.option("formData", nextData);
               }
           }, 0);
       }
   }, [isOpen, initialData]);
   ```
3. **No** incluyas `onFieldDataChanged` ni ejecutes `setFormData` durante la escritura del usuario. DevExtreme mutará el objeto `formData` directamente en memoria al escribir, evitando re-renderizados de React, garantizando foco ininterrumpido y manteniendo la barra de scroll inmóvil.
4. **Regla de Cierre en el Componente Padre:** En el padre, pasa `onClose={() => setIsModalOpen(false)}` y ejecuta la limpieza del estado del registro seleccionado **únicamente** en `onHidden={() => setSelectedEntity(null)}`. Nunca limpies `selectedEntity` dentro de `onClose` para evitar que `initialData` cambie a `null` mientras la animación de salida está en curso.

---

> **Resumen de Oro**: Minimiza al máximo las llamadas a `setState` que estén atadas al modal principal y que se deriven de interacciones con el formulario interno. Asigna `setFormData` únicamente al abrir el modal en `useEffect` combinándolo con la re-asignación de la opción de datos en la instancia de DevExtreme (`formInstance.option("formData", nextData)`), sin usar `onFieldDataChanged` en la escritura. Deja que DevExtreme mute el objeto subyacente e interactúa con sus métodos nativos `.updateData()` y `.option()` a través de sus referencias (`useRef`). Al manipular arreglos hijos, muta el objeto en lugar (`in-place`) para preservar la referencia principal de `formData`, utiliza `key={groupKey}` en sub-formularios borradores para limpiarlos sin alertas de error falsas, memoiza el nodo JSX de `<Form>` con `useMemo` para aislarlo de cambios de estado en botones/cabecera, asegura siempre refrescar la geometría del `<Popup>` con `.repaint()` en el evento `onShown`, y pospone estrictamente la limpieza de `selectedEntity(null)` al evento `onHidden` en el padre para evitar saltos visuales o desincronización de `initialData` durante la animación de cierre.

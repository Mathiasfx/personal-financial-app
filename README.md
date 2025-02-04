
# Finanzas App

## Descripción del Proyecto

**Finanzas App** es una aplicación web desarrollada con **React** y **Next.js 14**, que utiliza **Firebase** para la gestión de datos. Su principal objetivo es ayudar a los usuarios a gestionar sus finanzas personales al recopilar información sobre ingresos, egresos, gastos hormiga, ahorros e inversiones. Este proyecto fue creado como un requerimiento personal y una forma de aportar una ¡herramienta para la comunidad!.

---

## Características

- **Registro de ingresos y egresos**: Permite registrar y categorizar ingresos y gastos mensuales.
- **Seguimiento de gastos hormiga**: Identifica y monitorea pequeños gastos diarios.
- **Gestor de ahorro**: Facilita el registro de objetivos de ahorro y su seguimiento.
- **Inversiones**: Ayuda a organizar y visualizar datos relacionados con inversiones.
- **Interfaz intuitiva**: Diseño simple y fácil de usar.
- **Autenticación**: Implementación de Firebase Authentication para el acceso seguro.
- **Base de datos en tiempo real**: Uso de Firestore para la gestión de datos en tiempo real.

---

## Tecnologías Utilizadas

- **Frontend**: React, Next.js 14
- **Backend**: API Routes de Next.js
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Authentication
- **Estilado**: CSS Modules / Tailwind CSS 
- **Despliegue**: Vercel

---

## Instalación y Configuración

### Requisitos previos

- Node.js v18 o superior
- pnpm o yarn

### Instrucciones

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu_usuario/finanzas-app.git
   cd finanzas-app
   ```

2. Instala las dependencias:
   ```bash
   pnpm install
   # o
   yarn install
   ```

3. Configura las variables de entorno:
   - Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:
     ```plaintext
     NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
     NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
     NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
     ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   # o
   yarn dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

5. (Opcional) Realiza el despliegue en Vercel:
   - Conecta tu repositorio en [Vercel](https://vercel.com/).
   - Configura las mismas variables de entorno en el panel de Vercel.

---

## Estructura del Proyecto

```
finanzas-app/
├── public/             # Archivos estáticos
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/          # Páginas de Next.js
│   ├── lib/            # Configuración y utilidades (Firebase, etc.)
│   ├── styles/         # Estilos CSS
│   └── context/        # Contexto de React (estado global)
├── .env.local          # Variables de entorno
├── package.json        # Dependencias del proyecto
└── README.md           # Documentación
```

---

## Uso de la Aplicación

1. **Autenticación**: Regístrate o inicia sesión con tu cuenta.
2. **Registrar Ingresos y Egresos**: Ve al panel principal y agrega tus transacciones.
3. **Gastos Hormiga**: Usa la categoria correspondiente para identificar y monitorear estos gastos.
4. **Ahorros e Inversiones**: Configura tus objetivos de ahorro y registra datos sobre tus inversiones.


---

## Futuras Mejoras

- Implementación de graficos y reportes.
- Análisis predictivo de finanzas.
- Multiidioma.

---

## Contribuciones

Este proyecto es personal y no acepta contribuciones externas en este momento. Sin embargo, si tienes sugerencias o encuentras errores, no dudes en abrir un issue en el repositorio.

---

## Autor

**Mathias**  
Frontend Developer & Game Developer  
[LinkedIn](https://www.linkedin.com/in/mathias-pereira/) | [GitHub](https://github.com/Mathiasfx)

---

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

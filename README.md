# Service Desk - Sistema de Gestión de Incidentes

## Setup del Proyecto

### Backend (.NET Core)

1. **Navegar a la carpeta Backend:**
   ```bash
   cd Backend
   ```

2. **Crear la base de datos:**
   - Ejecutar el script `database.sql` en SQL Server
   - Actualizar la connection string en `appsettings.json` si es necesario

3. **Restaurar dependencias:**
   ```bash
   dotnet restore
   ```

4. **Ejecutar migraciones (si las hay):**
   ```bash
   dotnet ef database update
   ```

5. **Ejecutar el servidor:**
   ```bash
   dotnet run --project ServiceDesk.API
   ```

El API estará disponible en `http://localhost:5000`

### Frontend (React)

1. **Navegar a la carpeta Frontend:**
   ```bash
   cd Frontend
   ```

2. **Instalar dependencias (si no están instaladas):**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

El frontend estará disponible en `http://localhost:5173`

## Estructura del Proyecto

```
Service Desk/
├── Backend/
│   ├── ServiceDesk.sln
│   ├── ServiceDesk.API/
│   │   ├── Controllers/
│   │   ├── Program.cs
│   │   └── appsettings.json
│   ├── ServiceDesk.Models/
│   ├── ServiceDesk.Data/
│   └── database.sql
└── Frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── context/
    │   ├── styles/
    │   ├── App.tsx
    │   └── App.css
    ├── package.json
    └── vite.config.ts
```

## Credenciales de Prueba

Por favor crear un usuario de prueba registrándose en la aplicación.

## Features Sprint 1

✅ Autenticación con JWT
✅ Crear tickets
✅ Ver mis tickets
✅ Ver todos los tickets (Soporte)
✅ Actualizar estado de tickets
✅ Categorizar tickets
✅ Detalles de tickets

## Tecnologías

- Backend: .NET Core 10, Entity Framework Core, JWT
- Frontend: React 18, TypeScript, React Router v6, Axios, Material-UI
- BD: SQL Server Express

## Notas Importantes

- El JWT expira en 24 horas (configurable en appsettings.json)
- Las contraseñas se hashean con SHA256
- CORS habilitado para desarrollo en cualquier origen

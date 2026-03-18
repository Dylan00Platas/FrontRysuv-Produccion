# File Tree: FrontRysuv-Produccion

**Generated:** 3/17/2026, 7:58:11 PM
**Root Path:** `c:\Users\fofor\Desktop\Servicio\Proyecto\Frontend\FrontRysuv-Produccion`

```
├── 📁 .agents
│   └── 📁 react-doctor
│       ├── 📝 AGENTS.md
│       └── 📝 SKILL.md
├── 📁 .vite
│   └── 📁 deps
│       ├── ⚙️ _metadata.json
│       └── ⚙️ package.json
├── 📁 public
│   ├── 📁 recursos
│   │   ├── 🖼️ Logo.png
│   │   └── 🖼️ fondo.jpg
│   ├── 📕 CedulaInternaEditable.pdf
│   ├── 📕 CedulaResultadosEditable.pdf
│   ├── 🖼️ Firma_AVC.png
│   ├── 📄 gill.TTF
│   ├── 🖼️ logo rys.svg
│   ├── 🖼️ logo1.svg
│   ├── 📕 oficioEditable.pdf
│   ├── 📕 oficioEditable2.pdf
│   ├── 📕 oficioEditable3.pdf
│   ├── 📕 oficioEditable4.pdf
│   ├── 📕 oficio_editable _final2.pdf
│   └── 📕 plantilla_editable_resultados3.pdf
├── 📁 src
│   ├── 📁 assets
│   │   ├── 🖼️ RyS.svg
│   │   └── 🖼️ uvBlanco.png
│   ├── 📁 components
│   │   ├── 📁 Alert
│   │   │   ├── 📁 Floating
│   │   │   │   └── 📄 Toast.tsx
│   │   │   └── 📁 OnBody
│   │   │       ├── 📄 AlertBanner.tsx
│   │   │       └── 📄 AlertBannerProps.ts
│   │   └── 📁 InputField
│   │       ├── 📄 InputField.tsx
│   │       └── 📄 InputFieldProps.ts
│   ├── 📁 features
│   │   ├── 📁 agendas
│   │   │   ├── 🎨 Agenda.css
│   │   │   └── 📄 Agenda.tsx
│   │   ├── 📁 cedulas
│   │   │   ├── 🎨 Cedulas.css
│   │   │   ├── 📄 Cedulas.tsx
│   │   │   ├── 🎨 CrearCedulaInterna.css
│   │   │   ├── 📄 CrearCedulaInterna.tsx
│   │   │   ├── 🎨 CrearConstancia.css
│   │   │   └── 📄 CrearConstancia.tsx
│   │   ├── 📁 no-beneficiados
│   │   │   ├── 🎨 CandidatoNoBeneficiado.css
│   │   │   ├── 📄 CandidatoNoBeneficiado.tsx
│   │   │   ├── 🎨 NoBeneficiados.css
│   │   │   └── 📄 NoBeneficiados.tsx
│   │   ├── 📁 oficios
│   │   │   ├── 📄 GenerarOficio.tsx
│   │   │   ├── 📄 VerDetallesOficio.tsx
│   │   │   └── 📄 VerOficios.tsx
│   │   ├── 📁 panorama
│   │   │   ├── 🎨 Panorama.css
│   │   │   └── 📄 Panorama.tsx
│   │   ├── 📁 procesos
│   │   │   ├── 🎨 Evaluacion.css
│   │   │   ├── 📄 Evaluacion.tsx
│   │   │   ├── 🎨 Procesos.css
│   │   │   └── 📄 Procesos.tsx
│   │   ├── 📁 seguimiento-hermes
│   │   │   ├── 🎨 SeguimientoHermes.css
│   │   │   └── 📄 SeguimientoHermes.jsx
│   │   ├── 📁 solicitudes
│   │   │   ├── 🎨 AsignarSolicitud.css
│   │   │   ├── 📄 AsignarSolicitud.tsx
│   │   │   ├── 🎨 IniciarSolicitud.css
│   │   │   ├── 📄 IniciarSolicitud.jsx
│   │   │   ├── 🎨 Solicitudes.css
│   │   │   └── 📄 Solicitudes.jsx
│   │   └── 📁 usuarios
│   │       ├── 🎨 CrearUsuario.css
│   │       ├── 📄 CrearUsuario.jsx
│   │       ├── 🎨 EditarUsuario.css
│   │       ├── 📄 EditarUsuario.jsx
│   │       ├── 🎨 Usuarios.css
│   │       └── 📄 Usuarios.jsx
│   ├── 📁 hooks
│   │   ├── 📄 UseCedulasFiltradas.ts
│   │   ├── 📄 useAuthToken.ts
│   │   ├── 📄 useCedulaTipos.ts
│   │   ├── 📄 useCedulas.ts
│   │   ├── 📄 useCookie.ts
│   │   ├── 📄 useDependenciaById.ts
│   │   ├── 📄 useDependencias.ts
│   │   ├── 📄 useProcesoTipos.ts
│   │   ├── 📄 useProcesosNoBeneficiados.ts
│   │   ├── 📄 useToast.ts
│   │   └── 📄 useUser.ts
│   ├── 📁 interfaces
│   │   ├── 📁 auth
│   │   │   └── 📄 CurrentUser.ts
│   │   ├── 📁 http
│   │   │   ├── 📄 Request.ts
│   │   │   └── 📄 Response.ts
│   │   ├── 📁 oficios
│   │   │   └── 📄 DatosOficio.ts
│   │   ├── 📄 GettingData.ts
│   │   └── 📄 LabelValue.ts
│   ├── 📁 layout
│   │   ├── 📁 main-layout
│   │   │   └── 📄 main-layout.tsx
│   │   ├── 📁 main-menu
│   │   │   ├── 🎨 MainMenu.css
│   │   │   └── 📄 MainMenu.tsx
│   │   ├── 📁 sidebar
│   │   │   ├── 🎨 Sidebar.css
│   │   │   └── 📄 Sidebar.tsx
│   │   └── 📄 PageTransition.jsx
│   ├── 📁 pages
│   │   └── 📁 login
│   │       └── 📄 Login.tsx
│   ├── 📁 schemas
│   │   ├── 📁 acceso
│   │   │   ├── 📄 GetTipoAccesoUsuario.ts
│   │   │   ├── 📄 GetUsuario.ts
│   │   │   ├── 📄 PostLogin.ts
│   │   │   └── 📄 PostUser.ts
│   │   ├── 📁 catalogos
│   │   │   ├── 📄 GetClasificacionCedula.ts
│   │   │   ├── 📄 GetDependencia.ts
│   │   │   ├── 📄 GetStatesContractingProcess.ts
│   │   │   ├── 📄 GetTemporaryPermanent.ts
│   │   │   ├── 📄 GetTipoCedula.ts
│   │   │   ├── 📄 GetTipoPersonal.ts
│   │   │   └── 📄 GetTipoProceso.ts
│   │   ├── 📁 cedulas
│   │   │   ├── 📄 GetCedula.ts
│   │   │   ├── 📄 GetCompetencia.ts
│   │   │   ├── 📄 GetResultadoCedula.ts
│   │   │   ├── 📄 GetResultadoCompetenciaCedula.ts
│   │   │   ├── 📄 PostCedula.ts
│   │   │   ├── 📄 PostResultadoCedula.ts
│   │   │   ├── 📄 PutCedula.ts
│   │   │   └── 📄 PutResultadoCedula.ts
│   │   ├── 📁 cedulas-externas
│   │   │   ├── 📄 GetCedulaExterna.ts
│   │   │   └── 📄 PostCedulaExterna.ts
│   │   ├── 📁 control-versiones
│   │   │   ├── 📄 GetControlVersion.ts
│   │   │   └── 📄 PostControlVersion.ts
│   │   └── 📁 procesos-contratacion
│   │       ├── 📄 GetOficioProcesoContratacion.ts
│   │       ├── 📄 GetProcesoAnalista.ts
│   │       ├── 📄 GetProcesoContratacion.ts
│   │       ├── 📄 GetSeguimientoHermes.ts
│   │       ├── 📄 PostOficioProcesoContratacion.ts
│   │       ├── 📄 PostProcesoContratacion.ts
│   │       ├── 📄 PostSeguimientoHermes.ts
│   │       └── 📄 PutProcesoContratacion.ts
│   ├── 📁 services
│   │   ├── 📁 connection
│   │   │   ├── 📄 APIClient.ts
│   │   │   └── 📄 APIError.ts
│   │   ├── 📄 AccesoService.ts
│   │   ├── 📄 AuthService.ts
│   │   ├── 📄 CatalogosNoseDonde.ts
│   │   ├── 📄 CatalogosService.ts
│   │   ├── 📄 CedulaService.ts
│   │   └── 📄 ProcesoContratacionService.ts
│   ├── 📁 utils
│   │   ├── 📁 features
│   │   │   ├── 📄 Agendas.ts
│   │   │   ├── 📄 Cedulas.ts
│   │   │   └── 📄 Cedulas.tsx
│   │   ├── 📄 Constants.ts
│   │   ├── 📄 EncryptData.ts
│   │   ├── 📄 ManageFiles.ts
│   │   ├── 📄 UserContext.tsx
│   │   ├── 📄 UserProvider.tsx
│   │   └── 📄 utils.ts
│   ├── 🎨 App.css
│   ├── 📄 App.tsx
│   ├── 📄 AppRoutes.tsx
│   ├── ⚙️ builder.config.json
│   ├── 🎨 index.css
│   └── 📄 main.tsx
├── 📁 ssl
│   ├── 📄 server.crt
│   └── 📄 server.key
├── ⚙️ .gitattributes
├── ⚙️ .gitignore
├── 📝 README.md
├── 📄 eslint.config.js
├── 🌐 index.html
├── ⚙️ jsconfig.json
├── ⚙️ package.json
├── ⚙️ pnpm-lock.yaml
├── 📄 tmp_check.txt
├── ⚙️ tsconfig.json
├── 📄 users-pass.txt
├── 📄 vite-env.d.ts
└── 📄 vite.config.ts
```

---
*Generated by FileTree Pro Extension*
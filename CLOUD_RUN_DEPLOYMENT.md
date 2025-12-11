# ☁️ Guía de Deployment: Google Cloud Run

## 🎯 **Objetivo**
Auto-deploy de la aplicación cada vez que hagas `git push` a la rama `main`.

---

## 🔧 **Parte 1: Configuración GCP (Una sola vez)**

### **1.1 Crear Proyecto GCP**
1. Ve a: [Google Cloud Console](https://console.cloud.google.com/)
2. Crea nuevo proyecto
3. **Nombre**: `ai-dev-tools-coding-interview`
4. **Copia el Project ID**

### **1.2 Habilitar APIs necesarias**
En `APIs & Services` → `Library`:
- ✅ Cloud Run API
- ✅ Artifact Registry API
- ✅ Cloud Build API
- ✅ Cloud Resource Manager API

### **1.3 Crear Service Account**
1. `IAM & Admin` → `Service Accounts` → `Create Service Account`
2. **Name**: `github-actions-deploy`
3. **Description**: `GitHub Actions deployment service account`
4. Crea y continúa

### **1.4 Asignar permisos**
1. Creado el service account → `Permissions` → `Grant Access`
2. Agrega estos roles:
   - ✅ `Cloud Run Admin`
   - ✅ `Artifact Registry Writer`
   - ✅ `Cloud Build Builder`
   - ✅ `Storage Object Viewer`

### **1.5 Crear Artifact Registry**
1. `Artifact Registry` → `Repositories` → `Create Repository`
2. **Repository name**: `cloud-run-source-deploy`
3. **Format**: `Docker`
4. **Location**: `us-central1` (o tu región preferida)
5. Crea

### **1.6 Generar clave JSON**
1. Service account creado → `Keys` → `Add Key` → `Create new key`
2. **Type**: `JSON`
3. **Descarga el archivo** - guárdalo seguro

---

## 🔐 **Parte 2: Configuración GitHub (Una sola vez)**

### **2.1 Agregar Secrets**
1. Ve a tu repositorio → `Settings` → `Secrets and variables` → `Actions`
2. Agrega estos secrets:

```
GCP_PROJECT_ID = ai-dev-tools-coding-interview
GCP_SA_KEY = (pegar contenido completo del JSON)
GCP_REGION = us-central1
CLOUD_RUN_SERVICE_NAME = coding-interview-platform
```

### **2.2 Configurar permisos de Actions**
1. `Settings` → `Actions` → `General`
2. Marca:
   - ✅ `Allow GitHub Actions to create and approve pull requests`
   - ✅ `Allow GitHub Actions to run approve workflows`
   - ✅ `Read and write permissions`

---

## 🚀 **Parte 3: Primer Deployment**

### **3.1 Commit los cambios de deployment**
```bash
git add .github/workflows/deploy-cloud-run.yml
git add CLOUD_RUN_DEPLOYMENT.md
git commit -m "add Cloud Run deployment configuration"
git push origin main
```

### **3.2 Verificar deployment**
1. Ve a `GitHub repo` → `Actions`
2. El workflow `Deploy to Cloud Run` se ejecutará automáticamente
3. **Si todo va bien**: verás la URL en el log del paso "Show URL"

### **3.3 Probar la aplicación**
- **URL**: `https://coding-interview-platform-ai-dev-tools-coding-interview.run.app`
- **Health Check**: `https://.../health`
- **Funciona igual que local**: WebSockets, real-time collaboration, etc.

---

## 🔄 **Flujo automático (después del primer setup)**

### **Cualquier cambio futuro:**
```bash
# Haces cambios en el código
git add .
git commit -m "fix: mejorar UX de colaboración"
git push origin main

# 🔥 Automáticamente:
# 1. GitHub Actions se dispara
# 2. Build Docker image
# 3. Push a Artifact Registry
# 4. Deploy a Cloud Run
# 5. App actualizada en ~2-3 minutos
```

---

## 🎯 **Ventajas de este setup**

### **✅ Funciona igual que local:**
- WebSockets (Socket.io) ✅
- Real-time collaboration ✅
- Multi-language support ✅
- Safe code execution ✅

### **✅ Beneficios Cloud Run:**
- **Paga solo por uso**: Free tier generoso
- **Autoscaling**: 0 → N instancias automáticamente
- **HTTPS** incluido
- **Global CDNs** de Google

### **✅ GitHub Actions:**
- **CI/CD completo**
- **Automático**: `git push = deploy`
- **Rollback fácil**: con commits específicos
- **Logs y monitoreo**

---

## 📊 **Monitoreo**

### **Google Cloud Console:**
- **Cloud Run**: Métricas, logs, scaling
- **Artifact Registry**: Docker images
- **Cloud Build**: Build history

### **GitHub:**
- **Actions Tab**: Workflow status y logs
- **Commits**: Deployment history

---

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **Build falla**:
   - Revisa secrets en GitHub
   - Verifica permisos del service account
   - Check logs en GitHub Actions

2. **Deployment falla**:
   - Revisa API key de GCP
   - Verifica que Artifact Registry exista
   - Check region settings

3. **WebSockets no funcionan**:
   - Verifica CORS configuration
   - Revisa health check path
   - Check logs en Cloud Run

### **Comandos útiles:**
```bash
# Ver logs en Cloud Run
gcloud logging read "resource.type=cloud_run_revision" --limit 50 --format=json

# Ver servicio details
gcloud run services describe coding-interview-platform --region=us-central1

# Trigger manual deployment
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

---

## 💰 **Costos Estimados**

### **Free tier mensual:**
- 2M requests
- 360,000 vCPU-seconds
- 1GB network egress
- 1GB storage Artifact Registry

### **Para tu app (estimado):**
- **100 usuarios/día**: ~$5-10/mes
- **1,000 usuarios/día**: ~$30-50/mes
- **10,000 usuarios/día**: ~$200-300/mes

---

## 🎯 **Next Steps**

1. ✅ **Configurar GCP project**
2. ✅ **Crear service account y API key**
3. ✅ **Setup secrets en GitHub**
4. ✅ **Primer deployment**
5. 🎉 **App funcionando en producción!**

¡Listo para tener tu coding interview platform en Cloud Run con auto-deploy! 🚀

# Configuración de Email con Resend

## 📧 **Configuración Actual**

**API Key:** Configurada en `.env.local` y Vercel  
**Dominio:** psicosnap.com  
**Remitente:** noreply@psicosnap.com  
**Reply-To:** soporte@psicosnap.com

---

## ✅ **Pasos para Configurar Dominio en Resend**

### **1. Crear Cuenta en Resend**
```
1. Ir a: https://resend.com/signup
2. Registrarse con tu email
3. Verificar cuenta
```

### **2. Añadir Dominio psicosnap.com**
```
1. Dashboard → Domains → Add Domain
2. Escribir: psicosnap.com
3. Click "Add Domain"
```

### **3. Configurar DNS Records**

Resend te dará **3 registros DNS** que debes añadir:

#### **Si usas Vercel DNS:**
```
1. Ir a: vercel.com → psicosnap.com → Settings → Domains → DNS
2. Añadir cada registro que Resend te dio:
   
   Registro 1 (SPF):
   - Type: TXT
   - Name: @
   - Value: v=spf1 include:_spf.resend.com ~all
   
   Registro 2 (DKIM):
   - Type: TXT
   - Name: resend._domainkey
   - Value: [valor proporcionado por Resend]
   
   Registro 3 (DMARC):
   - Type: TXT
   - Name: _dmarc
   - Value: v=DMARC1; p=none;
```

#### **Si usas otro proveedor (Namecheap, GoDaddy, etc.):**
```
1. Ir al panel de DNS de tu registrador
2. Añadir los 3 registros TXT que Resend te dio
3. Guardar cambios
```

### **4. Verificar Dominio**
```
1. Volver a Resend Dashboard
2. Click "Verify Domain"
3. Esperar 5-10 minutos (propagación DNS)
4. Refrescar página hasta ver ✅ "Verified"
```

---

## 📬 **Crear Alias: soporte@psicosnap.com**

Resend **no crea buzones de correo reales**. Es solo para envío.

Para recibir emails en `soporte@psicosnap.com`:

### **Opción 1: Forward en Vercel (Gratis)**
```
1. Vercel → Domains → psicosnap.com → Email Forwarding
2. Add Forward:
   - From: soporte@psicosnap.com
   - To: tu-email-personal@gmail.com
3. Guardar
```

### **Opción 2: Zoho Mail (Gratis, 5 usuarios)**
```
1. Ir a: zoho.com/mail
2. Crear cuenta gratuita
3. Añadir dominio: psicosnap.com
4. Configurar MX records (Zoho te dará las instrucciones)
5. Crear buzón: soporte@psicosnap.com
```

### **Opción 3: Google Workspace ($6/mes)**
```
1. Ir a: workspace.google.com
2. Registrar psicosnap.com
3. Configurar MX records
4. Crear buzón: soporte@psicosnap.com
5. Acceder vía Gmail
```

### **Opción 4: Solo envío (sin recepción)**
```
Si no necesitas recibir emails en soporte@psicosnap.com:
- Puedes usar reply-to: tu-email-personal@gmail.com
- O simplemente dejar soporte@psicosnap.com como decorativo
```

---

## 🔧 **Configuración en Vercel (Producción)**

```
1. Vercel → Project psicosnap → Settings → Environment Variables
2. Añadir:
   - Key: RESEND_API_KEY
   - Value: re_Fudj9Qkm_EJkikDy1HGxozt9LGRRmHSsZ
   - Environments: Production, Preview, Development
3. Redeploy para aplicar cambios
```

---

## 🧪 **Testing**

### **Probar envío de email:**
```
1. Login en PsicoSnap
2. Ir a: Dashboard → Pacientes
3. Seleccionar paciente con email
4. Click "Enviar test"
5. Seleccionar cuestionario
6. Click "Generar enlace"
7. Verificar en Resend Dashboard → Emails que se envió
8. Verificar en bandeja del paciente
```

### **Verificar remitente:**
```
El email debe aparecer como:
From: PsicoSnap <noreply@psicosnap.com>
Reply-To: soporte@psicosnap.com
```

---

## 📊 **Límites del Plan Gratuito**

✅ **Incluido gratis:**
- 3,000 emails/mes
- 100 emails/día
- Dominio personalizado
- API completa
- Analytics básico

📈 **Si necesitas más:**
- $20/mes: 50,000 emails
- $80/mes: 1,000,000 emails

---

## ⚠️ **Notas Importantes**

1. **Dominio debe estar verificado** antes de enviar emails
2. **noreply@psicosnap.com** NO puede recibir emails (solo envío)
3. **soporte@psicosnap.com** necesita configuración adicional (ver arriba)
4. **Primer email** puede tardar más (warmup de dominio)
5. **Evita spam**: Solo envía a pacientes reales
6. **Deliverability**: Monitorea bounces en Resend Dashboard

---

## 📞 **Soporte**

- **Resend Docs**: https://resend.com/docs
- **Resend Discord**: https://resend.com/discord
- **Support**: support@resend.com

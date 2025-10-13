# 🔧 Troubleshooting Autenticazione VERA

## ❌ Errore: "Invalid login credentials"

### Causa Comune

Questo errore si verifica quando:
1. ❌ **Stai cercando di fare login senza esserti registrato prima**
2. ❌ Email o password sono errate
3. ❌ Ti sei registrato ma non hai confermato l'email

### ✅ Soluzione Step-by-Step

#### Step 1: Registrati Prima di Fare Login

1. Apri l'app VERA
2. Clicca sulla tab **"Registrati"**
3. Compila il form:
   - Nome: `Mario Rossi`
   - Email: `mario.rossi@example.com`
   - Password: `password123` (min 8 caratteri)
   - Conferma Password: `password123`
4. Clicca **"Crea Account"**
5. ✅ Vedrai: "Registrazione completata! Controlla la tua email..."

#### Step 2: Conferma Email (IMPORTANTE!)

**NOTA:** Supabase richiede conferma email per sicurezza.

**Opzione A: Email di Conferma (Produzione)**
1. Apri la tua casella email
2. Cerca email da Supabase con subject "Confirm your email"
3. Clicca sul link di conferma
4. ✅ Vedrai messaggio "Email confermata"

**Opzione B: Disabilita Conferma Email (Solo Sviluppo)**

Se non hai configurato un SMTP e vuoi testare subito:

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai su **Authentication** → **Settings**
4. Scorri fino a **"Email Auth"**
5. **Disabilita** "Enable email confirmations"
6. Clicca **Save**
7. ✅ Ora puoi fare login subito dopo la registrazione

#### Step 3: Fai Login

1. Torna all'app VERA
2. Clicca sulla tab **"Accedi"**
3. Inserisci la stessa email e password usate nella registrazione
4. Clicca **"Accedi"**
5. ✅ Dovresti accedere alla dashboard

---

## 🔍 Debug: Verifica Utente Creato

### Controllo via Supabase Dashboard

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona il tuo progetto
3. Vai su **Authentication** → **Users**
4. Dovresti vedere l'utente registrato:

```
Email: mario.rossi@example.com
Confirmed At: (data se confermato, altrimenti null)
Last Sign In: (data ultimo login)
```

Se l'utente **NON** appare nella lista:
- ❌ La registrazione non è andata a buon fine
- Controlla console browser per errori
- Verifica che `.env` contenga credenziali corrette

---

## 🧪 Test Completo Autenticazione

### Test 1: Registrazione

```bash
# Console Browser (F12)
```

**Esegui in Console:**
```javascript
// Verifica che Supabase sia raggiungibile
fetch('https://YOUR_PROJECT.supabase.co/rest/v1/')
  .then(r => console.log('✅ Supabase raggiungibile', r.status))
  .catch(e => console.error('❌ Supabase non raggiungibile', e))
```

**Registrazione:**
1. Compila form registrazione
2. Clicca "Crea Account"
3. Verifica in Console:
   ```
   ✅ Registrazione completata!
   ```

### Test 2: Conferma Email

**Se email confirmations ABILITATA:**
- Controlla email
- Clicca link conferma
- Vai su Supabase Dashboard → Users
- Verifica colonna "Confirmed At" non sia null

**Se email confirmations DISABILITATA:**
- Utente è confermato automaticamente
- Puoi fare login subito

### Test 3: Login

1. Compila form login con stessa email/password
2. Clicca "Accedi"
3. Verifica in Console:
   ```
   ✅ Login riuscito
   ✅ Dispositivo registrato: [nome device]
   ```

---

## 🔑 Verifica Credenziali Supabase

### File `.env`

Controlla che esista e contenga:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Come Trovare le Credenziali

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona progetto
3. Vai su **Settings** → **API**
4. Copia:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

### Verifica in App

Nel browser, apri Console e digita:

```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
```

Se vedi `undefined`:
- ❌ `.env` non configurato correttamente
- ❌ Riavvia server dev: `npm run dev`

---

## 📧 Setup Email (Opzionale ma Consigliato)

### Per Testing Locale: Disabilita Conferma

Vedi **Step 2 → Opzione B** sopra

### Per Produzione: Configura SMTP

1. Vai su Supabase Dashboard → **Authentication** → **Settings**
2. Scorri fino a **"SMTP Settings"**
3. Abilita "Enable Custom SMTP"
4. Configura:
   ```
   Host: smtp.gmail.com (o tuo provider)
   Port: 587
   Username: tua-email@gmail.com
   Password: tua-password-app
   Sender Email: tua-email@gmail.com
   Sender Name: VERA App
   ```
5. Clicca **Save**

**Gmail App Password:**
1. Vai su [Google Account Security](https://myaccount.google.com/security)
2. Abilita "2-Step Verification"
3. Genera "App Password"
4. Usa quella password nello SMTP

---

## 🔐 Policies RLS (Row Level Security)

### Verifica Policies Attive

1. Vai su Supabase Dashboard → **Database** → **Tables**
2. Seleziona tabella `devices` o `performance_data`
3. Click su "Policies"
4. Dovresti vedere:
   ```
   ✅ Users can view own devices
   ✅ Users can insert own devices
   ✅ Users can update own devices
   ✅ Users can delete own devices
   ```

### Se Policies Mancanti

Esegui lo script SQL completo:

1. Vai su **SQL Editor**
2. Copia tutto il contenuto di `/database-schema-auth.sql`
3. Incolla e clicca **Run**

---

## 🧩 Errori Comuni e Soluzioni

### 1. "User already registered"

**Causa:** Stai cercando di registrare un'email già esistente

**Soluzione:**
- Usa la tab "Accedi" invece di "Registrati"
- Se hai dimenticato la password, usa "Password dimenticata"
- Oppure registra un'altra email

### 2. "Email not confirmed"

**Causa:** Hai registrato ma non confermato l'email

**Soluzione:**
- Controlla inbox e spam per email di Supabase
- Clicca link di conferma
- Oppure disabilita conferma email (solo dev)

### 3. "Invalid API key"

**Causa:** Credenziali Supabase errate in `.env`

**Soluzione:**
- Verifica `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- Copia da Supabase Dashboard → Settings → API
- Riavvia: `npm run dev`

### 4. "Failed to fetch"

**Causa:** Problema di rete o URL Supabase errato

**Soluzione:**
- Verifica connessione internet
- Controlla che URL in `.env` sia corretto
- Prova a fare ping: `curl https://xxx.supabase.co`

### 5. Dispositivo non registrato

**Causa:** Hook `useDeviceManager` non si avvia

**Soluzione:**
- Verifica che tabella `devices` esista
- Controlla console per errori
- Verifica policies RLS su tabella `devices`

---

## 📊 Flow Completo Corretto

```
1. REGISTRAZIONE
   ├─ Apri app
   ├─ Tab "Registrati"
   ├─ Compila form (nome, email, password)
   ├─ Click "Crea Account"
   └─ ✅ Messaggio: "Controlla email..."

2. CONFERMA EMAIL (se abilitata)
   ├─ Apri email
   ├─ Click link di conferma
   └─ ✅ Email confermata

3. LOGIN
   ├─ Torna all'app
   ├─ Tab "Accedi"
   ├─ Inserisci email e password
   ├─ Click "Accedi"
   └─ ✅ Accesso alla dashboard

4. DEVICE AUTO-REGISTRATION
   ├─ App rileva dispositivo
   ├─ Registra su tabella devices
   ├─ Avvia heartbeat
   └─ ✅ Toast: "Dispositivo registrato"

5. MONITORING ATTIVO
   ├─ Dispositivo online
   ├─ Dati salvati con user_id + device_id
   └─ ✅ Dashboard funzionante
```

---

## 🆘 Ancora Problemi?

### Debug Avanzato

1. **Abilita log dettagliati:**
   ```typescript
   // In AuthContext.tsx, aggiungi console.log
   console.log('Auth state changed:', session?.user?.email)
   ```

2. **Test API diretto:**
   ```javascript
   // Console Browser
   const { createClient } = await import('./utils/supabase/client')
   const supabase = createClient()
   
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'test@example.com',
     password: 'password123'
   })
   
   console.log('Result:', data, error)
   ```

3. **Verifica tabelle:**
   ```sql
   -- SQL Editor Supabase
   SELECT * FROM auth.users;
   SELECT * FROM devices;
   SELECT * FROM performance_data;
   ```

### Contatta Supporto

Se nessuna soluzione funziona:

1. Esporta logs:
   - Console Browser (Ctrl+A → Copia)
   - Network tab (eventuali errori API)

2. Screenshot:
   - Messaggio errore nell'app
   - Supabase Dashboard → Users
   - Supabase Dashboard → Policies

3. Informazioni ambiente:
   - Browser e versione
   - Sistema operativo
   - Node.js version: `node --version`

---

## ✅ Checklist Finale

Prima di chiedere aiuto, verifica:

- [ ] File `.env` esiste e contiene credenziali corrette
- [ ] Server dev riavviato dopo modifica `.env`
- [ ] Supabase Dashboard mostra progetto attivo
- [ ] Tabelle `devices` e `performance_data` create
- [ ] Policies RLS abilitate
- [ ] Email confirmations disabilitata (per test) o email confermata
- [ ] Utente presente in Authentication → Users
- [ ] Nessun errore in Console Browser
- [ ] Provato registrazione + login con email nuova

---

## 🎯 Quick Fix: Reset Completo

Se tutto è rotto, ricomincia da zero:

```bash
# 1. Pulisci tutto
rm -rf node_modules
rm -rf .env

# 2. Reinstalla
npm install

# 3. Crea .env
echo "VITE_SUPABASE_URL=https://xxx.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=eyJ..." >> .env

# 4. Supabase: elimina progetto e ricrea
# Dashboard → Settings → General → Delete Project
# Crea nuovo progetto
# Esegui database-schema-auth.sql

# 5. Disabilita email confirmations
# Dashboard → Authentication → Settings
# Disable "Enable email confirmations"

# 6. Riavvia
npm run dev

# 7. Registrati con email fresca
# 8. Login subito (senza conferma email)
```

**Dovrebbe funzionare! 🎉**

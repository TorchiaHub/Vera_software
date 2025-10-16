# ⚡ Setup Autenticazione VERA - 5 Minuti

## 🎯 Per Testare Subito (Senza Email)

### Step 1: Disabilita Conferma Email su Supabase

1. Vai su [Supabase Dashboard](https://app.supabase.com)
2. Seleziona progetto VERA
3. **Authentication** → **Settings**
4. Cerca **"Email Auth"** → **"Enable email confirmations"**
5. **DISABILITA** questo toggle
6. Click **Save**

✅ Ora puoi fare login subito dopo registrazione!

---

### Step 2: Registrati nell'App

1. Apri app: `npm run dev`
2. Vedrai schermata Login
3. Click tab **"Registrati"**
4. Compila:
   ```
   Nome: Mario Rossi
   Email: test@example.com
   Password: password123
   Conferma: password123
   ```
5. Click **"Crea Account"**

✅ Messaggio: "Registrazione completata!"

---

### Step 3: Fai Login

1. Click tab **"Accedi"**
2. Inserisci:
   ```
   Email: test@example.com
   Password: password123
   ```
3. Click **"Accedi"**

✅ Accedi alla dashboard!
✅ Dispositivo registrato automaticamente!

---

## 🔧 Se Hai Già Disabilitato Email ma Errore Persiste

### Reset Utente e Riprova

1. Vai su Supabase Dashboard → **Authentication** → **Users**
2. Trova utente con email problematica
3. Click **3 dots** → **Delete user**
4. Torna all'app
5. Registrati di nuovo con la stessa email
6. Login

---

## 📧 Setup Email Conferma (Produzione)

### Opzione A: Gmail SMTP

1. Supabase Dashboard → **Authentication** → **Settings**
2. Scorri a **"SMTP Settings"**
3. Enable Custom SMTP
4. Configura:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: tua-email@gmail.com
   Password: [App Password - vedi sotto]
   Sender: tua-email@gmail.com
   ```

**Come ottenere Gmail App Password:**
1. [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"
3. Search "App Passwords"
4. Generate per "Mail"
5. Copia password (16 caratteri)
6. Incolla in SMTP Password

### Opzione B: Usa Supabase SMTP (Default)

Supabase ha SMTP built-in ma con limiti:
- 3 email/ora in free tier
- Sufficiente per testing

Non serve configurare nulla, funziona out-of-the-box.

---

## 🚨 Errori Comuni

### "Invalid login credentials"

**Causa:** Non ti sei registrato, o email/password errate

**Fix:** 
- Vai a tab "Registrati" prima
- Verifica email e password corrette
- Controlla che utente esista su Supabase Dashboard

### "Email not confirmed"

**Causa:** Conferma email abilitata ma non hai confermato

**Fix:**
- Disabilita conferma (vedi Step 1 sopra)
- Oppure controlla email e clicca link

### "User already registered"

**Causa:** Email già usata

**Fix:**
- Usa tab "Accedi" invece
- Oppure registra con email diversa

---

## ✅ Verifica Tutto OK

Dopo login, dovresti vedere in Console Browser (F12):

```
✅ Dispositivo registrato: Laptop Windows 11 (15 Gen)
✅ Device heartbeat avviato
📊 VERA: Dashboard caricata
```

E su Supabase Dashboard → **Database** → **devices**:

```
1 record con:
- user_id: [tuo id]
- device_name: Laptop Windows 11...
- last_sync: [ora corrente]
- is_active: true
```

---

## 🎉 Done!

Sei pronto per usare VERA con autenticazione completa!

**Next Steps:**
- Dashboard monitora prestazioni
- Dati salvati con user_id + device_id
- Multi-device support automatico
- RLS protegge i tuoi dati

**Goditi VERA! 🌱**

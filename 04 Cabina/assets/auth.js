/* CALIBRAR · Autenticación de entrada.
   Dos vías: Google Sign-In (requiere CABINA_GOOGLE_CLIENT_ID en config.js y
   abrir por http://localhost:8642 — Google no funciona sobre file://) o clave
   local (hash SHA-256, funciona siempre, incluso sin conexión).
   Qué protege y qué no, dicho honesto: esto es una puerta de acceso en el
   navegador. Detiene el acceso casual de terceros al instrumento y sus datos;
   no es cifrado de disco ni seguridad de servidor. Los datos nunca salen de
   este equipo. */

function autenticado() { return !!sessionStorage.getItem('cabina_auth'); }
function exigirLogin() {
  if (!autenticado()) {
    // Conserva la página y sus parámetros (p. ej. el modo ejemplo) a través del login
    const destino = location.pathname.split('/').pop() + location.search;
    window.location.replace('login.html?next=' + encodeURIComponent(destino));
  }
}
function destinoPostLogin() {
  const next = new URLSearchParams(location.search).get('next') || '';
  // Solo páginas locales de la cabina: nada de URLs externas
  return /^[\w.-]+\.html(\?.*)?$/.test(next) ? next : 'reunion.html';
}
function cerrarSesion() { sessionStorage.removeItem('cabina_auth'); window.location.replace('login.html'); }

async function sha256(txt) {
  // crypto.subtle solo existe en contextos seguros (https o localhost). Al entrar
  // por IP de red local (el iPhone) no está: se usa la implementación JS de respaldo.
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(txt));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return sha256js(txt);
}

/* SHA-256 puro en JS (FIPS 180-4) — mismo resultado que crypto.subtle. */
function sha256js(txt) {
  const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const bytes = new TextEncoder ? [...new TextEncoder().encode(txt)] : [...unescape(encodeURIComponent(txt))].map(c => c.charCodeAt(0));
  const l = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  for (let i = 7; i >= 0; i--) bytes.push((l / Math.pow(2, i * 8)) & 0xff);
  const rr = (x, n) => (x >>> n) | (x << (32 - n));
  const w = new Array(64);
  for (let p = 0; p < bytes.length; p += 64) {
    for (let i = 0; i < 16; i++)
      w[i] = (bytes[p + i * 4] << 24) | (bytes[p + i * 4 + 1] << 16) | (bytes[p + i * 4 + 2] << 8) | bytes[p + i * 4 + 3];
    for (let i = 16; i < 64; i++) {
      const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22);
      const mj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + mj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H = H.map((x, i) => (x + [a, b, c, d, e, f, g, h][i]) | 0);
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
}

/* — Clave local — */
async function loginClave() {
  const inp = document.getElementById('clave');
  const msg = document.getElementById('login-msg');
  const clave = inp.value;
  if (!clave) return;
  const hashGuardado = localStorage.getItem('cabina_clave_hash');
  let h;
  try { h = await sha256('cabina·' + clave); }
  catch (e) { msg.textContent = 'Error al procesar la clave: ' + e.message; return; }
  if (!hashGuardado) {
    if (clave.length < 6) { msg.textContent = 'La clave debe tener al menos 6 caracteres.'; return; }
    if (!confirm('Primera vez: ¿fijar esta clave como la clave de acceso de la Cabina en este equipo?')) return;
    localStorage.setItem('cabina_clave_hash', h);
    sessionStorage.setItem('cabina_auth', 'clave-local');
    window.location.replace(destinoPostLogin());
    return;
  }
  if (h === hashGuardado) {
    sessionStorage.setItem('cabina_auth', 'clave-local');
    window.location.replace(destinoPostLogin());
  } else {
    msg.textContent = 'Clave incorrecta.';
    inp.value = '';
  }
}

/* — Google Identity Services — */
function iniciarGoogle() {
  const cont = document.getElementById('g-btn');
  const msg = document.getElementById('login-msg');
  if (!CABINA_GOOGLE_CLIENT_ID) {
    document.getElementById('g-zona').innerHTML =
      '<p class="login-nota">Inicio con Google: pendiente de configurar el Client ID en <code>assets/config.js</code>. Mientras tanto, usa la clave local.</p>';
    return;
  }
  if (location.protocol === 'file:') {
    document.getElementById('g-zona').innerHTML =
      '<p class="login-nota">Google Sign-In no funciona abriendo el archivo directo. Abre la Cabina con «Iniciar Cabina.command» (localhost) o usa la clave local.</p>';
    return;
  }
  if (!(window.google && google.accounts)) { msg.textContent = 'No cargó el servicio de Google (¿sin conexión?). Usa la clave local.'; return; }
  google.accounts.id.initialize({
    client_id: CABINA_GOOGLE_CLIENT_ID,
    callback: (resp) => {
      try {
        const payload = JSON.parse(atob(resp.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        const email = (payload.email || '').toLowerCase();
        if (payload.aud !== CABINA_GOOGLE_CLIENT_ID) { msg.textContent = 'Token inválido.'; return; }
        if (!CABINA_CORREOS_PERMITIDOS.map(c => c.toLowerCase()).includes(email)) {
          msg.textContent = `La cuenta ${email} no está autorizada para entrar a Calibrar.`;
          return;
        }
        sessionStorage.setItem('cabina_auth', email);
        window.location.replace(destinoPostLogin());
      } catch { msg.textContent = 'No se pudo leer la credencial de Google.'; }
    }
  });
  google.accounts.id.renderButton(cont, { theme: 'filled_blue', size: 'large', text: 'signin_with', locale: 'es' });
}

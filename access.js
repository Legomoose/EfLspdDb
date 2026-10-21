// Browser-only convenience gate. This is NOT security for private information.
(function () {
  const key = 'everfall_access_code_v1';
  const sessionKey = 'everfall_unlocked';
  const gate = document.getElementById('accessGate');
  const form = document.getElementById('accessForm');
  const input = document.getElementById('accessInput');
  const hint = document.getElementById('accessHint');
  const reset = document.getElementById('resetAccessCode');
  if (!gate || !form || !input || !hint) return;
  const get = (store, k) => { try { return store.getItem(k); } catch { return null; } };
  const set = (store, k, v) => { try { store.setItem(k, v); return true; } catch { return false; } };
  const remove = (store, k) => { try { store.removeItem(k); } catch {} };
  function updateHint() {
    hint.textContent = get(localStorage, key)
      ? 'Enter your access code, or reset it below if you forgot it.'
      : 'Create an access code for this browser (at least 4 characters).';
  }
  updateHint();
  if (get(sessionStorage, sessionKey) === 'yes') gate.classList.add('hidden');
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const value = input.value;
    if (value.length < 4) { hint.textContent = 'Please enter at least 4 characters.'; return; }
    const existing = get(localStorage, key);
    if (existing && value !== existing) { hint.textContent = 'Incorrect code. Try again or use Reset below.'; return; }
    if (!existing && !set(localStorage, key, value)) {
      hint.textContent = 'Browser storage is unavailable. The local lock cannot save a code.';
      return;
    }
    set(sessionStorage, sessionKey, 'yes');
    gate.classList.add('hidden');
    input.value = '';
  });
  if (reset) reset.addEventListener('click', function () {
    if (!confirm('Reset only this browser’s access code? Your saved pins, cases and images will NOT be deleted.')) return;
    remove(localStorage, key);
    remove(sessionStorage, sessionKey);
    input.value = '';
    gate.classList.remove('hidden');
    updateHint();
    input.focus();
  });
})();

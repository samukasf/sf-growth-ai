(function () {
  const authMessage = () => $id('authMsg');
  const isRecoveryReturn = () => new URLSearchParams(location.search).get('mode') === 'recovery';

  function setVisible(id, visible) {
    const element = $id(id);
    if (element) element.classList.toggle('hidden', !visible);
  }

  function showAuthMessage(message, type = 'muted') {
    const box = authMessage();
    box.className = `notice ${type}`;
    box.textContent = message;
    box.classList.remove('hidden');
  }

  function clearAuthMessage() {
    const box = authMessage();
    box.textContent = '';
    box.className = 'notice muted hidden';
  }

  function friendlyAuthError(error) {
    const message = String(error?.message || error || '');
    if (/invalid login credentials/i.test(message)) {
      return 'E-mail ou palavra-passe incorretos. Se não se lembra da palavra-passe, use “Esqueci a palavra-passe”.';
    }
    if (/email not confirmed/i.test(message)) {
      return 'Confirme primeiro o e-mail da conta e tente novamente.';
    }
    if (/rate limit|too many requests/i.test(message)) {
      return 'Foram feitas muitas tentativas. Aguarde alguns minutos e tente novamente.';
    }
    if (/password should be at least/i.test(message)) {
      return 'A palavra-passe precisa ter pelo menos 8 caracteres.';
    }
    return message || 'Não foi possível concluir. Tente novamente.';
  }

  function recoveryRedirectUrl() {
    const url = new URL(location.href);
    url.pathname = '/future-me.html';
    url.search = '?mode=recovery';
    url.hash = '';
    return url.toString();
  }

  function cleanRecoveryUrl() {
    history.replaceState({}, document.title, '/future-me.html');
  }

  paintAuth = function () {
    const mode = authMode;
    const signup = mode === 'signup';
    const login = mode === 'login';
    const recover = mode === 'recover';
    const update = mode === 'update-password';

    setVisible('nameLabel', signup);
    setVisible('emailLabel', !update);
    setVisible('passwordLabel', !recover);
    setVisible('passwordConfirmLabel', update);
    setVisible('forgotPasswordBtn', login);
    setVisible('authSwitch', !update);

    $id('authTitle').textContent = signup ? 'Criar conta' : login ? 'Entrar' : recover ? 'Recuperar palavra-passe' : 'Definir nova palavra-passe';
    $id('authEy').textContent = signup ? 'Comece a construir' : login ? 'Bem-vindo de volta' : recover ? 'Recupere o acesso com segurança' : 'Crie uma nova palavra-passe';
    $id('authSubmit').textContent = signup ? 'Criar conta' : login ? 'Entrar' : recover ? 'Enviar link de recuperação' : 'Guardar nova palavra-passe';
    $id('authSwitch').textContent = signup ? 'Já tenho conta' : recover ? 'Voltar para entrar' : 'Criar nova conta';
    $id('authBack').textContent = update ? 'Cancelar recuperação' : recover ? 'Voltar' : 'Voltar ao início';
    $id('authPassword').autocomplete = login ? 'current-password' : 'new-password';
    $id('authPassword').minLength = update || signup ? 8 : 6;
    clearAuthMessage();
  };

  showAuth = function (mode) {
    authMode = mode;
    landing.style.display = 'none';
    app.style.display = 'none';
    auth.style.display = 'flex';
    paintAuth();
  };

  toggleAuth = function () {
    if (authMode === 'recover') authMode = 'login';
    else authMode = authMode === 'signup' ? 'login' : 'signup';
    paintAuth();
  };

  window.showPasswordRecovery = function () {
    const email = $id('authEmail').value.trim();
    authMode = 'recover';
    paintAuth();
    $id('authEmail').value = email;
    $id('authEmail').focus();
  };

  window.handleAuthBack = async function () {
    if (authMode === 'update-password' || isRecoveryReturn()) {
      await sb.auth.signOut();
      session = user = profile = null;
      cleanRecoveryUrl();
      showAuth('login');
      return;
    }
    if (authMode === 'recover') {
      authMode = 'login';
      paintAuth();
      return;
    }
    backLanding();
  };

  async function requestPasswordRecovery() {
    const emailInput = $id('authEmail');
    const email = emailInput.value.trim().toLowerCase();
    if (!email || !emailInput.checkValidity()) {
      showAuthMessage('Introduza um endereço de e-mail válido.', 'bad');
      emailInput.focus();
      return;
    }

    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: recoveryRedirectUrl()
    });
    if (error) throw error;

    showAuthMessage('Se existir uma conta com este e-mail, receberá um link para definir uma nova palavra-passe. Verifique também a pasta de spam.', 'ok');
  }

  async function updateRecoveredPassword() {
    const password = $id('authPassword').value;
    const confirmation = $id('authPasswordConfirm').value;
    if (password.length < 8) {
      showAuthMessage('A nova palavra-passe precisa ter pelo menos 8 caracteres.', 'bad');
      return;
    }
    if (password !== confirmation) {
      showAuthMessage('As duas palavras-passe não coincidem.', 'bad');
      return;
    }

    const { data: sessionData } = await sb.auth.getSession();
    if (!sessionData.session) {
      showAuthMessage('Este link expirou ou já foi utilizado. Solicite um novo link de recuperação.', 'bad');
      return;
    }

    const email = sessionData.session.user?.email || '';
    const { error } = await sb.auth.updateUser({ password });
    if (error) throw error;

    await sb.auth.signOut();
    cleanRecoveryUrl();
    authMode = 'login';
    paintAuth();
    $id('authEmail').value = email;
    $id('authPassword').value = '';
    $id('authPasswordConfirm').value = '';
    showAuthMessage('Palavra-passe alterada. Já pode entrar com a nova palavra-passe.', 'ok');
  }

  submitAuth = async function () {
    const button = $id('authSubmit');
    const email = $id('authEmail').value.trim().toLowerCase();
    const password = $id('authPassword').value;
    const name = $id('authName').value.trim();

    button.disabled = true;
    showAuthMessage('A processar…', 'muted');
    try {
      if (authMode === 'recover') {
        await requestPasswordRecovery();
        return;
      }
      if (authMode === 'update-password') {
        await updateRecoveredPassword();
        return;
      }
      if (!email || !$id('authEmail').checkValidity()) {
        throw new Error('Introduza um endereço de e-mail válido.');
      }
      if (password.length < (authMode === 'signup' ? 8 : 6)) {
        throw new Error(authMode === 'signup' ? 'A palavra-passe precisa ter pelo menos 8 caracteres.' : 'Introduza a sua palavra-passe.');
      }

      if (authMode === 'signup') {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name, future_me: true },
            emailRedirectTo: `${location.origin}/future-me.html`
          }
        });
        if (error) throw error;

        const existing = Boolean(data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0);
        if (existing) {
          authMode = 'login';
          paintAuth();
          $id('authEmail').value = email;
          showAuthMessage('Este e-mail já possui uma conta. Entre ou recupere a palavra-passe.', 'bad');
          return;
        }
        if (!data.session) {
          authMode = 'login';
          paintAuth();
          $id('authEmail').value = email;
          showAuthMessage('Conta criada. Confirme o e-mail recebido antes de entrar.', 'ok');
          return;
        }
        await boot(data.session);
        go('profile');
        return;
      }

      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error('Não foi possível iniciar a sessão. Tente novamente.');
      await boot(data.session);
    } catch (error) {
      showAuthMessage(friendlyAuthError(error), 'bad');
    } finally {
      button.disabled = false;
    }
  };

  ['authEmail', 'authPassword', 'authPasswordConfirm'].forEach((id) => {
    $id(id)?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitAuth();
      }
    });
  });

  sb.auth.onAuthStateChange((event, recoveredSession) => {
    if (event === 'PASSWORD_RECOVERY') {
      session = recoveredSession;
      user = recoveredSession?.user || null;
      authMode = 'update-password';
      landing.style.display = 'none';
      app.style.display = 'none';
      auth.style.display = 'flex';
      paintAuth();
      showAuthMessage('Link validado. Defina e confirme a nova palavra-passe.', 'ok');
    }
  });

  if (isRecoveryReturn()) {
    authMode = 'update-password';
    landing.style.display = 'none';
    app.style.display = 'none';
    auth.style.display = 'flex';
    paintAuth();
    showAuthMessage('A validar o link de recuperação…', 'muted');
    sb.auth.getSession().then(({ data }) => {
      if (data.session) {
        session = data.session;
        user = data.session.user;
        showAuthMessage('Link validado. Defina e confirme a nova palavra-passe.', 'ok');
      }
    });
  }
})();

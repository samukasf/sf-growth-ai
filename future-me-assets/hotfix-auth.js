(function(){
  const oldPaintAuth=paintAuth;
  paintAuth=function(){
    oldPaintAuth();
    const sign=authMode==='signup';
    const reset=$id('resetBtn'), resend=$id('resendBtn');
    if(reset) reset.classList.add('hidden');
    if(resend) resend.classList.add('hidden');
    if(!sign){
      const box=$id('authMsg');
      box.className='notice muted';
      box.textContent='Se esta conta foi criada antes do Future Me, use a palavra-passe original. Novos cadastros Future Me entram imediatamente sem confirmação por email.';
    }
  };
  submitAuth=async function(){
    const email=$id('authEmail').value.trim(),password=$id('authPassword').value,name=$id('authName').value.trim();
    const box=$id('authMsg');
    box.className='notice muted';box.textContent='A processar…';
    try{
      if(authMode==='signup'){
        const{data,error}=await sb.auth.signUp({email,password,options:{data:{display_name:name,future_me:true}}});
        if(error)throw error;
        const existing=!!(data.user&&Array.isArray(data.user.identities)&&data.user.identities.length===0);
        if(existing){
          authMode='login';paintAuth();$id('authEmail').value=email;
          box.className='notice bad';
          box.textContent='Este email já pertence a uma conta existente deste Supabase. Entre com a palavra-passe anterior. Novos cadastros Future Me já entram imediatamente.';
          return;
        }
        let s=data.session;
        if(!s){
          const login=await sb.auth.signInWithPassword({email,password});
          if(login.error)throw login.error;
          s=login.data.session;
        }
        if(!s)throw new Error('Não foi possível iniciar a sessão. Tente entrar novamente.');
        await boot(s);go('profile');
      }else{
        const{data,error}=await sb.auth.signInWithPassword({email,password});
        if(error)throw error;
        await boot(data.session);
      }
    }catch(e){box.className='notice bad';box.textContent=e.message||String(e)}
  };
})();
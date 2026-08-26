/* CHEBSEL v1.12.0 — Auth & sensitive-operation confirmation */
'use strict';
(function(){
  async function verifyCHEBSELCredential(role, secret){
    if(!secret) return false;
    try{
      if(typeof verifyOfflinePassword==='function' && await verifyOfflinePassword(role,secret)) return true;
    }catch(e){console.warn('Offline credential check:',e)}
    try{
      if(typeof verifyPinFor==='function' && await verifyPinFor(role,secret)) return true;
    }catch(e){console.warn('Legacy PIN fallback:',e)}
    return false;
  }
  window.verifyCHEBSELCredential=verifyCHEBSELCredential;
  window.criticalGuard=criticalGuard=async function(permission,label){
    if(!requirePermission(permission)) return false;
    const u=currentUser();
    if(!u) return false;
    const role=(typeof currentRoleView==='function'&&currentRoleView())||u.key;
    const secret=prompt(label+'\n\nConfirmez votre mot de passe CHEBSEL ('+u.name+') :');
    if(secret===null) return false;
    if(await verifyCHEBSELCredential(role,secret)) return true;
    alert('Mot de passe / code CHEBSEL incorrect. Utilisez le même mot de passe que pour votre connexion CHEBSEL.');
    return false;
  };
})();

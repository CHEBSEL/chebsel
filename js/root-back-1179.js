/* CHEBSEL v1.17.9 — Root Back Guard */
'use strict';
(function(){
  const previousBack=window.globalBack;

  function anyOpenLayer(){
    if(document.getElementById('viewer')?.classList.contains('open')) return true;
    if(document.querySelector('.membersView.open')) return true;
    if(document.querySelector('.modal.open')) return true;
    if(document.querySelector('[role="dialog"].open')) return true;
    return false;
  }

  function isHomeRoot(){
    return !anyOpenLayer();
  }

  window.globalBack=function(){
    // RÈGLE ABSOLUE CHEBSEL : depuis l'accueil, Retour ne doit jamais
    // ouvrir Connexion, déconnecter l'utilisateur, ni sortir de l'application.
    if(isHomeRoot()) return false;
    if(typeof previousBack==='function') return previousBack.apply(this,arguments);
    return false;
  };

  // Protection contre les clics directs sur les boutons de retour du shell.
  document.addEventListener('click',function(e){
    const btn=e.target?.closest?.('#globalBackBtn,.floating-back');
    if(!btn) return;
    if(isHomeRoot()){
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
  },true);
})();

/* CHEBSEL v1.17.16 — universal internal navigation, local Back preserved */
'use strict';
(function(){
  if(window.__CHEBSEL_NAV_11716__)return;
  window.__CHEBSEL_NAV_11716__=true;

  const HOME='__CHEBSEL_HOME__';
  const stack=[];
  let clickOrigin=HOME;
  let guardingPop=false;

  const closeMap={
    notificationsView:'closeNotifications',archivesView:'closeArchives',conflictView:'closeConflictJournal',
    reportsCenterView:'closeReportsCenter',treasuryExpensesView:'closeTreasuryExpenses',treasuryReportView:'closeTreasuryReport',
    punctualityReportView:'closePunctualityReport',globalMonthlyReportView:'closeGlobalMonthlyReport',monthlyView:'closeMonthlyClose',
    settingsHub:'closeSettingsHub',privacyHub:'closePrivacyHub',aboutHub:'closeAboutHub',
    receiptModal:'closeReceipt',paymentModal:'closePaymentModal',memberModal:'closeMemberModal',cloudConfigModal:'closeCloudConfigModal',
    recurringOverrideModal:'closeRecurringOverrideModal',activityModal:'closeActivityModal',paymentCorrectionModal:'closePaymentCorrectionModal',
    restoreTestModal:'closeRestoreTestModal',pinModal:'closePinModal',loginModal:'closeLoginModal',restoreModal:'closeRestoreModal',
    calendarView:'closeCalendar',diagnosticsView:'closeDiagnostics',securityView:'closeSecurity',handoverView:'closeHandover',helpView:'closeHelp',
    profileView:'closeProfile',debtorsView:'closeDebtors',auditView:'closeAudit',membersView:'closeMembers',viewer:'closeViewer',
    secretariatHub:'closeSimpleHub',treasuryPaymentHub:'closeSimpleHub',treasuryHub:'closeSimpleHub',
    scopedArchiveHub:'closeSimpleHub',visitorMembersView:'closeSimpleHub',visitorFinanceView:'closeSimpleHub'
  };

  function layerElements(){
    return [...document.querySelectorAll('.modal.open,.membersView.open,.viewer.open,[data-chebsel-view].open')]
      .filter(el=>el&&el.isConnected);
  }
  function z(el){const n=parseInt(getComputedStyle(el).zIndex,10);return Number.isFinite(n)?n:0}
  function topLayer(){
    const all=layerElements();if(!all.length)return null;
    return all.sort((a,b)=>{
      const dz=z(b)-z(a);if(dz)return dz;
      const pos=a.compareDocumentPosition(b);
      return (pos&Node.DOCUMENT_POSITION_FOLLOWING)?1:-1;
    })[0]||null;
  }
  function topId(){return topLayer()?.id||HOME}

  function remember(from,to){
    if(!to||from===to)return;
    const last=stack[stack.length-1];
    if(last&&last.from===from&&last.to===to)return;
    stack.push({from:from||HOME,to});
    if(stack.length>100)stack.splice(0,stack.length-100);
  }
  function takeRoute(to){
    for(let i=stack.length-1;i>=0;i--){
      if(stack[i].to===to){const r=stack[i];stack.splice(i);return r}
    }
    return null;
  }
  function reopen(id){
    if(!id||id===HOME)return;
    const el=document.getElementById(id);if(!el)return;
    try{el.hidden=false}catch(e){}
    el.classList.add('open');
  }

  function invokeClose(el){
    if(!el)return false;
    const id=el.id||'';
    const fn=closeMap[id];
    if(fn&&typeof window[fn]==='function'){
      try{
        if(fn==='closeSimpleHub')window[fn](id);else window[fn]();
        return true;
      }catch(e){}
    }
    // Prefer the view's own explicit Return/Close button. Local buttons are NOT intercepted by this controller.
    const b=el.querySelector('button.back[onclick],.floating-back[onclick],button[data-action="close"][onclick],button[aria-label*="Retour" i][onclick]');
    if(b){try{b.click();return true}catch(e){}}
    el.classList.remove('open');
    return true;
  }

  function internalBack(){
    const el=topLayer();
    if(!el)return false; // Accueil: never leave CHEBSEL.
    const id=el.id||'';
    const route=takeRoute(id);
    invokeClose(el);
    setTimeout(()=>{
      if(route?.from&&route.from!==HOME&&topId()===HOME)reopen(route.from);
    },0);
    return false;
  }

  function isGlobalBack(t){return !!t?.closest?.('#globalBackBtn')}
  function isLocalBack(t){return !!t?.closest?.('.floating-back,button.back,[data-action="back"]')&&!isGlobalBack(t)}

  // Record the actual layer the user was on before opening another layer.
  document.addEventListener('pointerdown',e=>{
    if(isGlobalBack(e.target)||isLocalBack(e.target))return;
    clickOrigin=topId();
  },true);
  document.addEventListener('click',e=>{
    if(isGlobalBack(e.target)||isLocalBack(e.target))return;
    const from=clickOrigin;
    [30,100,260].forEach(ms=>setTimeout(()=>{const to=topId();if(to!==from)remember(from,to)},ms));
  },false);

  // Global header Back: always internal, one layer only.
  document.addEventListener('click',e=>{
    if(!isGlobalBack(e.target))return;
    e.preventDefault();e.stopImmediatePropagation();internalBack();
  },true);

  // Local Back buttons keep their native close...() handler. After it runs, restore the parent layer if needed.
  document.addEventListener('click',e=>{
    if(!isLocalBack(e.target))return;
    const owner=e.target.closest('.modal,.membersView,.viewer,[data-chebsel-view]');
    const id=owner?.id||'';
    const route=id?takeRoute(id):null;
    if(route?.from&&route.from!==HOME){
      setTimeout(()=>{if(topId()===HOME)reopen(route.from)},0);
    }
  },false);

  window.globalBack=internalBack;
  window.chebselInternalBack=internalBack;
  window.chebselNavStack=stack;

  // Android/PWA hardware or gesture Back remains inside CHEBSEL.
  try{
    history.replaceState({...history.state,chebselBase11716:true},'',location.href);
    history.pushState({chebselGuard11716:true},'',location.href);
    window.addEventListener('popstate',()=>{
      if(guardingPop)return;
      guardingPop=true;
      try{internalBack()}finally{
        setTimeout(()=>{
          try{history.pushState({chebselGuard11716:true},'',location.href)}catch(e){}
          guardingPop=false;
        },0);
      }
    });
  }catch(e){}
})();

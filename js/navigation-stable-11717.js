/* CHEBSEL v1.17.17 — stable universal Back: no recursion, no MutationObserver, no browser back */
'use strict';
(function(){
  if(window.__CHEBSEL_NAV_STABLE_11717__)return;
  window.__CHEBSEL_NAV_STABLE_11717__=true;

  const HOME='__HOME__';
  const stack=[];
  let clickOrigin=HOME;
  let busy=false;

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
    scopedArchiveHub:'closeScopedArchiveHub',visitorMembersView:'closeVisitorMembers',visitorFinanceView:'closeVisitorFinance'
  };

  function visibleOpen(el){
    if(!el||!el.classList?.contains('open'))return false;
    if(el.hidden)return false;
    const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden';
  }
  function layers(){
    const all=[...document.querySelectorAll('.membersView.open,.viewer.open,.modal.open,[id$="View"].open,[id$="Hub"].open')];
    return all.filter((el,i,a)=>visibleOpen(el)&&a.indexOf(el)===i);
  }
  function topLayer(){
    const a=layers();if(!a.length)return null;
    const body=[...document.body.children];
    return a.sort((x,y)=>{
      const zx=parseInt(getComputedStyle(x).zIndex,10)||0,zy=parseInt(getComputedStyle(y).zIndex,10)||0;
      if(zx!==zy)return zy-zx;
      return body.indexOf(y)-body.indexOf(x);
    })[0];
  }
  function topId(){return topLayer()?.id||HOME}
  function reopen(id){
    if(!id||id===HOME)return;
    const el=document.getElementById(id);if(!el)return;
    el.hidden=false;el.classList.add('open');
  }
  function routeFor(id){
    for(let i=stack.length-1;i>=0;i--){
      if(stack[i].to===id){const r=stack[i];stack.splice(i);return r}
    }
    return null;
  }
  function safeClose(el){
    if(!el)return false;
    const id=el.id||'',fn=closeMap[id];
    if(fn&&typeof window[fn]==='function'){
      try{window[fn]();return true}catch(e){console.warn('CHEBSEL Back close',id,e)}
    }
    // Dynamic hubs created by role modules expose no dedicated close function.
    el.classList.remove('open');
    if(id==='viewer'){
      try{const f=document.getElementById('appFrame');if(f){f.onload=null;f.srcdoc=''}}catch(e){}
    }
    return true;
  }
  function doBack(){
    if(busy)return false;
    busy=true;
    try{
      const el=topLayer();
      if(!el)return false; // Accueil: absolute no-op.
      const id=el.id||'',route=routeFor(id);
      safeClose(el);
      if(route?.from&&route.from!==HOME)setTimeout(()=>reopen(route.from),0);
      return false;
    }finally{setTimeout(()=>{busy=false},90)}
  }

  // Record only actual click-driven transitions. No DOM observer, no timers running continuously.
  document.addEventListener('pointerdown',e=>{
    if(e.target?.closest?.('#globalBackBtn,.floating-back,button.back,[data-action="back"]'))return;
    clickOrigin=topId();
  },true);
  document.addEventListener('click',e=>{
    if(e.target?.closest?.('#globalBackBtn,.floating-back,button.back,[data-action="back"]'))return;
    const from=clickOrigin;
    setTimeout(()=>{
      const to=topId();
      if(to!==from){
        const last=stack[stack.length-1];
        if(!last||last.from!==from||last.to!==to)stack.push({from,to});
        if(stack.length>60)stack.splice(0,stack.length-60);
      }
    },50);
  },false);

  // Global header Back: final authority; never delegates to legacy globalBack wrappers.
  document.addEventListener('click',e=>{
    if(!e.target?.closest?.('#globalBackBtn'))return;
    e.preventDefault();e.stopImmediatePropagation();doBack();
  },true);

  // Local Retour buttons keep their native closeX() handler. After it runs, restore parent if needed.
  document.addEventListener('click',e=>{
    const b=e.target?.closest?.('.floating-back,button.back,[data-action="back"]');
    if(!b||b.id==='globalBackBtn')return;
    const owner=b.closest('.membersView,.viewer,.modal,[id$="View"],[id$="Hub"]');
    const id=owner?.id||'';if(!id)return;
    const route=routeFor(id);
    if(route?.from&&route.from!==HOME)setTimeout(()=>reopen(route.from),30);
  },false);

  window.globalBack=doBack;
  window.chebselInternalBack=doBack;
  window.chebselNavStack=stack;
})();

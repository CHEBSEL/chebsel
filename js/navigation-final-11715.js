/* CHEBSEL v1.17.15 — single authoritative internal navigation controller */
'use strict';
(function(){
  if(window.__CHEBSEL_NAV_11715__)return;
  window.__CHEBSEL_NAV_11715__=true;

  const HOME='__CHEBSEL_HOME__';
  const priorBack=window.globalBack;
  const stack=[];
  let origin=HOME;
  let guardingPop=false;

  const closeMap={
    notificationsView:'closeNotifications', archivesView:'closeArchives', conflictView:'closeConflictJournal',
    reportsCenterView:'closeReportsCenter', treasuryExpensesView:'closeTreasuryExpenses', treasuryReportView:'closeTreasuryReport',
    punctualityReportView:'closePunctualityReport', globalMonthlyReportView:'closeGlobalMonthlyReport', monthlyView:'closeMonthlyClose',
    settingsHub:'closeSettingsHub', privacyHub:'closePrivacyHub', aboutHub:'closeAboutHub',
    receiptModal:'closeReceipt', paymentModal:'closePaymentModal', memberModal:'closeMemberModal', cloudConfigModal:'closeCloudConfigModal',
    recurringOverrideModal:'closeRecurringOverrideModal', activityModal:'closeActivityModal', paymentCorrectionModal:'closePaymentCorrectionModal',
    restoreTestModal:'closeRestoreTestModal', pinModal:'closePinModal', loginModal:'closeLoginModal', restoreModal:'closeRestoreModal',
    calendarView:'closeCalendar', diagnosticsView:'closeDiagnostics', securityView:'closeSecurity', handoverView:'closeHandover', helpView:'closeHelp',
    profileView:'closeProfile', debtorsView:'closeDebtors', auditView:'closeAudit', membersView:'closeMembers', viewer:'closeViewer'
  };

  const specialPriorIds=new Set([
    'viewer','presidentPaymentHub1176','presidentSecretariatHub1176','presidentTreasuryHub1176',
    'presidentPunctHealthView','presidentFinanceHealthView','secretaryHealthView1175'
  ]);

  function isOpen(el){return !!el&&el.classList?.contains('open')&&!el.hidden&&getComputedStyle(el).display!=='none';}
  function candidates(){
    const known=[
      ...Object.keys(closeMap),
      'secretariatHub','treasuryPaymentHub','treasuryHub','scopedArchiveHub','visitorMembersView','visitorFinanceView',
      'treasurerPaymentHub1173','treasurerReportsHub1173','treasurerHealthView1173','secretaryCallHub1171','secretaryReportsHub1171',
      'presidentPaymentHub1176','presidentSecretariatHub1176','presidentTreasuryHub1176','presidentPunctHealthView','presidentFinanceHealthView','secretaryHealthView1175'
    ];
    const seen=new Set(), out=[];
    for(const id of known){const el=document.getElementById(id);if(isOpen(el)){seen.add(el);out.push(el)}}
    document.querySelectorAll('body > .open, body > .membersView.open, body > .viewer.open, body > .modal.open').forEach(el=>{if(!seen.has(el)&&isOpen(el))out.push(el)});
    return out;
  }
  function topLayer(){
    const a=candidates(); if(!a.length)return null;
    return a.sort((x,y)=>{
      const zx=parseInt(getComputedStyle(x).zIndex,10)||0, zy=parseInt(getComputedStyle(y).zIndex,10)||0;
      if(zx!==zy)return zy-zx;
      return [...document.body.children].indexOf(y)-[...document.body.children].indexOf(x);
    })[0];
  }
  function topId(){return topLayer()?.id||HOME;}
  function reopen(id){
    if(!id||id===HOME)return;
    const el=document.getElementById(id);if(el){el.hidden=false;el.classList.add('open');}
  }
  function closeGeneric(el){
    if(!el)return false;
    const id=el.id||'';
    const fn=closeMap[id];
    if(fn&&typeof window[fn]==='function'){
      if(id==='loginModal'){
        try{if(typeof currentUser==='function'&&!currentUser()&&typeof isVisitor==='function'&&!isVisitor()){el.classList.remove('open');return true}}catch(e){}
      }
      try{window[fn]();return true}catch(e){}
    }
    el.classList.remove('open');return true;
  }
  function findRoute(current){
    for(let i=stack.length-1;i>=0;i--){
      if(stack[i].to===current){const r=stack[i];stack.splice(i);return r;}
    }
    return null;
  }
  function internalBack(){
    const el=topLayer();
    if(!el)return false;
    const id=el.id||'';
    const route=findRoute(id);

    if(specialPriorIds.has(id)&&typeof priorBack==='function'){
      const before=topId();
      try{priorBack()}catch(e){}
      const after=topId();
      if(after!==before){
        if(route&&route.from!==HOME&&after===HOME)reopen(route.from);
        return false;
      }
    }

    closeGeneric(el);
    if(route&&route.from!==HOME)reopen(route.from);
    return false;
  }

  function isBackControl(target){return !!target?.closest?.('#globalBackBtn,.floating-back,button.back,[data-action="back"]');}

  document.addEventListener('pointerdown',e=>{
    if(isBackControl(e.target))return;
    origin=topId();
  },true);
  document.addEventListener('click',e=>{
    if(isBackControl(e.target))return;
    const from=origin;
    setTimeout(()=>{
      const to=topId();
      if(to!==from){
        const last=stack[stack.length-1];
        if(!last||last.from!==from||last.to!==to)stack.push({from,to});
        if(stack.length>80)stack.splice(0,stack.length-80);
      }
    },40);
  },false);

  document.addEventListener('click',e=>{
    if(!isBackControl(e.target))return;
    e.preventDefault();e.stopImmediatePropagation();internalBack();
  },true);

  window.globalBack=internalBack;
  window.chebselInternalBack=internalBack;
  window.chebselNavStack=stack;

  try{
    history.replaceState({...history.state,chebselBase11715:true},'',location.href);
    history.pushState({chebselGuard11715:true},'',location.href);
    window.addEventListener('popstate',()=>{
      if(guardingPop)return;
      guardingPop=true;
      try{internalBack()}finally{
        setTimeout(()=>{try{history.pushState({chebselGuard11715:true},'',location.href)}catch(e){}guardingPop=false},0);
      }
    });
  }catch(e){}
})();

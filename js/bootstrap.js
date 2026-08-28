/* CHEBSEL v1.17.19 — lean bootstrap, early final controllers, no duplicate loading */
'use strict';
window.CHEBSEL_ARCHITECTURE={version:'1.17.19',modules:['notification-routing-1142','deletion-1141','embedded-apps','legacy-core','auth-security','sync-policy','institutional-ops','corrections-1131','stability-1132','payment-reason-history-1133','closing-canonical-1134','monthly-governance-1140','reports-center-1150','role-shell-1160','clean-shell-1170','secretary-scope-1171','treasurer-scope-1173','hotfix-1175','president-scope-1176','president-scope-1178','update-manager-1177','notification-state-11711','navigation-stable-11717']};
function chebselLoadRuntime(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.async=false;document.body.appendChild(s)}
function chebselFinishBoot(){
 try{document.querySelector('.versionChip')?.replaceChildren(document.createTextNode('v1.17.19'))}catch(e){}
 try{document.title=document.title.replace(/CHEBSEL v\d+(?:\.\d+){1,2}/g,'CHEBSEL v1.17.19')}catch(e){}
 try{window.renderCleanRole?.()}catch(e){}
}
let started=false;
function chebselStartFinalControllers(){
 if(started)return;started=true;
 chebselLoadRuntime('chebsel-notification-state-11711','./js/notification-state-11711.js?v=11719');
 chebselLoadRuntime('chebsel-navigation-stable-11717','./js/navigation-stable-11717.js?v=11719');
 chebselFinishBoot();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',chebselStartFinalControllers,{once:true});else chebselStartFinalControllers();
window.addEventListener('load',chebselFinishBoot,{once:true});

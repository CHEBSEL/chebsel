/* CHEBSEL v1.17.13 — modular bootstrap marker */
'use strict';
window.CHEBSEL_ARCHITECTURE={version:'1.17.13',modules:['notification-routing-1142','deletion-1141','embedded-apps','legacy-core','auth-security','sync-policy','institutional-ops','corrections-1131','stability-1132','payment-reason-history-1133','closing-canonical-1134','monthly-governance-1140','reports-center-1150','role-shell-1160','clean-shell-1170','secretary-scope-1171','treasurer-scope-1173','hotfix-1175','president-scope-1176','update-manager-1177','root-back-1179','notification-state-11711','shell-navigation-11713']};
function chebselLoadRuntime(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.defer=false;document.body.appendChild(s)}
window.addEventListener('load',()=>{
 chebselLoadRuntime('chebsel-hotfix-1175','./js/hotfix-1175.js?v=11713');
 chebselLoadRuntime('chebsel-president-scope-1176','./js/president-scope-1176.js?v=11713');
 chebselLoadRuntime('chebsel-update-manager-1177','./js/update-manager-1177.js?v=11713');
 setTimeout(()=>chebselLoadRuntime('chebsel-root-back-1179','./js/root-back-1179.js?v=11713'),60);
 setTimeout(()=>chebselLoadRuntime('chebsel-notification-state-11711','./js/notification-state-11711.js?v=11713'),100);
 // Loaded last: it is the final authority for internal Back and header-safe layout.
 setTimeout(()=>chebselLoadRuntime('chebsel-shell-navigation-11713','./js/shell-navigation-11713.js?v=11713'),150);
 const chip=document.querySelector('.versionChip');if(chip)chip.textContent='v1.17.13';
 document.title=document.title.replace(/CHEBSEL v\d+(?:\.\d+){1,2}/g,'CHEBSEL v1.17.13');
});

/* CHEBSEL legacy v1.16.1 strict-role UI — disabled when Clean Shell is active */
'use strict';
(function(){
 function cleanShellActive(){
  return !!document.getElementById('cleanRoleRoot') || typeof window.renderCleanRole==='function';
 }
 function retireLegacyStrictRole(){
  const area=document.getElementById('strictRoleArea');
  const grid=document.getElementById('roleShellGrid');
  if(area){area.style.display='none';area.hidden=true;}
  if(grid){grid.style.display='none';grid.hidden=true;}
 }
 window.syncStrictRoleUI=function(){
  if(cleanShellActive()){retireLegacyStrictRole();return;}
 };
 document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{if(cleanShellActive())retireLegacyStrictRole()},100));
 window.addEventListener('load',()=>setTimeout(()=>{if(cleanShellActive())retireLegacyStrictRole()},150));
})();

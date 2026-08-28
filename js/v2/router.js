import {AppState,setState} from './app-state.js';

let initialized=false;
const routes=new Map();

export function registerRoute(id,renderer){routes.set(id,renderer)}

export function navigate(id,{replace=false}={}){
  if(!routes.has(id))throw new Error(`Route inconnue: ${id}`);
  const stack=[...AppState.navigationStack];
  if(replace)stack[stack.length-1]=id;
  else if(stack[stack.length-1]!==id)stack.push(id);
  setState({route:id,navigationStack:stack});
  renderCurrent();
}

export function back(){
  const stack=[...AppState.navigationStack];
  if(stack.length<=1)return false;
  stack.pop();
  const route=stack[stack.length-1]||'home';
  setState({route,navigationStack:stack});
  renderCurrent();
  return true;
}

export function resetTo(id='home'){
  if(!routes.has(id))throw new Error(`Route inconnue: ${id}`);
  setState({route:id,navigationStack:[id]});
  renderCurrent();
}

export function renderCurrent(){
  const outlet=document.getElementById('appOutlet');
  if(!outlet)return;
  const renderer=routes.get(AppState.route)||routes.get('home');
  outlet.replaceChildren();
  const node=renderer?.(AppState);
  if(node instanceof Node)outlet.appendChild(node);
  else if(typeof node==='string')outlet.innerHTML=node;
  window.scrollTo({top:0,behavior:'instant'});
}

export function initRouter(){
  if(initialized)return;initialized=true;
  const backBtn=document.getElementById('globalBackBtn');
  backBtn?.addEventListener('click',e=>{e.preventDefault();back()});
  window.addEventListener('popstate',()=>{
    if(AppState.navigationStack.length>1)back();
    else history.pushState({chebsel:true},'',location.href);
  });
  if(!history.state?.chebsel)history.replaceState({chebsel:true},'',location.href);
}

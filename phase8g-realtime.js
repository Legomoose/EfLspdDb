/* Phase 8G: lightweight Supabase Realtime Broadcast notification layer.
   This broadcasts no case data or credentials. All actual reads/writes still go
   through the existing authenticated Worker with optimistic version checks. */
(()=>{'use strict';
const OPT='ef8e_auto_sync_optin_v1';
const CFG=window.EF8G_REALTIME||{};
const configured=!!(CFG.url&&CFG.anonKey&&!CFG.anonKey.startsWith('PASTE_'));
let client=null,channel=null,connected=false,wrapped=false,refreshTimer=null,lastSignal=0,lastRefresh=0;
// Auto-sync is enabled for authenticated users; the old opt-in key is obsolete.
const opted=()=>true;
const logged=()=>!!window.EFDBAuth?.loggedIn;
const label=()=>document.getElementById('ef8g-realtime-status');
function show(message,bad=false){const e=label();if(e){e.textContent=message;e.style.color=bad?'#ffb3b3':'#a6e4c0'}}
function mount(){const p=document.getElementById('ef8e-panel');if(!p)return;
 if(!label()){const e=document.createElement('p');e.id='ef8g-realtime-status';e.setAttribute('role','status');e.style.cssText='font-size:12px;margin:8px 0 0';p.append(e)}
 show(!configured?'Live notifications need a Supabase publishable key (polling still works)':!logged()?'Sign in for live notifications':connected?'Live notifications connected':'Connecting live notifications…',!configured);
}
function promptRefresh(){if(!opted()||!logged()||document.hidden)return;
 clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>{const now=Date.now();if(now-lastRefresh<2000||document.hidden)return;lastRefresh=now;window.dispatchEvent(new Event('efdb-realtime-changed'));window.dispatchEvent(new Event('focus'));},350);
}
function notify(){if(!connected||!channel||!opted()||!logged())return;
 const now=Date.now();if(now-lastSignal<300)return;lastSignal=now;
 channel.send({type:'broadcast',event:'changed',payload:{at:now}}).catch(()=>{});
}
function wrapRequests(){if(wrapped||typeof window.EFDBAuth?.request!=='function')return;
 const auth=window.EFDBAuth,original=auth.request;
 auth.request=async function(path,body,...rest){
  const result=await original.call(this,path,body,...rest);
  if(path==='/live-records'&&['create','update','delete'].includes(body?.action))notify();
  return result;
 };
 wrapped=true;
}
function stop(){if(channel&&client)client.removeChannel(channel);channel=null;connected=false;}
function connect(){mount();wrapRequests();
 if(!configured||!opted()||!logged()||!window.supabase?.createClient){stop();mount();return}
 if(channel)return;
 try{
  client=window.supabase.createClient(CFG.url,CFG.anonKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:10}}});
  channel=client.channel('eflspddb-record-change-notices',{config:{broadcast:{self:false,ack:false}}});
  channel.on('broadcast',{event:'changed'},()=>promptRefresh());
  channel.subscribe(status=>{
   connected=status==='SUBSCRIBED';
   if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'){show('Live connection unavailable — 60-second fallback active',true)}
   else show(connected?'Live notifications connected · polling fallback active':'Connecting live notifications…');
  });
 }catch(e){stop();show('Live connection failed — polling fallback active',true)}
}
function update(){if(!opted()||!logged()){stop();mount()}else connect()}
function init(){mount();wrapRequests();update();
 const observer=new MutationObserver(()=>{if(!label())mount();wrapRequests()});observer.observe(document.body,{childList:true,subtree:true});
 window.addEventListener('efdb-auth-login',update);
 window.addEventListener('efdb-auth-logout',update);
 window.addEventListener('focus',update);
 window.addEventListener('online',update);
 document.addEventListener('change',e=>{if(e.target?.id==='ef8e-enable')setTimeout(update,0)});
 setInterval(update,5000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

import { EXHIBITS } from './exhibits.mjs';

// Read the same semantic entries that power the ordinary portfolio views.
export function readContent(root=document) {
  const content=new Map();
  for(const exhibit of EXHIBITS) {
    const source=root.getElementById(exhibit.id);
    if(!source)throw new Error(`Missing portfolio entry: ${exhibit.id}`);
    const entry=source.cloneNode(true);
    entry.hidden=false;
    for(const element of [entry,...entry.querySelectorAll('[id]')])element.removeAttribute('id');
    entry.querySelectorAll('iframe,.project-video-demo').forEach(frame=>frame.remove());
    content.set(exhibit.id,{
      title:source.querySelector('h3,h4').textContent.trim(),
      context:source.querySelector('.timeline-content > h4')?.textContent.trim()||'Selected project',
      summary:source.querySelector('.project-description,.timeline-content > p').textContent.trim().replace(/\s+/g,' '),
      source,entry
    });
  }
  return content;
}
function element(tag,text,className) {
  const node=document.createElement(tag);
  if(text)node.textContent=text;
  if(className)node.className=className;
  return node;
}

export function mountWorld(section) {
  const events=new AbortController();
  const content=readContent();
  const host=section.querySelector('.world-canvas');
  const status=section.querySelector('.world-status');
  const start=section.querySelector('.world-start');
  const browse=section.querySelector('.world-browse');
  const reset=section.querySelector('.world-reset');
  const quality=section.querySelector('.world-quality');
  const hint=section.querySelector('.world-target');
  const modal=section.querySelector('dialog');
  const modalTitle=modal.querySelector('h2');
  const modalBody=modal.querySelector('.world-dialog-body');
  const close=modal.querySelector('.world-dialog-close');
  let active=true,runtime=null,state='loading',currentTarget=null,returnFocus=browse,loading=false,loadButton=null;
  const touch=matchMedia('(pointer: coarse)').matches;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const listen=(target,event,fn)=>target.addEventListener(event,fn,{signal:events.signal});
  function setState(next) {
    state=next;section.dataset.state=next;
    start.textContent=next==='ready'?'Start exploring':'Resume exploring';
    start.hidden=!runtime;
    reset.disabled=!runtime;quality.disabled=!runtime;
  }
  function pause() {
    if(!active)return;
    if(state==='exploring')setState('paused');
    runtime?.pause();
  }
  function openDialog(title,body) {
    if(!modal.open)returnFocus=document.activeElement;
    setState('inspecting');runtime?.pause();
    modalTitle.textContent=title;modalBody.replaceChildren(body);
    if(!modal.open)modal.showModal();
    close.focus();
  }
  function closeDialog() {
    modal.close();
    setState(runtime?'paused':'ready');
    if(returnFocus instanceof HTMLElement && returnFocus.isConnected && returnFocus.getClientRects().length)returnFocus.focus();
    else(runtime?start:browse).focus();
  }
  function details(id) {
    const data=content.get(id);
    const body=element('div');
    body.append(element('p',data.context,'world-kicker'),element('p',data.summary,'world-summary'));
    const date=data.source.querySelector('.timeline-date,.project-date');
    if(date)body.append(element('p',date.textContent,'world-meta'));
    // Put existing quantified results first without inventing or rewriting copy.
    const contributions=[...data.source.querySelectorAll('.project-features li')]
      .sort((a,b)=>Number(/\d/.test(b.textContent))-Number(/\d/.test(a.textContent)));
    if(contributions.length) {
      const list=element('ul');
      contributions.slice(0,3).forEach(item=>list.append(item.cloneNode(true)));body.append(list);
    }
    const tags=data.source.querySelector('.project-tech,.timeline-skills');
    if(tags)body.append(tags.cloneNode(true));
    const links=element('div',null,'world-content-links');
    const seen=new Set();
    data.source.querySelectorAll('.project-links a,a.project-link,a.video-fallback').forEach(a=>{
      if(seen.has(a.href))return;seen.add(a.href);
      const link=a.cloneNode(true);link.className='menu-button';link.target='_blank';link.rel='noopener noreferrer';links.append(link);
    });
    if(links.childElementCount)body.append(links);
    const more=element('details');more.append(element('summary','Read full portfolio entry'),data.entry.cloneNode(true));body.append(more);
    openDialog(data.title,body);
  }
  function destinations() {
    const list=element('ul',null,'world-destination-list');
    EXHIBITS.forEach(exhibit=>{
      const data=content.get(exhibit.id);
      const item=element('li');
      item.append(element('p',`${exhibit.label} / ${data.context}`,'world-kicker'),element('h3',data.title));
      const actions=element('div',null,'world-destination-actions');
      const view=element('button','View details','menu-button');view.type='button';
      view.onclick=()=>details(exhibit.id);actions.append(view);
      if(runtime) {
        const go=element('button','Go there','menu-button');go.type='button';
        go.onclick=()=>{
          closeDialog();runtime.go(exhibit.arrival);
          status.textContent=`At ${exhibit.label}. Choose Resume exploring to take control.`;
          start.focus();
        };actions.append(go);
      }
      item.append(actions);list.append(item);
    });
    const body=element('div');body.append(list);
    const more=element('p','Looking for more? ');
    for(const [hash,label] of [['projects','All projects'],['experience','All experience']]) {
      const a=element('a',label);a.href='#'+hash;more.append(a,document.createTextNode(' · '));
    }
    body.append(more);openDialog('Destinations',body);
  }
  function failed(error) {
    if(!active)return;
    runtime?.dispose();runtime=null;setState('failed');
    status.textContent='The 3D view is unavailable. Browse Destinations to read the same work, or use the normal portfolio links below.';
    console.warn('Portfolio world unavailable:',error.message);
  }
  async function loadWorld() {
    if(loading||runtime||!active)return;
    loading=true;setState('loading');status.textContent='Preparing the plaza…';
    try {
      const [module]=await Promise.all([import('./scene.mjs'),document.fonts.ready]);
      if(!active)return;
      runtime=module.createWorld(host,content,{
        lock(locked){if(!active)return;if(locked)setState('exploring');else if(state==='exploring')setState('paused');},
        pause,
        denied(){if(!active)return;pause();status.textContent='Mouse capture was blocked. Try Resume exploring, or use Destinations for direct access.';},
        inspect:details,
        target(id){if(id===currentTarget)return;currentTarget=id;hint.textContent=id?`E / click — View ${content.get(id).title}`:'';},
        failure:failed
      },quality.checked);
      setState('ready');status.textContent='Four exhibits. Short paths. All the details, one interaction away.';
    }catch(error){failed(error);}
    finally{loading=false;}
  }
  listen(start,'click',()=>runtime?.requestControl());
  listen(browse,'click',destinations);
  listen(section.querySelector('.world-destinations'),'click',destinations);
  listen(section.querySelector('.world-pause'),'click',pause);
  listen(reset,'click',()=>{pause();runtime?.go();status.textContent='Back at the plaza. Choose Resume exploring to take control.';});
  listen(quality,'change',()=>runtime?.quality(quality.checked));
  listen(close,'click',closeDialog);
  listen(modal,'cancel',event=>{event.preventDefault();closeDialog();});
  if(touch||reduced) {
    setState('ready');
    section.querySelector('.world-instructions').textContent=touch?'Choose a destination to view the work. No movement controls needed.':'Browse the exhibits directly, or choose to load the walking tour.';
    status.textContent=touch?'A lightweight exhibit viewer for touch screens.':'Reduced motion is enabled. The direct exhibit viewer is ready.';
    if(!touch) {
      const load=element('button','Load walking tour','menu-button');load.type='button';loadButton=load;
      listen(load,'click',()=>{load.remove();loadWorld();});
      start.before(load);
    }
  }else loadWorld();
  return {
    dispose(){
      active=false;
      if(modal.open)modal.close();
      runtime?.dispose();runtime=null;events.abort();loadButton?.remove();modalBody.replaceChildren();
      host.replaceChildren();section.dataset.state='loading';
    }
  };
}

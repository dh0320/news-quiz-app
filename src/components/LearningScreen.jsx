import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { ShieldAlert, ChevronRight, Database } from "lucide-react";
import { ThemeContext, AVATAR_PINO, AVATAR_ZORK, tapProps } from "../context/ThemeContext.jsx";
import { CharAvatar, TypewriterText } from "./shared/index.jsx";

const LearningScreen = ({ episode, onComplete }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  const lb = t.labels;
  const [msgIndex, setMsgIndex] = useState(1);
  const [typing, setTyping] = useState(true);
  const [messages, setMessages] = useState([]);
  const [supplement, setSupplement] = useState(null);
  const [dialogueStyle, setDialogueStyle] = useState('chat');
  const [skipTyping, setSkipTyping] = useState(false);
  const scrollRef = useRef(null);
  const init = useRef(false);
  const data = episode.learningPhase;

  useEffect(() => { if(!init.current&&data.length>0){init.current=true;setMessages([data[0]]);setSupplement(data[0].supplement||null);setTyping(true);} }, [data]);
  useEffect(() => { if(dialogueStyle==='chat'&&scrollRef.current) scrollRef.current.scrollTop=scrollRef.current.scrollHeight; }, [messages,typing,dialogueStyle]);

  const handleNext = useCallback(() => {
    if (typing) { setSkipTyping(true); return; }
    if (msgIndex >= data.length) { onComplete(); return; }
    setTyping(true); setSkipTyping(false);
    setMessages(p => [...p, data[msgIndex]]);
    setSupplement(data[msgIndex].supplement || null);
    setMsgIndex(p => p + 1);
  }, [typing, msgIndex, data, onComplete]);

  const handleTypingComplete = useCallback(() => { setTyping(false); setSkipTyping(false); }, []);
  const isT = m => m.speaker === "teacher";
  const names = lb.charNames;
  const currentMsg = messages.length > 0 ? messages[messages.length - 1] : null;

  const MonitorIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>);
  const ChatIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>);

  // ── Chat mode header (shared) ──
  const chatHeader = (
    <>
      <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)",background:ui.barBg,backdropFilter:"blur(8px)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:"10px",letterSpacing:"0.2em",color:"var(--accent)",fontFamily:"var(--font-display)",display:"flex",alignItems:"center",gap:"6px"}}><ShieldAlert size={13} />{lb.investigationLabel}</div>
          <button onClick={(e)=>{e.stopPropagation();setDialogueStyle(p=>p==='novel'?'chat':'novel');}} {...tapProps} style={{
            background:"var(--surface)",border:"1px solid var(--border)",color:"var(--accent)",
            width:"34px",height:"34px",display:"flex",alignItems:"center",justifyContent:"center",
            cursor:"pointer",transition:"all 0.2s",borderRadius:ui.radiusFull,padding:0,
          }} title={dialogueStyle==='novel'?'チャット表示に切替':'モニター表示に切替'}>
            {dialogueStyle === 'novel' ? <ChatIcon /> : <MonitorIcon />}
          </button>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"4px"}}>
          <span style={{fontSize:"13px",color:"var(--text)"}}>{episode.meta.title}</span>
          <span style={{fontSize:"11px",color:"var(--text-dim)",fontFamily:"var(--font-display)"}}>{msgIndex}/{data.length}</span>
        </div>
      </div>
      <div style={{height:"2px",background:"var(--border)"}}><div style={{height:"100%",background:"var(--accent)",width:`${(msgIndex/data.length)*100}%`,transition:"width 0.5s",...(ui.glowShadow?{boxShadow:"0 0 8px var(--accent-glow)"}:{})}}/></div>
    </>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100dvh"}}>
      {dialogueStyle === 'chat' && chatHeader}

      {dialogueStyle === 'chat' ? (
        <>
          <div ref={scrollRef} style={{flex:1,overflowY:"auto",padding:"16px",paddingBottom:"8px"}}>
            {messages.map((msg,i)=>{
              const teacher = isT(msg);
              return (
                <div key={i} style={{display:"flex",flexDirection:teacher?"row":"row-reverse",marginBottom:"14px",gap:"10px",alignItems:"flex-start",animation:"fadeSlideUp 0.3s ease-out"}}>
                  <CharAvatar isTeacher={teacher} size={36} />
                  <div style={{maxWidth:"78%",padding:"10px 14px",background:teacher?"var(--surface)":`${t.vars.secondary}11`,border:`1px solid ${teacher?"var(--border)":`${t.vars.secondary}33`}`,fontSize:"13.5px",lineHeight:1.7,color:"var(--text)",borderRadius:ui.radiusLg}}>
                    {i===messages.length-1&&typing?<TypewriterText text={msg.text} speed={28} onComplete={handleTypingComplete} skip={skipTyping}/>:msg.text}
                  </div>
                </div>
              );
            })}
            {supplement&&!typing&&(
              <div style={{margin:"0 0 14px 46px",padding:"10px 12px",background:"var(--accent-glow)",border:"1px dashed var(--accent)",fontSize:"12px",color:"var(--accent)",lineHeight:1.6,animation:"fadeSlideUp 0.3s ease-out",borderRadius:ui.radius}}>
                <span style={{fontFamily:"var(--font-display)",fontSize:"10px",letterSpacing:"0.15em",display:"block",marginBottom:"4px",opacity:0.7}}>▸ SUPPLEMENT</span>
                {supplement.content}
              </div>
            )}
          </div>
          <div onClick={handleNext} style={{padding:"16px",textAlign:"center",borderTop:"1px solid var(--border)",cursor:"pointer",background:ui.barBg,userSelect:"none",WebkitTapHighlightColor:"transparent"}}>
            {typing?<span style={{fontSize:"12px",color:"var(--text-dim)"}}>……</span>
              :msgIndex>=data.length?<span style={{fontSize:"13px",color:"var(--accent)",fontFamily:"var(--font-display)",letterSpacing:"0.2em",display:"inline-flex",alignItems:"center",gap:"4px"}}>テストへ進む <ChevronRight size={16}/></span>
              :<span style={{fontSize:"12px",color:"var(--text-dim)",animation:"pulse 2s infinite"}}>TAP TO CONTINUE ▸</span>}
          </div>
        </>
      ) : (
        <div onClick={handleNext} style={{flex:1,display:"flex",flexDirection:"column",cursor:"pointer",userSelect:"none",WebkitTapHighlightColor:"transparent",overflow:"hidden"}}>
          {/* ── VN Portrait Area ── */}
          <div style={{flex:1,position:"relative",overflow:"hidden",display:"flex",gap:"6px",padding:"0 4px",background:"var(--bg)"}}>
            {/* Overlaid header info */}
            <div style={{position:"absolute",top:0,left:0,right:0,zIndex:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)"}}>
              <div style={{fontSize:"10px",letterSpacing:"0.15em",color:"var(--text-dim)",fontFamily:"var(--font-display)",display:"flex",alignItems:"center",gap:"4px"}}>
                <Database size={11} /> DB_ACCESS // LOG_{String(msgIndex).padStart(3,'0')}
              </div>
              <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                <span style={{fontSize:"9px",color:"var(--text-dim)",fontFamily:"var(--font-display)",letterSpacing:"0.15em"}}>{lb.investigationLabel}</span>
                <button onClick={(e)=>{e.stopPropagation();setDialogueStyle(p=>p==='novel'?'chat':'novel');}} {...tapProps} style={{
                  background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",color:"var(--accent)",
                  width:"32px",height:"32px",display:"flex",alignItems:"center",justifyContent:"center",
                  cursor:"pointer",transition:"all 0.2s",borderRadius:ui.radiusFull,padding:0,backdropFilter:"blur(4px)",
                }} title="チャット表示に切替">
                  <ChatIcon />
                </button>
              </div>
            </div>
            {/* Progress bar overlay */}
            <div style={{position:"absolute",top:0,left:0,right:0,height:"2px",background:"var(--border)",zIndex:11}}>
              <div style={{height:"100%",background:"var(--accent)",width:`${(msgIndex/data.length)*100}%`,transition:"width 0.5s",...(ui.glowShadow?{boxShadow:"0 0 8px var(--accent-glow)"}:{})}}/>
            </div>
            {/* Student portrait (left) */}
            {(()=>{
              const active = currentMsg && !isT(currentMsg);
              return (
                <div style={{
                  flex:1,position:"relative",overflow:"hidden",borderRadius:"4px",
                  transition:"all 0.5s cubic-bezier(0.22,1,0.36,1)",
                  filter: active ? "brightness(1)" : "brightness(0.25)",
                  opacity: active ? 1 : 0.5,
                }}>
                  <img src={AVATAR_PINO} alt={names[1]} style={{
                    position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
                    objectPosition:"center 15%",
                    transition:"transform 0.5s cubic-bezier(0.22,1,0.36,1)",
                    transform: active ? "scale(1.03)" : "scale(0.97)",
                  }} />
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:"25%",background:"linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 100%)"}} />
                </div>
              );
            })()}
            {/* Teacher portrait (right) */}
            {(()=>{
              const active = currentMsg && isT(currentMsg);
              return (
                <div style={{
                  flex:1,position:"relative",overflow:"hidden",borderRadius:"4px",
                  transition:"all 0.5s cubic-bezier(0.22,1,0.36,1)",
                  filter: active ? "brightness(1)" : "brightness(0.25)",
                  opacity: active ? 1 : 0.5,
                }}>
                  <img src={AVATAR_ZORK} alt={names[0]} style={{
                    position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
                    objectPosition:"center 15%",
                    transition:"transform 0.5s cubic-bezier(0.22,1,0.36,1)",
                    transform: active ? "scale(1.03)" : "scale(0.97)",
                  }} />
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:"25%",background:"linear-gradient(0deg, rgba(0,0,0,0.4) 0%, transparent 100%)"}} />
                  {active && <div style={{position:"absolute",inset:0,borderRadius:"4px",border:"2px solid var(--accent)",boxShadow:"inset 0 0 20px rgba(0,255,136,0.1), 0 0 15px rgba(0,255,136,0.15)",pointerEvents:"none"}} />}
                </div>
              );
            })()}
          </div>

          {/* ── VN Text Box ── */}
          <div style={{
            background:ui.barBg,backdropFilter:"blur(12px)",
            borderTop:`${ui.borderWidth} ${ui.borderStyle} var(--border)`,
            padding:"14px 18px 16px",minHeight:"150px",position:"relative",
          }}>
            {currentMsg && (
              <div style={{
                display:"inline-block",marginBottom:"6px",
                padding:"3px 14px",fontSize:"11px",fontFamily:"var(--font-display)",letterSpacing:"0.15em",
                background:isT(currentMsg)?"var(--surface)":"var(--surface)",
                border:`1px solid ${isT(currentMsg)?"var(--accent)":"var(--secondary)"}`,
                color:isT(currentMsg)?"var(--accent)":"var(--secondary)",
                borderRadius:ui.radius,
              }}>{isT(currentMsg)?names[0]:names[1]}</div>
            )}
            <div style={{fontSize:"14.5px",lineHeight:1.9,color:"var(--text)",minHeight:"60px"}}>
              {currentMsg && (typing ? <TypewriterText key={messages.length} text={currentMsg.text} speed={28} onComplete={handleTypingComplete} skip={skipTyping} /> : currentMsg.text)}
            </div>
            {supplement && !typing && (
              <div style={{marginTop:"12px",padding:"8px 10px",background:"var(--accent-glow)",border:"1px dashed var(--accent)",fontSize:"11px",color:"var(--accent)",lineHeight:1.6,animation:"fadeSlideUp 0.3s ease-out",borderRadius:ui.radius}}>
                <span style={{fontFamily:"var(--font-display)",fontSize:"9px",letterSpacing:"0.15em",opacity:0.7}}>▸ SUPPLEMENT </span>
                {supplement.content}
              </div>
            )}
            <div style={{position:"absolute",bottom:"6px",right:"14px"}}>
              {typing?<span style={{fontSize:"11px",color:"var(--text-dim)"}}>……</span>
                :msgIndex>=data.length?<span style={{fontSize:"11px",color:"var(--accent)",fontFamily:"var(--font-display)",letterSpacing:"0.15em",animation:"pulse 2s infinite",display:"inline-flex",alignItems:"center",gap:"2px"}}>テストへ <ChevronRight size={14}/></span>
                :<span style={{fontSize:"14px",color:"var(--accent)",animation:"pulse 2s infinite"}}>▸</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningScreen;

import { useState, useEffect, useContext, useCallback } from "react";
import { ShieldAlert, FlaskConical, ChevronRight, Share2 } from "lucide-react";
import { ThemeContext, tapProps } from "../context/ThemeContext.jsx";
import { GlitchText, TBox, TitleDivider } from "./shared/index.jsx";

const ResultScreen = ({ episode, confirmScore, exploreScore, onHome }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  const lb = t.labels;
  const [show,setShow]=useState(0);
  const totalQ=episode.testPhase.confirm.length+episode.testPhase.explore.length;
  const totalScore=confirmScore+exploreScore;
  useEffect(()=>{setTimeout(()=>setShow(1),300);setTimeout(()=>setShow(2),1000);setTimeout(()=>setShow(3),1800);},[]);
  const rank=totalScore===totalQ?"S":totalScore>=totalQ*0.8?"A":totalScore>=totalQ*0.5?"B":"C";
  const rc={S:"#ffd700",A:"var(--accent)",B:"var(--secondary)",C:"var(--text-dim)"}[rank];

  const shareText = `【地球人調査センター】\n${episode.meta.title}\nランク${rank} (${totalScore}/${totalQ}正解)\n#地球人調査センター`;
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try { await navigator.share({ text: shareText }); } catch { /* ユーザーがキャンセル */ }
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank", "noopener");
    }
  }, [shareText]);

  return (
    <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 20px",position:"relative",overflow:"hidden"}}>
      <div style={{
        position:"absolute",top:"50%",left:"50%",
        transform:"translate(-50%,-50%) rotate(-12deg)",
        fontSize: lb.watermark.length <= 2 ? "min(200px,45vw)" : "min(120px,28vw)",
        fontWeight:900,fontFamily:"var(--font-display)",
        color:"var(--accent)",opacity:0.04,
        border:`8px solid`,borderColor:"var(--accent)",
        padding:"10px 30px",letterSpacing:"0.1em",
        pointerEvents:"none",whiteSpace:"nowrap",
        borderRadius:ui.radius,
        transition:"opacity 1s",
        ...(show>=1?{opacity:0.04}:{opacity:0}),
      }}>{lb.watermark}</div>

      <div style={{opacity:show>=1?1:0,transform:show>=1?"none":"scale(0.9)",transition:"all 0.8s",textAlign:"center",marginBottom:"32px",position:"relative"}}>
        {ui.stampFrame && (
          <div style={{
            position:"absolute",inset:"-10px -16px",
            border:"3px solid var(--accent)",
            transform:"rotate(-2deg)",
            borderRadius:ui.radius,
            opacity:show>=1?0.25:0,transition:"opacity 0.8s 0.3s",
            pointerEvents:"none",
          }}/>
        )}
        <div style={{fontSize:"10px",letterSpacing:"0.4em",color:"var(--accent)",fontFamily:"var(--font-display)",marginBottom:"16px"}}>{lb.caseClosedLabel}</div>
        <GlitchText as="div" style={{fontFamily:"var(--font-display)",fontSize:"clamp(28px,8vw,42px)",color:"var(--primary)",letterSpacing:"0.1em",lineHeight:1.3,fontWeight:ui.fontWeightDisplay}}>
          {lb.caseClosedTitle}
        </GlitchText>
        <TitleDivider style={{ marginTop: "16px" }} />
        <div style={{fontSize:"13px",color:"var(--text-dim)",lineHeight:1.6}}>{episode.meta.title}</div>
      </div>

      <div style={{opacity:show>=2?1:0,transform:show>=2?"none":"translateY(20px)",transition:"all 0.8s",textAlign:"center",marginBottom:"32px"}}>
        <div style={{width:"80px",height:"80px",border:`3px solid ${rc}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:`0 0 30px ${rc}44`,borderRadius:ui.radiusFull}}>
          <span style={{fontFamily:"var(--font-display)",fontSize:"40px",color:rc}}>{rank}</span>
        </div>
        <div style={{fontSize:"13px",color:"var(--text-dim)",fontFamily:"var(--font-display)"}}>{totalScore}/{totalQ} 正解</div>
      </div>

      <TBox style={{width:"100%",maxWidth:"320px",marginBottom:"32px",opacity:show>=3?1:0,transform:show>=3?"none":"translateY(20px)",transition:"all 0.8s"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"12px",fontSize:"13px"}}>
          <span style={{color:"var(--text-dim)",display:"flex",alignItems:"center",gap:"6px"}}><ShieldAlert size={13}/>確認（選択式）</span>
          <span style={{color:"var(--accent)",fontFamily:"var(--font-display)"}}>{confirmScore}/{episode.testPhase.confirm.length}</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"13px"}}>
          <span style={{color:"var(--text-dim)",display:"flex",alignItems:"center",gap:"6px"}}><FlaskConical size={13}/>探究（穴埋め）</span>
          <span style={{color:"var(--secondary)",fontFamily:"var(--font-display)"}}>{exploreScore}/{episode.testPhase.explore.length}</span>
        </div>
      </TBox>

      <button onClick={handleShare} {...tapProps} style={{
        padding:"14px 40px",background:"var(--accent)",
        border:`${ui.borderWidth} ${ui.borderStyle} var(--accent)`,color:"var(--bg)",
        fontFamily:"var(--font-display)",fontSize:"13px",letterSpacing:"0.25em",
        cursor:"pointer",transition:"all 0.3s",opacity:show>=3?1:0,borderRadius:ui.radius,
        display:"inline-flex",alignItems:"center",gap:"8px",marginBottom:"12px",
        fontWeight:"bold",
      }}>
        <Share2 size={16} />シェアする
      </button>

      <button onClick={onHome} {...tapProps} style={{
        padding:"14px 40px",background:"transparent",
        border:`${ui.borderWidth} ${ui.borderStyle} var(--accent)`,color:"var(--accent)",
        fontFamily:"var(--font-display)",fontSize:"13px",letterSpacing:"0.25em",
        cursor:"pointer",transition:"all 0.3s",opacity:show>=3?1:0,borderRadius:ui.radius,
        display:"inline-flex",alignItems:"center",gap:"6px",
      }}
        onMouseEnter={e=>{e.target.style.background="var(--accent)";e.target.style.color="var(--bg)";}}
        onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="var(--accent)";}}
      >ホームに戻る <ChevronRight size={16} /></button>
    </div>
  );
};

export default ResultScreen;

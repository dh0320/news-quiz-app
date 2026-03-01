import { useState, useContext } from "react";
import { ShieldAlert, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { ThemeContext, tapProps } from "../context/ThemeContext.jsx";
import { TBox } from "./shared/index.jsx";

const ConfirmScreen = ({ episode, onComplete, onScore }) => {
  const t = useContext(ThemeContext);
  const ui = t.uiStyle;
  const lb = t.labels;
  const qs = episode.testPhase.confirm;
  const [qi, setQi] = useState(0);
  const [sel, setSel] = useState(null);
  const [ans, setAns] = useState(false);
  const [score, setScore] = useState(0);
  const q = qs[qi];
  const isCorrect = ans && sel === q.correctIndex;

  const pick = i=>{ if(ans)return; setSel(i); setAns(true); if(i===q.correctIndex) setScore(p=>p+1); };
  const next = ()=>{ if(qi+1>=qs.length){onScore(score);onComplete();}else{setQi(p=>p+1);setSel(null);setAns(false);} };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100dvh"}}>
      <div style={{padding:"12px 16px",borderBottom:"1px solid var(--border)",background:ui.barBg}}>
        <div style={{fontSize:"10px",letterSpacing:"0.2em",color:"var(--accent)",fontFamily:"var(--font-display)",display:"flex",alignItems:"center",gap:"6px"}}><ShieldAlert size={13} />{lb.confirmLabel}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"4px"}}>
          <span style={{fontSize:"13px",color:"var(--text)"}}>選択式テスト</span>
          <span style={{fontSize:"12px",color:"var(--text-dim)",fontFamily:"var(--font-display)"}}>Q{qi+1}/{qs.length}</span>
        </div>
      </div>
      <div style={{height:"2px",background:"var(--border)"}}><div style={{height:"100%",background:"var(--accent)",width:`${((qi+(ans?1:0))/qs.length)*100}%`,transition:"width 0.5s",...(ui.glowShadow?{boxShadow:"0 0 8px var(--accent-glow)"}:{})}}/></div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px"}}>
        <TBox style={{marginBottom:"20px"}}><div style={{fontSize:"14px",lineHeight:1.8,color:"var(--text)"}}>{q.question}</div></TBox>
        {ans && (
          <div style={{
            padding:"14px 16px",marginBottom:"14px",display:"flex",alignItems:"center",gap:"12px",
            background:isCorrect?"var(--accent-glow)":`${t.vars.error}14`,
            border:`1px solid ${isCorrect?"var(--accent)":"var(--error)"}`,
            borderRadius:ui.radius,animation:"fadeSlideUp 0.3s ease-out",
          }}>
            {isCorrect ? <CheckCircle2 size={22} color="var(--accent)" /> : <XCircle size={22} color="var(--error)" />}
            <span style={{fontSize:"17px",fontWeight:"bold",letterSpacing:"0.15em",color:isCorrect?"var(--accent)":"var(--error)",fontFamily:"var(--font-display)"}}>
              {isCorrect ? lb.correctBanner : lb.wrongBanner}
            </span>
          </div>
        )}
        {q.choices.map((c,i)=>{
          let bc="var(--border)",bg="var(--surface)",tc="var(--text)";
          if(ans){if(i===q.correctIndex){bc="var(--accent)";bg="var(--accent-glow)";tc="var(--accent)";}else if(i===sel){bc="var(--error)";bg=`${t.vars.error}14`;tc="var(--error)";}else tc="var(--text-dim)";}
          return (
            <div key={i} onClick={()=>pick(i)} {...(ans?{}:tapProps)} style={{padding:"14px 16px",marginBottom:"10px",cursor:ans?"default":"pointer",border:`1px solid ${bc}`,background:bg,color:tc,fontSize:"13.5px",lineHeight:1.6,transition:"all 0.3s",display:"flex",alignItems:"center",gap:"12px",borderRadius:ui.radius}}>
              <span style={{width:"24px",height:"24px",minWidth:"24px",border:`1px solid ${bc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontFamily:"var(--font-display)",borderRadius:ui.radiusFull}}>
                {ans&&i===q.correctIndex?"✓":ans&&i===sel?"✗":String.fromCharCode(65+i)}
              </span>{c}
            </div>
          );
        })}
        {ans&&(<div style={{marginTop:"16px",padding:"14px",background:"var(--accent-glow)",border:"1px solid var(--border)",animation:"fadeSlideUp 0.3s ease-out",borderRadius:ui.radius}}>
          <div style={{fontSize:"10px",letterSpacing:"0.15em",color:"var(--accent)",fontFamily:"var(--font-display)",marginBottom:"6px"}}>▸ ANALYSIS</div>
          <div style={{fontSize:"12.5px",lineHeight:1.7,color:"var(--text-dim)"}}>{q.explanation}</div>
        </div>)}
      </div>
      {ans&&(<div onClick={next} {...tapProps} style={{padding:"16px",textAlign:"center",borderTop:"1px solid var(--border)",cursor:"pointer",background:ui.barBg}}>
        <span style={{fontSize:"13px",color:"var(--accent)",fontFamily:"var(--font-display)",letterSpacing:"0.2em",display:"inline-flex",alignItems:"center",gap:"4px"}}>{qi+1>=qs.length?"探究フェーズへ":"次の問題へ"}<ChevronRight size={16} /></span>
      </div>)}
    </div>
  );
};

export default ConfirmScreen;

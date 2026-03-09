import { useState, useRef } from "react";

const FREE_LIMIT = 10;
const CATEGORIES = [
  "👗 Fashion & Clothing","👟 Footwear","💄 Beauty & Skincare",
  "📱 Electronics & Gadgets","🏠 Home Decor & Furniture",
  "🍽️ Food & Snacks","💊 Health & Wellness","🎒 Bags & Accessories",
  "🧸 Kids & Toys","📦 Other",
];
const TONES = [
  { id:"urgent", label:"🔥 Urgent & Exciting", desc:"Creates FOMO, limited stock energy" },
  { id:"friendly", label:"😊 Casual & Friendly", desc:"Like a friend recommending it" },
  { id:"premium", label:"✨ Premium & Elegant", desc:"High-value, aspirational feel" },
];
const LANGS = [
  { id:"english", flag:"🇬🇧", label:"English" },
  { id:"hindi", flag:"🇮🇳", label:"Hindi" },
  { id:"hinglish", flag:"🤝", label:"Hinglish" },
];
const G = {
  bg:"#F7F4EE", card:"#FFFFFF", green:"#1DAA61", greenDark:"#128C7E",
  greenLight:"#DCF8C6", greenPale:"#F0FBF4", ink:"#1A1A1A",
  muted:"#8A8A8A", border:"#E8E4DC", accent:"#FF6B2B",
  accentPale:"#FFF3ED", chat:"#ECE5DD",
};

function getUsage() {
  try {
    if (typeof window === "undefined") return 0;
    const d = JSON.parse(localStorage.getItem("wc_usage") || "{}");
    const month = new Date().toISOString().slice(0,7);
    if (d.month !== month) return 0;
    return d.count || 0;
  } catch { return 0; }
}
function saveUsage(n) {
  try {
    localStorage.setItem("wc_usage", JSON.stringify({
      month: new Date().toISOString().slice(0,7), count: n
    }));
  } catch {}
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); }}
      style={{ padding:"7px 14px", borderRadius:8, border:`1.5px solid ${copied?G.green:G.border}`,
        background: copied?G.greenPale:"#fff", color: copied?G.green:G.muted,
        fontSize:12, fontWeight:600, cursor:"pointer" }}>
      {copied ? "✓ Copied!" : "📋 Copy"}
    </button>
  );
}

function Bubble({ text }) {
  const now = new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  return (
    <div style={{ background:G.chat, borderRadius:14, padding:"14px 16px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${G.border}` }}>
        <div style={{ width:36, height:36, borderRadius:"50%", background:G.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>🛍️</div>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:G.ink }}>My Shop</div>
          <div style={{ fontSize:11, color:G.green }}>online</div>
        </div>
      </div>
      <div style={{ background:"#fff", borderRadius:"0 12px 12px 12px", padding:"12px 14px", boxShadow:"0 1px 4px rgba(0,0,0,0.08)", maxWidth:"85%", position:"relative" }}>
        <div style={{ position:"absolute", top:0, left:-8, width:0, height:0, borderTop:"8px solid #fff", borderLeft:"8px solid transparent" }} />
        <p style={{ fontSize:13, color:G.ink, lineHeight:1.65, whiteSpace:"pre-wrap", margin:0 }}>{text}</p>
        <div style={{ fontSize:10, color:G.muted, textAlign:"right", marginTop:6 }}>{now} ✓✓</div>
      </div>
    </div>
  );
}

function UpgradeModal({ onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:20 }} onClick={onClose}>
      <div style={{ background:G.card, borderRadius:20, padding:"36px 32px", maxWidth:400, width:"100%" }} onClick={e=>e.stopPropagation()}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:44, marginBottom:12 }}>🚀</div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:8 }}>You've Hit the Free Limit!</h2>
          <p style={{ color:G.muted, fontSize:14, lineHeight:1.6 }}>Upgrade to Pro for unlimited copies every month.</p>
        </div>
        <div style={{ background:G.greenPale, border:`2px solid ${G.green}`, borderRadius:14, padding:"20px 22px", marginBottom:20 }}>
          <div style={{ fontSize:11, letterSpacing:3, color:G.green, textTransform:"uppercase", marginBottom:6 }}>Pro Plan</div>
          <div style={{ fontSize:32, fontWeight:800, marginBottom:8 }}>₹199<span style={{ fontSize:14, fontWeight:400, color:G.muted }}>/month</span></div>
          {["Unlimited copies","All 3 languages","All tones","Priority support"].map(f=>(
            <div key={f} style={{ display:"flex", gap:8, marginTop:8 }}>
              <span style={{ color:G.green }}>✓</span>
              <span style={{ fontSize:13 }}>{f}</span>
            </div>
          ))}
        </div>
        <button style={{ width:"100%", padding:14, borderRadius:12, border:"none", background:G.green, color:"#fff", fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:10 }}>
          Upgrade Now — ₹199/month
        </button>
        <button onClick={onClose} style={{ width:"100%", padding:12, borderRadius:12, border:`1px solid ${G.border}`, background:"transparent", color:G.muted, fontSize:14, cursor:"pointer" }}>
          Maybe Later
        </button>
      </div>
    </div>
  );
}

export default function WhatsCopyAI() {
  const [screen, setScreen] = useState("landing");
  const [lang, setLang] = useState("english");
  const [tone, setTone] = useState("urgent");
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [features, setFeatures] = useState("");
  const [price, setPrice] = useState("");
  const [copies, setCopies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [error, setError] = useState("");
  const outputRef = useRef(null);

  // Load usage on client
  useState(() => { setUsage(getUsage()); });

  const canGenerate = productName.trim().length > 1 && category && features.trim().length > 5;

  const generate = async () => {
    if (usage >= FREE_LIMIT) { setShowUpgrade(true); return; }
    if (!canGenerate) return;
    setLoading(true); setCopies([]); setError("");
    const langMap = { english:"English", hindi:"Hindi (Devanagari script)", hinglish:"Hinglish (mix of Hindi and English, Roman script)" };
    const toneMap = {
      urgent:"urgent, exciting, FOMO-creating — use emojis, limited stock language",
      friendly:"casual and friendly — like a trusted friend recommending a product",
      premium:"premium and elegant — sophisticated, aspirational, focus on quality",
    };
    const prompt = `You are an expert WhatsApp product copywriter for Indian small businesses.
Write 3 unique WhatsApp product description copies.
Product: ${productName}
Category: ${category}
Features: ${features}
${price ? `Price: ${price}` : ""}
Language: ${langMap[lang]}
Tone: ${toneMap[tone]}
Rules: 80-160 chars each, include emojis, genuinely different angles, end with buying CTA.
Return ONLY valid JSON: {"copies":["copy1","copy2","copy3"]}`;

    try {
      const res = await fetch("/api/generate", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{ role:"user", content:prompt }] }),
      });
      const data = await res.json();
      const raw = data.content?.[0]?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g,"").trim());
      setCopies(parsed.copies || []);
      const n = usage + 1; setUsage(n); saveUsage(n);
      setTimeout(()=>outputRef.current?.scrollIntoView({behavior:"smooth"}),100);
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  const inp = (val, setter, ph, ml) => (
    <input value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
      style={{ width:"100%", padding:"12px 14px", borderRadius:10, fontSize:14,
        border:`1.5px solid ${val.length>(ml||0)?G.green:G.border}`, outline:"none",
        color:G.ink, background:"#fff", boxSizing:"border-box" }}
      onFocus={e=>e.target.style.borderColor=G.green}
      onBlur={e=>e.target.style.borderColor=val.length>(ml||0)?G.green:G.border} />
  );

  if (screen === "landing") return (
    <div style={{ minHeight:"100vh", background:G.bg, fontFamily:"system-ui,sans-serif" }}>
      <nav style={{ padding:"16px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", background:G.card, borderBottom:`1px solid ${G.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:G.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💬</div>
          <span style={{ fontWeight:800, fontSize:18, color:G.ink }}>WhatsCopy<span style={{ color:G.green }}>AI</span></span>
        </div>
        <button onClick={()=>setScreen("app")} style={{ padding:"10px 22px", borderRadius:10, background:G.green, border:"none", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer" }}>
          Try Free →
        </button>
      </nav>
      <div style={{ maxWidth:860, margin:"0 auto", padding:"80px 24px", textAlign:"center" }}>
        <div style={{ display:"inline-block", background:G.accentPale, border:`1px solid ${G.accent}30`, borderRadius:99, padding:"6px 18px", marginBottom:28, fontSize:13, color:G.accent, fontWeight:600 }}>
          🇮🇳 India's #1 WhatsApp Copy Generator
        </div>
        <h1 style={{ fontSize:"clamp(36px,6vw,58px)", fontWeight:800, color:G.ink, lineHeight:1.1, marginBottom:20, letterSpacing:"-1.5px" }}>
          Write Killer WhatsApp<br /><span style={{ color:G.green }}>Product Copies</span> in Seconds
        </h1>
        <p style={{ fontSize:18, color:G.muted, maxWidth:500, margin:"0 auto 40px", lineHeight:1.7 }}>
          Stop wasting hours writing product descriptions. AI writes 3 ready-to-send copies in English, Hindi, or Hinglish — instantly.
        </p>
        <button onClick={()=>setScreen("app")} style={{ padding:"16px 44px", borderRadius:14, background:G.green, border:"none", color:"#fff", fontWeight:800, fontSize:17, cursor:"pointer", boxShadow:`0 8px 30px ${G.green}50` }}>
          Generate Free Copy →
        </button>
        <div style={{ fontSize:13, color:G.muted, marginTop:14 }}>No signup · 10 free copies/month · Hindi + Hinglish support</div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginTop:60 }}>
          {[["⚡","3 Variations Instantly","Get 3 unique copies — pick the best one"],
            ["🇮🇳","Hindi & Hinglish","Native language copies that feel natural"],
            ["📱","WhatsApp Preview","See exactly how it'll look before you send"],
            ["🎯","3 Tones","Urgent, Friendly, or Premium vibe"]].map(([icon,title,desc])=>(
            <div key={title} style={{ background:G.card, borderRadius:16, padding:"22px 18px", border:`1px solid ${G.border}`, textAlign:"left" }}>
              <div style={{ fontSize:28, marginBottom:10 }}>{icon}</div>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>{title}</div>
              <div style={{ fontSize:13, color:G.muted, lineHeight:1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:G.bg, fontFamily:"system-ui,sans-serif" }}>
      {showUpgrade && <UpgradeModal onClose={()=>setShowUpgrade(false)} />}
      <nav style={{ padding:"12px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", background:G.card, borderBottom:`1px solid ${G.border}`, position:"sticky", top:0, zIndex:100 }}>
        <button onClick={()=>setScreen("landing")} style={{ display:"flex", alignItems:"center", gap:8, background:"none", border:"none", cursor:"pointer" }}>
          <div style={{ width:30, height:30, borderRadius:8, background:G.green, display:"flex", alignItems:"center", justifyContent:"center" }}>💬</div>
          <span style={{ fontWeight:800, fontSize:16, color:G.ink }}>WhatsCopy<span style={{ color:G.green }}>AI</span></span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:72, height:5, background:G.border, borderRadius:99, overflow:"hidden" }}>
            <div style={{ width:`${Math.min((usage/FREE_LIMIT)*100,100)}%`, height:"100%", background:usage>=FREE_LIMIT?G.accent:G.green, borderRadius:99 }} />
          </div>
          <span style={{ fontSize:12, color:usage>=FREE_LIMIT?G.accent:G.muted, fontWeight:600 }}>{usage}/{FREE_LIMIT} free</span>
        </div>
      </nav>

      <div style={{ maxWidth:920, margin:"0 auto", padding:"28px 20px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
        {/* LEFT: Form */}
        <div style={{ background:G.card, borderRadius:20, padding:"28px 24px", border:`1px solid ${G.border}`, height:"fit-content" }}>
          <h2 style={{ fontSize:18, fontWeight:800, marginBottom:22 }}>📝 Your Product Details</h2>

          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:7 }}>Product Name *</label>
            {inp(productName, setProductName, "e.g. Handmade Silk Kurta...", 1)}
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:7 }}>Category *</label>
            <select value={category} onChange={e=>setCategory(e.target.value)}
              style={{ width:"100%", padding:"12px 14px", borderRadius:10, fontSize:14, border:`1.5px solid ${category?G.green:G.border}`, outline:"none", background:"#fff", cursor:"pointer" }}>
              <option value="">Select a category…</option>
              {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:7 }}>Key Features *</label>
            <textarea value={features} onChange={e=>setFeatures(e.target.value)}
              placeholder="e.g. Pure cotton, handmade, 5 colors, free shipping..." rows={3}
              style={{ width:"100%", padding:"12px 14px", borderRadius:10, fontSize:14, border:`1.5px solid ${features.length>5?G.green:G.border}`, outline:"none", resize:"vertical", lineHeight:1.6, boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor=G.green}
              onBlur={e=>e.target.style.borderColor=features.length>5?G.green:G.border} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:7 }}>Price <span style={{ fontWeight:400, color:G.muted }}>(optional)</span></label>
            {inp(price, setPrice, "e.g. ₹499, ₹999 (was ₹1,499)...")}
          </div>

          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:10 }}>Language</label>
            <div style={{ display:"flex", gap:8 }}>
              {LANGS.map(l=>(
                <button key={l.id} onClick={()=>setLang(l.id)} style={{ flex:1, padding:"10px 6px", borderRadius:10, cursor:"pointer", border:`1.5px solid ${lang===l.id?G.green:G.border}`, background:lang===l.id?G.greenPale:"#fff", color:lang===l.id?G.greenDark:G.muted, fontWeight:lang===l.id?700:400, fontSize:13, textAlign:"center" }}>
                  <div style={{ fontSize:18, marginBottom:3 }}>{l.flag}</div>{l.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:13, fontWeight:600, display:"block", marginBottom:10 }}>Tone</label>
            {TONES.map(t=>(
              <button key={t.id} onClick={()=>setTone(t.id)} style={{ width:"100%", padding:"11px 14px", borderRadius:10, cursor:"pointer", textAlign:"left", border:`1.5px solid ${tone===t.id?G.green:G.border}`, background:tone===t.id?G.greenPale:"#fff", marginBottom:8 }}>
                <span style={{ fontSize:14, fontWeight:600, color:tone===t.id?G.greenDark:G.ink }}>{t.label}</span>
                <span style={{ fontSize:12, color:G.muted, marginLeft:8 }}>{t.desc}</span>
              </button>
            ))}
          </div>

          <button onClick={generate} disabled={!canGenerate||loading} style={{ width:"100%", padding:15, borderRadius:12, border:"none", background:canGenerate&&!loading?G.green:G.border, color:canGenerate&&!loading?"#fff":G.muted, fontWeight:800, fontSize:16, cursor:canGenerate&&!loading?"pointer":"not-allowed", boxShadow:canGenerate&&!loading?`0 6px 24px ${G.green}40`:"none" }}>
            {loading ? "✍️ Writing Copies…" : usage>=FREE_LIMIT ? "🔒 Upgrade to Generate" : `✨ Generate Now (${FREE_LIMIT-usage} left)`}
          </button>
          {error && <p style={{ color:"red", fontSize:13, marginTop:10, textAlign:"center" }}>{error}</p>}
        </div>

        {/* RIGHT: Output */}
        <div ref={outputRef}>
          {!loading && copies.length===0 && (
            <div style={{ background:G.card, borderRadius:20, padding:"40px 24px", border:`1px dashed ${G.border}`, textAlign:"center" }}>
              <div style={{ fontSize:52, marginBottom:16 }}>💬</div>
              <div style={{ fontWeight:700, fontSize:16, marginBottom:8 }}>Your copies will appear here</div>
              <p style={{ fontSize:13, color:G.muted, lineHeight:1.7 }}>Fill in your product details and hit Generate.</p>
            </div>
          )}
          {loading && (
            <div style={{ background:G.card, borderRadius:20, padding:"28px 24px", border:`1px solid ${G.border}`, textAlign:"center", color:G.muted, fontSize:15 }}>
              ✍️ AI is writing your copies…
            </div>
          )}
          {!loading && copies.length>0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <h3 style={{ fontSize:16, fontWeight:800 }}>🎉 3 Copies Ready!</h3>
                <button onClick={generate} style={{ padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, border:`1.5px solid ${G.green}`, background:"transparent", color:G.green, cursor:"pointer" }}>↻ Regenerate</button>
              </div>
              {copies.map((copy,i)=>(
                <div key={i} style={{ background:G.card, borderRadius:16, border:`1px solid ${G.border}`, overflow:"hidden" }}>
                  <div style={{ padding:"12px 18px", background:G.greenPale, borderBottom:`1px solid ${G.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontWeight:700, fontSize:14, color:G.greenDark }}>{["⚡ Variation A","💬 Variation B","🌟 Variation C"][i]}</span>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <span style={{ fontSize:11, color:G.muted }}>{copy.length} chars</span>
                      <CopyBtn text={copy} />
                    </div>
                  </div>
                  <div style={{ padding:"16px 18px" }}><Bubble text={copy} /></div>
                </div>
              ))}
              <div style={{ background:usage>=FREE_LIMIT?G.accentPale:G.greenPale, border:`1px solid ${usage>=FREE_LIMIT?G.accent+"40":G.green+"40"}`, borderRadius:12, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, color:usage>=FREE_LIMIT?G.accent:G.greenDark }}>
                  {usage>=FREE_LIMIT ? "🔒 Free limit reached — upgrade for unlimited." : `✅ ${FREE_LIMIT-usage} free copies remaining`}
                </span>
                {usage>=FREE_LIMIT && <button onClick={()=>setShowUpgrade(true)} style={{ padding:"6px 14px", borderRadius:8, background:G.accent, border:"none", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer" }}>Upgrade</button>}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@media(max-width:640px){.grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}

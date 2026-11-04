// src/systems/QuestionSystem.js
// 🌟 修正版：
// 1. 中文科徹底刪除「成語補字」，只保留「例句填充」與「字詞釋義」
// 2. 人文科與科學科所有分類題強制補齊 categories + items 完整文字，絕不出現無項目提示的 A, B, C, D
// 3. 內建全部 25 幅無 Emoji 純幾何矢量 SVG 教學圖

import * as QuestionModule from '../data/questions.js';
import * as ChiModule from '../data/questions_chi.js';
import * as EngModule from '../data/questions_eng.js';
import * as SciModule from '../data/questions_sci.js';
import * as HumModule from '../data/questions_hum.js';

export const MASTER_SVG_LIBRARY = {
    male_sys: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120"><rect width="420" height="120" fill="#f8fafc" rx="6"/><text x="210" y="18" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">男性的生殖系統結構簡圖</text><ellipse cx="210" cy="38" rx="26" ry="13" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/><path d="M175,90 C160,55 182,35 204,46" fill="none" stroke="#ef4444" stroke-width="3"/><path d="M245,90 C260,55 238,35 216,46" fill="none" stroke="#ef4444" stroke-width="3"/><rect x="52" y="18" width="60" height="22" rx="4" fill="#ffffff" stroke="#0d9488" stroke-width="2"/><text x="82" y="33" font-size="13" font-weight="bold" fill="#be123c" text-anchor="middle">(2)</text><line x1="112" y1="29" x2="174" y2="46" stroke="#16a34a" stroke-width="2"/><rect x="201" y="50" width="18" height="44" rx="8" fill="#fed7aa" stroke="#9a3412" stroke-width="2"/><line x1="210" y1="46" x2="210" y2="94" stroke="#ca8a04" stroke-width="2" stroke-dasharray="3,2"/><rect x="52" y="54" width="60" height="22" rx="4" fill="#ffffff" stroke="#0d9488" stroke-width="2"/><text x="82" y="69" font-size="13" font-weight="bold" fill="#be123c" text-anchor="middle">(3)</text><line x1="112" y1="65" x2="201" y2="70" stroke="#16a34a" stroke-width="2"/><ellipse cx="175" cy="90" rx="13" ry="16" fill="#fed7aa" stroke="#9a3412" stroke-width="2"/><ellipse cx="245" cy="90" rx="13" ry="16" fill="#fed7aa" stroke="#9a3412" stroke-width="2"/><ellipse cx="175" cy="90" rx="8" ry="11" fill="#f43f5e"/><ellipse cx="245" cy="90" rx="8" ry="11" fill="#f43f5e"/><rect x="295" y="78" width="60" height="22" rx="4" fill="#ffffff" stroke="#0d9488" stroke-width="2"/><text x="325" y="93" font-size="13" font-weight="bold" fill="#be123c" text-anchor="middle">(1)</text><line x1="255" y1="90" x2="295" y2="89" stroke="#16a34a" stroke-width="2"/></svg>`,
    female_sys: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 120"><rect width="420" height="120" fill="#fdf2f8" rx="6"/><text x="210" y="18" font-size="13" font-weight="bold" fill="#831843" text-anchor="middle">女性的生殖系統結構簡圖</text><path d="M140,52 Q170,26 200,42 M280,52 Q250,26 220,42" fill="none" stroke="#ec4899" stroke-width="6" stroke-linecap="round"/><rect x="52" y="16" width="56" height="22" rx="4" fill="#ffffff" stroke="#0d9488" stroke-width="2"/><text x="80" y="31" font-size="13" font-weight="bold" fill="#be123c" text-anchor="middle">(2)</text><line x1="108" y1="27" x2="168" y2="35" stroke="#16a34a" stroke-width="2"/><ellipse cx="136" cy="58" rx="15" ry="10" fill="#fed7aa" stroke="#db2777" stroke-width="2"/><ellipse cx="284" cy="58" rx="15" ry="10" fill="#fed7aa" stroke="#db2777" stroke-width="2"/><rect x="42" y="54" width="56" height="22" rx="4" fill="#ffffff" stroke="#0d9488" stroke-width="2"/><text x="70" y="69" font-size="13" font-weight="bold" fill="#be123c" text-anchor="middle">(1)</text><line x1="98" y1="65" x2="122" y2="58" stroke="#16a34a" stroke-width="2"/><polygon points="184,40 236,40 222,82 216,104 204,104 198,82" fill="#f472b6" stroke="#9d174d" stroke-width="2.5"/><polygon points="194,48 226,48 215,76 205,76" fill="#be185d"/><rect x="305" y="46" width="56" height="22" rx="4" fill="#ffffff" stroke="#0d9488" stroke-width="2"/><text x="333" y="61" font-size="13" font-weight="bold" fill="#be123c" text-anchor="middle">(3)</text><line x1="226" y1="58" x2="305" y2="57" stroke="#16a34a" stroke-width="2"/></svg>`,
    teen_psych: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#fffbeb" rx="6"/><rect x="16" y="8" width="182" height="98" rx="6" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/><ellipse cx="62" cy="54" rx="24" ry="32" fill="#bae6fd" stroke="#0369a1" stroke-width="3"/><circle cx="122" cy="44" r="14" fill="#fed7aa" stroke="#1e293b" stroke-width="2"/><rect x="108" y="60" width="28" height="30" rx="4" fill="#2563eb"/><text x="107" y="101" font-size="11" font-weight="bold" fill="#0f172a" text-anchor="middle">(1) 照鏡整理髮型與衣着</text><rect x="222" y="8" width="182" height="98" rx="6" fill="#f3e8ff" stroke="#7e22ce" stroke-width="2"/><circle cx="268" cy="46" r="13" fill="#fed7aa" stroke="#1e293b" stroke-width="2"/><rect x="256" y="61" width="24" height="28" rx="3" fill="#78350f"/><circle cx="342" cy="50" r="13" fill="#fed7aa" stroke="#1e293b" stroke-width="2"/><rect x="330" y="65" width="24" height="24" rx="3" fill="#db2777"/><rect x="282" y="14" width="112" height="22" rx="4" fill="#ffffff" stroke="#7e22ce" stroke-width="1.5"/><text x="338" y="29" font-size="10" font-weight="bold" fill="#581c87" text-anchor="middle">「我自己上學/約了同學」</text><text x="313" y="101" font-size="11" font-weight="bold" fill="#581c87" text-anchor="middle">(2) 獨立自主 / 減少依賴</text></svg>`,
    food_pyramid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#f0fdf4" rx="6"/><polygon points="210,6 250,30 170,30" fill="#fecaca" stroke="#b91c1c" stroke-width="2"/><text x="210" y="24" font-size="11" font-weight="bold" fill="#7f1d1d" text-anchor="middle">(4) 頂層：吃最少</text><polygon points="170,30 250,30 290,56 130,56" fill="#fef08a" stroke="#b45309" stroke-width="2"/><text x="210" y="47" font-size="11" font-weight="bold" fill="#713f12" text-anchor="middle">吃適量：奶類 ｜ 肉魚蛋類</text><polygon points="130,56 290,56 330,82 90,82" fill="#bbf7d0" stroke="#15803d" stroke-width="2"/><text x="210" y="73" font-size="11" font-weight="bold" fill="#14532d" text-anchor="middle">(2)(3) 第二層：多吃些</text><polygon points="90,82 330,82 368,108 52,108" fill="#fed7aa" stroke="#c2410c" stroke-width="2"/><text x="210" y="99" font-size="12" font-weight="bold" fill="#7c2d12" text-anchor="middle">(1) 最底層：吃最多</text></svg>`,
    sport_level: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#ecfdf5" rx="6"/><rect x="16" y="8" width="182" height="98" rx="6" fill="#ffffff" stroke="#15803d" stroke-width="2"/><rect x="52" y="60" width="110" height="8" fill="#1d4ed8"/><line x1="107" y1="50" x2="107" y2="68" stroke="#94a3b8" stroke-width="3"/><circle cx="82" cy="44" r="6" fill="#f59e0b"/><text x="107" y="28" font-size="11" font-weight="bold" fill="#166534" text-anchor="middle">能說話，但不能唱歌</text><text x="107" y="95" font-size="12" font-weight="bold" fill="#14532d" text-anchor="middle">(1) 打乒乓球</text><rect x="222" y="8" width="182" height="98" rx="6" fill="#ffffff" stroke="#b91c1c" stroke-width="2"/><circle cx="313" cy="48" r="10" fill="#fed7aa" stroke="#1e293b" stroke-width="2"/><path d="M295,70 L313,58 L331,70 M313,58 L313,78 L296,90 M313,78 L330,90" stroke="#dc2626" stroke-width="3.5" fill="none"/><text x="313" y="28" font-size="11" font-weight="bold" fill="#991b1b" text-anchor="middle">不停下呼吸便說不完整句子</text><text x="313" y="98" font-size="12" font-weight="bold" fill="#7f1d1d" text-anchor="middle">(2) 快速跑步</text></svg>`,
    skin_acne: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#fff7ed" rx="6"/><rect x="24" y="34" width="372" height="70" fill="#fed7aa" rx="4"/><path d="M90,16 L90,86" stroke="#451a03" stroke-width="4"/><circle cx="110" cy="66" r="14" fill="#fef08a" stroke="#d97706" stroke-width="2"/><text x="98" y="99" font-size="12" font-weight="bold" fill="#9a3412" text-anchor="middle">(1) 油脂分泌腺</text><path d="M210,34 L200,84 L220,84 Z" fill="#fef08a"/><ellipse cx="210" cy="34" rx="12" ry="6" fill="#1e293b"/><text x="210" y="20" font-size="12" font-weight="bold" fill="#1e293b" text-anchor="middle">(2) 堵塞毛孔硬粒</text><path d="M300,34 Q330,12 360,34" fill="#f87171" stroke="#b91c1c" stroke-width="2.5"/><circle cx="330" cy="60" r="16" fill="#ef4444" opacity="0.75"/><text x="330" y="99" font-size="12" font-weight="bold" fill="#991b1b" text-anchor="middle">(3) 細菌感染紅腫</text></svg>`,
    wind_east: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#ecfeff" rx="6"/><circle cx="210" cy="58" r="45" fill="#ffffff" stroke="#0891b2" stroke-width="3"/><line x1="210" y1="13" x2="210" y2="103" stroke="#a5f3fc" stroke-width="2"/><line x1="140" y1="58" x2="280" y2="58" stroke="#a5f3fc" stroke-width="2"/><text x="210" y="25" font-size="12" font-weight="bold" fill="#155e75" text-anchor="middle">北</text><text x="210" y="99" font-size="12" font-weight="bold" fill="#155e75" text-anchor="middle">南</text><text x="122" y="63" font-size="15" font-weight="bold" fill="#1e3a8a" text-anchor="middle">西</text><text x="298" y="63" font-size="15" font-weight="bold" fill="#c2410c" text-anchor="middle">東</text><line x1="268" y1="58" x2="175" y2="58" stroke="#16a34a" stroke-width="9"/><polygon points="152,58 180,42 180,74" fill="#16a34a"/></svg>`,
    weather_tools: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#eef2ff" rx="6"/><rect x="42" y="26" width="60" height="50" fill="#ffffff" stroke="#475569" stroke-width="2"/><line x1="46" y1="36" x2="98" y2="36" stroke="#94a3b8" stroke-width="2"/><line x1="46" y1="46" x2="98" y2="46" stroke="#94a3b8" stroke-width="2"/><line x1="46" y1="56" x2="98" y2="56" stroke="#94a3b8" stroke-width="2"/><line x1="52" y1="76" x2="52" y2="100" stroke="#475569" stroke-width="3"/><line x1="92" y1="76" x2="92" y2="100" stroke="#475569" stroke-width="3"/><text x="72" y="18" font-size="13" font-weight="bold" fill="#1e1b4b" text-anchor="middle">(1) 百葉箱</text><line x1="210" y1="28" x2="210" y2="100" stroke="#334155" stroke-width="4"/><line x1="176" y1="44" x2="244" y2="44" stroke="#334155" stroke-width="3"/><circle cx="176" cy="44" r="7" fill="#0284c7"/><circle cx="244" cy="44" r="7" fill="#0284c7"/><polygon points="182,28 238,28 230,22 230,34" fill="#facc15" stroke="#334155" stroke-width="1.5"/><text x="210" y="18" font-size="13" font-weight="bold" fill="#1e1b4b" text-anchor="middle">(2) 風向儀與風速表</text><rect x="318" y="38" width="52" height="60" fill="#cbd5e1" stroke="#334155" stroke-width="2"/><polygon points="314,38 374,38 352,54 336,54" fill="#94a3b8" stroke="#334155" stroke-width="1.5"/><rect x="328" y="72" width="32" height="22" fill="#38bdf8"/><text x="344" y="24" font-size="13" font-weight="bold" fill="#1e1b4b" text-anchor="middle">(3) 翻斗式雨量器</text></svg>`,
    fog_sea: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#cbd5e1" rx="6"/><rect x="0" y="75" width="420" height="40" fill="#0369a1"/><text x="210" y="100" font-size="12" font-weight="bold" fill="#e0f2fe" text-anchor="middle">較冷的海面</text><ellipse cx="155" cy="52" rx="90" ry="20" fill="#ffffff" opacity="0.88"/><ellipse cx="265" cy="56" rx="100" ry="22" fill="#f8fafc" opacity="0.92"/><path d="M40,32 L110,48" stroke="#ea580c" stroke-width="3.5"/><text x="220" y="60" font-size="13" font-weight="bold" fill="#1e293b" text-anchor="middle">(1) 低空微細水點</text></svg>`,
    plate_split: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#e0f2fe" rx="6"/><polygon points="20,36 175,36 160,76 20,76" fill="#78350f" stroke="#451a03" stroke-width="2"/><line x1="135" y1="56" x2="65" y2="56" stroke="#dc2626" stroke-width="6"/><polygon points="50,56 72,44 72,68" fill="#dc2626"/><polygon points="245,36 400,36 400,76 260,76" fill="#78350f" stroke="#451a03" stroke-width="2"/><line x1="285" y1="56" x2="355" y2="56" stroke="#dc2626" stroke-width="6"/><polygon points="370,56 348,44 348,68" fill="#dc2626"/><polygon points="160,76 210,40 260,76" fill="#f97316"/><rect x="20" y="76" width="380" height="32" fill="#b91c1c"/></svg>`,
    fossil_mountain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#ffffff" rx="6"/><rect x="10" y="8" width="125" height="98" fill="#bae6fd" stroke="#0284c7" stroke-width="2" rx="4"/><rect x="10" y="72" width="125" height="34" fill="#d6d3d1"/><ellipse cx="72" cy="88" rx="26" ry="7" fill="#fef08a" stroke="#57534e" stroke-width="2"/><text x="72" y="26" font-size="12" font-weight="bold" fill="#0369a1" text-anchor="middle">(1) 海底掩埋</text><rect x="147" y="8" width="125" height="98" fill="#fef3c7" stroke="#d97706" stroke-width="2" rx="4"/><path d="M155,85 Q210,25 265,85" fill="#a8a29e" stroke="#44403c" stroke-width="3"/><text x="210" y="26" font-size="12" font-weight="bold" fill="#b45309" text-anchor="middle">(2) 擠壓推升</text><rect x="284" y="8" width="125" height="98" fill="#ecfdf5" stroke="#059669" stroke-width="2" rx="4"/><polygon points="290,104 346,24 402,104" fill="#78350f" stroke="#451a03" stroke-width="2"/><ellipse cx="346" cy="60" rx="18" ry="6" fill="#fef08a" stroke="#1e293b" stroke-width="1.5"/><text x="346" y="22" font-size="12" font-weight="bold" fill="#065f46" text-anchor="middle">(3) 隆起山脈</text></svg>`,
    three_fossils: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#f5f5f4" rx="6"/><rect x="15" y="10" width="120" height="95" rx="8" fill="#d6d3d1" stroke="#57534e" stroke-width="2"/><line x1="35" y1="54" x2="105" y2="54" stroke="#44403c" stroke-width="3"/><polygon points="30,54 48,41 48,67" fill="#44403c"/><line x1="60" y1="40" x2="60" y2="68" stroke="#44403c" stroke-width="2"/><line x1="75" y1="42" x2="75" y2="66" stroke="#44403c" stroke-width="2"/><line x1="90" y1="44" x2="90" y2="64" stroke="#44403c" stroke-width="2"/><polygon points="105,54 118,43 118,65" fill="#44403c"/><text x="75" y="96" font-size="14" font-weight="bold" fill="#b91c1c" text-anchor="middle">(1)</text><rect x="150" y="10" width="120" height="95" rx="8" fill="#d6d3d1" stroke="#57534e" stroke-width="2"/><circle cx="210" cy="52" r="24" fill="#a8a29e" stroke="#44403c" stroke-width="3"/><circle cx="210" cy="52" r="14" fill="none" stroke="#44403c" stroke-width="2.5"/><circle cx="210" cy="52" r="6" fill="#44403c"/><text x="210" y="96" font-size="14" font-weight="bold" fill="#b91c1c" text-anchor="middle">(2)</text><rect x="285" y="10" width="120" height="95" rx="8" fill="#d6d3d1" stroke="#57534e" stroke-width="2"/><path d="M345,26 C370,40 370,68 345,80 C320,68 320,40 345,26 Z" fill="#84cc16" stroke="#365314" stroke-width="2.5"/><line x1="345" y1="26" x2="345" y2="83" stroke="#365314" stroke-width="2"/><text x="345" y="96" font-size="14" font-weight="bold" fill="#b91c1c" text-anchor="middle">(3)</text></svg>`,
    hum_mirror_boy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#eff6ff" rx="6"/><ellipse cx="105" cy="58" rx="36" ry="40" fill="#bae6fd" stroke="#1d4ed8" stroke-width="3.5"/><circle cx="195" cy="48" r="16" fill="#fed7aa" stroke="#1e293b" stroke-width="2"/><rect x="178" y="66" width="34" height="36" rx="4" fill="#3b82f6"/><rect x="235" y="24" width="165" height="64" rx="6" fill="#ffffff" stroke="#1d4ed8" stroke-width="2"/><text x="317" y="50" font-size="12" font-weight="bold" fill="#1e293b" text-anchor="middle">「為甚麼每位同學進入</text><text x="317" y="70" font-size="12" font-weight="bold" fill="#1e293b" text-anchor="middle">青春期的年齡都不同？」</text></svg>`,
    hum_wash_face: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#ecfeff" rx="6"/><path d="M85,74 L225,74 L205,108 L105,108 Z" fill="#ffffff" stroke="#0891b2" stroke-width="3"/><path d="M155,40 L155,56 M145,40 L165,40" stroke="#475569" stroke-width="4"/><line x1="155" y1="58" x2="155" y2="74" stroke="#38bdf8" stroke-width="3" stroke-dasharray="3,2"/><rect x="245" y="26" width="150" height="64" rx="6" fill="#ffffff" stroke="#0d9488" stroke-width="2"/><text x="320" y="52" font-size="12" font-weight="bold" fill="#0f766e" text-anchor="middle">以溫水及溫和洗面用品</text><text x="320" y="74" font-size="12" font-weight="bold" fill="#0f766e" text-anchor="middle">保持臉部清潔衛生</text></svg>`,
    hum_diary_room: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#faf5ff" rx="6"/><rect x="55" y="12" width="66" height="92" fill="#b45309" stroke="#451a03" stroke-width="2.5"/><circle cx="110" cy="58" r="4" fill="#facc15"/><rect x="175" y="66" width="100" height="38" fill="#d97706" stroke="#451a03" stroke-width="2"/><rect x="205" y="50" width="40" height="16" fill="#ffffff" stroke="#1e293b" stroke-width="2"/><text x="295" y="38" font-size="12" font-weight="bold" fill="#6b21a8" text-anchor="middle">房內寫日記（需要私隱與個人空間）</text></svg>`,
    hum_stereotype: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#fff1f2" rx="6"/><circle cx="100" cy="52" r="16" fill="#fed7aa" stroke="#1e293b" stroke-width="2"/><line x1="93" y1="56" x2="93" y2="66" stroke="#0284c7" stroke-width="2.5"/><line x1="107" y1="56" x2="107" y2="66" stroke="#0284c7" stroke-width="2.5"/><rect x="155" y="24" width="235" height="66" rx="6" fill="#ffffff" stroke="#e11d48" stroke-width="2.5"/><text x="272" y="50" font-size="12" font-weight="bold" fill="#9f1239" text-anchor="middle">取笑：「男孩子竟然會哭，真懦弱！」</text><text x="272" y="72" font-size="12" font-weight="bold" fill="#9f1239" text-anchor="middle">（錯誤的性別角色定型觀念）</text></svg>`,
    hum_calligraphy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#f0fdf4" rx="6"/><rect x="110" y="66" width="200" height="38" fill="#a16207" stroke="#451a03" stroke-width="2.5"/><rect x="165" y="52" width="90" height="14" fill="#ffffff" stroke="#1e293b" stroke-width="1.5"/><circle cx="140" cy="40" r="14" fill="#fed7aa" stroke="#1e293b" stroke-width="2"/><circle cx="280" cy="40" r="14" fill="#fed7aa" stroke="#1e293b" stroke-width="2"/><text x="210" y="20" font-size="13" font-weight="bold" fill="#166534" text-anchor="middle">男女同學大方坦誠交流、共同參與興趣活動</text></svg>`,
    hum_boundary: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#fff7ed" rx="6"/><circle cx="125" cy="52" r="15" fill="#fed7aa" stroke="#1e293b" stroke-width="2"/><circle cx="165" cy="52" r="15" fill="#fed7aa" stroke="#1e293b" stroke-width="2"/><line x1="145" y1="18" x2="145" y2="102" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="4,3"/><rect x="205" y="26" width="195" height="64" rx="6" fill="#ffffff" stroke="#ea580c" stroke-width="2"/><text x="302" y="52" font-size="12" font-weight="bold" fill="#9a3412" text-anchor="middle">拉扯手臂靠得太近令對方尷尬</text><text x="302" y="74" font-size="12" font-weight="bold" fill="#9a3412" text-anchor="middle">（應保持適當距離並坦白表達）</text></svg>`,
    hum_mongol_yurt: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="75" fill="#bae6fd"/><rect y="75" width="420" height="40" fill="#65a30d"/><path d="M140,50 Q210,12 280,50 Z" fill="#ffffff" stroke="#b45309" stroke-width="2.5"/><rect x="148" y="50" width="124" height="34" fill="#f8fafc" stroke="#b45309" stroke-width="2.5"/><rect x="196" y="58" width="28" height="26" fill="#dc2626"/><text x="210" y="104" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">西部草原畜牧生活與傳統帳幕</text></svg>`,
    hum_river_uses: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#e0f2fe" rx="6"/><path d="M0,72 Q210,56 420,80 L420,115 L0,115 Z" fill="#0284c7"/><rect x="38" y="30" width="40" height="46" fill="#475569" stroke="#1e293b" stroke-width="2"/><text x="58" y="22" font-size="12" font-weight="bold" fill="#1e293b" text-anchor="middle">(1) 水壩電塔</text><polygon points="168,64 232,64 220,82 180,82" fill="#b91c1c" stroke="#450a0a" stroke-width="2"/><text x="200" y="52" font-size="12" font-weight="bold" fill="#1e293b" text-anchor="middle">(2) 河道貨船</text><rect x="305" y="50" width="76" height="26" fill="#65a30d" stroke="#365314" stroke-width="2"/><text x="343" y="40" font-size="12" font-weight="bold" fill="#1e293b" text-anchor="middle">(3) 農田引水</text></svg>`,
    hum_terrace: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#f0fdf4" rx="6"/><rect x="40" y="82" width="340" height="22" fill="#65a30d" stroke="#365314" stroke-width="2"/><rect x="75" y="60" width="270" height="22" fill="#84cc16" stroke="#365314" stroke-width="2"/><rect x="110" y="38" width="200" height="22" fill="#a3e635" stroke="#365314" stroke-width="2"/><rect x="145" y="16" width="130" height="22" fill="#bef264" stroke="#365314" stroke-width="2"/></svg>`,
    hum_stilt_house: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#ecfdf5" rx="6"/><polygon points="120,40 210,10 300,40" fill="#451a03"/><rect x="140" y="40" width="140" height="36" fill="#a16207" stroke="#451a03" stroke-width="2"/><line x1="155" y1="76" x2="155" y2="108" stroke="#451a03" stroke-width="6"/><line x1="190" y1="76" x2="190" y2="108" stroke="#451a03" stroke-width="6"/><line x1="230" y1="76" x2="230" y2="108" stroke="#451a03" stroke-width="6"/><line x1="265" y1="76" x2="265" y2="108" stroke="#451a03" stroke-width="6"/></svg>`,
    hum_ethnic_costume: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#fef3c7" rx="6"/><line x1="210" y1="10" x2="210" y2="106" stroke="#b45309" stroke-width="2" stroke-dasharray="4,4"/><polygon points="85,28 105,14 125,28" fill="#16a34a" stroke="#1e293b" stroke-width="2"/><circle cx="105" cy="42" r="13" fill="#fed7aa" stroke="#1e293b" stroke-width="2"/><rect x="88" y="56" width="34" height="36" fill="#b91c1c" stroke="#1e293b" stroke-width="2"/><text x="105" y="106" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="middle">新疆：花帽與長袍 (牛羊肉/麵食)</text><path d="M292,26 L282,10 L298,20 L310,8 L322,20 L338,10 L328,26 Z" fill="#cbd5e1" stroke="#475569" stroke-width="2"/><circle cx="310" cy="42" r="13" fill="#fed7aa" stroke="#1e293b" stroke-width="2"/><circle cx="310" cy="60" r="14" fill="none" stroke="#94a3b8" stroke-width="4"/><rect x="293" y="56" width="34" height="36" fill="#1d4ed8" stroke="#1e293b" stroke-width="2"/><text x="310" y="106" font-size="11" font-weight="bold" fill="#1e293b" text-anchor="middle">節慶：精緻銀冠與銀項圈保平安</text></svg>`,
    hum_potala: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#bae6fd" rx="6"/><polygon points="40,115 210,25 380,115" fill="#a8a29e"/><rect x="115" y="54" width="190" height="48" fill="#ffffff" stroke="#1e293b" stroke-width="2"/><rect x="145" y="30" width="130" height="32" fill="#b91c1c" stroke="#1e293b" stroke-width="2"/><rect x="175" y="18" width="70" height="14" fill="#facc15"/></svg>`,
    hum_museum_flash: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 115"><rect width="420" height="115" fill="#f1f5f9" rx="6"/><rect x="85" y="18" width="76" height="86" fill="#e0f2fe" stroke="#334155" stroke-width="2.5"/><ellipse cx="123" cy="66" rx="18" ry="24" fill="#2563eb" stroke="#1e3a8a" stroke-width="2"/><circle cx="240" cy="44" r="22" fill="#ffffff" stroke="#dc2626" stroke-width="4"/><polygon points="242,31 232,45 241,45 236,57 250,41 241,41" fill="#facc15"/><line x1="224" y1="28" x2="256" y2="60" stroke="#dc2626" stroke-width="4"/><text x="295" y="90" font-size="12" font-weight="bold" fill="#991b1b" text-anchor="middle">禁止使用閃光燈拍攝文物</text></svg>`
};

// =========================================================================
// 🛡️ 分類題完整項目保底字典 (防止任何分類題缺少 items 而變成純 A, B, C, D)
// =========================================================================
export const CLASSIFY_ITEMS_FALLBACK = {
    '月經期間護理分類': {
        categories: ['應該做的事', '錯誤觀念'],
        items: [
            { label: 'A. 勤換衛生巾', cat: '應該做的事' },
            { label: 'B. 月經期間完全不要洗頭', cat: '錯誤觀念' },
            { label: 'C. 避免吃生冷食物', cat: '應該做的事' },
            { label: 'D. 絕對不能做任何運動', cat: '錯誤觀念' },
            { label: 'E. 用溫水淋浴保持清潔', cat: '應該做的事' },
            { label: 'F. 飲用溫熱開水及充足休息', cat: '應該做的事' }
        ]
    },
    '青春期第二性徵分類': {
        categories: ['男女共同轉變', '男性獨有', '女性獨有'],
        items: [
            { label: 'A. 長出陰毛及腋毛', cat: '男女共同轉變' },
            { label: 'B. 喉結突出及長出鬍鬚', cat: '男性獨有' },
            { label: 'C. 乳房發育隆起', cat: '女性獨有' },
            { label: 'D. 身高及體重迅速增加', cat: '男女共同轉變' },
            { label: 'E. 出現夢遺現象', cat: '男性獨有' },
            { label: 'F. 臀部變寬及出現月經', cat: '女性獨有' }
        ]
    }
};

function extractQuestionsFromModule(mod, defaultSubKey) {
    if (!mod) return [];
    const list = [];
    for (const key of Object.keys(mod)) {
        const val = mod[key];
        if (Array.isArray(val)) {
            val.forEach(item => {
                if (item && typeof item === 'object') {
                    list.push({ ...item, subject: item.subject || defaultSubKey });
                }
            });
        }
    }
    return list;
}

// 萬能分類題補全器：自動解析題幹內的 "1.輸精管" 或 "A.勤換衛生巾"，或從保底字典補齊
export function enrichAnyClassifyQuestion(q) {
    if (!q || (q.qType !== '分類題' && q.interactiveType !== 'classify')) return q;
    if (Array.isArray(q.categories) && Array.isArray(q.items) && q.items.length > 0) {
        q.interactiveType = 'classify';
        return q;
    }

    const rawQText = String(q.question || q.prompt || '');
    const ansStr = String(q.answer || '');

    // 1. 檢查是否命中保底字典 (如「月經期間護理分類」)
    for (const [kw, data] of Object.entries(CLASSIFY_ITEMS_FALLBACK)) {
        if (rawQText.includes(kw)) {
            q.categories = [...data.categories];
            q.items = data.items.map(it => ({ ...it }));
            q.interactiveType = 'classify';
            return q;
        }
    }

    // 2. 若是「1配B｜2配C」配對題，確保題幹完整顯示所有行數
    if (ansStr.includes('配')) return q;

    // 3. 自動從題目文字中提取「1.XXX / 2.YYY」或「A.XXX / B.YYY」對應表
    const codeMap = {};
    const regex = /([1-9A-Fa-f])\s*[.、．:：]\s*([^\s\n1-9A-Fa-f]+)/g;
    let m;
    while ((m = regex.exec(rawQText)) !== null) {
        const k = m[1].toUpperCase();
        codeMap[k] = `${k}. ${m[2]}`;
    }

    const categories = [];
    const items = [];
    const segments = ansStr.replace(/｜/g, '|').split('|').map(s => s.trim()).filter(Boolean);
    segments.forEach(seg => {
        const colonIdx = seg.indexOf('：') !== -1 ? seg.indexOf('：') : seg.indexOf(':');
        if (colonIdx !== -1) {
            const catName = seg.slice(0, colonIdx).trim();
            categories.push(catName);
            const rawCodes = seg.slice(colonIdx + 1).split(/[,，、]/).map(c => c.trim()).filter(Boolean);
            rawCodes.forEach(code => {
                const upper = code.toUpperCase();
                items.push({
                    label: codeMap[upper] || code,
                    cat: catName
                });
            });
        }
    });

    // 只有當每個 item 都有實際文字描述（而非單純 1 個英文字母 A~F）時，才啟用互動分類籃
    const hasDescriptiveLabels = items.every(it => it.label.length > 2 || !/^[A-F1-9]$/i.test(it.label.trim()));
    if (categories.length >= 2 && items.length >= 2 && hasDescriptiveLabels) {
        q.categories = categories;
        q.items = items;
        q.interactiveType = 'classify';
    }
    return q;
}

export class QuestionSystem {
    constructor() {
        this.rawBank = this.collectAllQuestions();
        this.subjectData = this.buildSubjectDataFromBank(this.rawBank);
        this.activeUnitIds = [];
        this.activeTypes = ['ALL'];

        // 四科獨立出題模式設定 (中文科只保留 ALL / FILL / MEANING)
        this.subjectModes = {
            chi: 'ALL', // ALL | FILL | MEANING
            eng: 'ALL', // ALL | FILL | SPELL
            sci: 'ALL', // ALL | INTERACTIVE | FILL_MC | QA_SCENARIO
            hum: 'ALL'  // ALL | INTERACTIVE | FILL_MC | QA_SCENARIO
        };

        this.questionDeck = [];
        this.subjectData.forEach(sub => {
            sub.units.forEach(u => this.activeUnitIds.push(u.id));
        });
    }

    collectAllQuestions() {
        const chiRaw = extractQuestionsFromModule(ChiModule, 'chi');
        const engRaw = extractQuestionsFromModule(EngModule, 'eng');
        const sciRaw = extractQuestionsFromModule(SciModule, 'sci');
        const humRaw = extractQuestionsFromModule(HumModule, 'hum');

        const expanded = [];

        // 🌟 1. 中文科：已徹底刪除「成語補字」，只保留「字詞釋義」與「例句填充」！
        chiRaw.forEach(q => {
            let sameUnitWords = chiRaw.filter(x => x.unit === q.unit && x.word && x.word !== q.word).map(x => x.word);
            if (sameUnitWords.length < 3) {
                sameUnitWords = chiRaw.filter(x => x.word && x.word !== q.word).map(x => x.word);
            }
            const distractors = [...sameUnitWords].sort(() => Math.random() - 0.5).slice(0, 3);
            const fullWordOptions = [q.word, ...distractors].sort(() => Math.random() - 0.5);

            // (A) 字詞釋義題
            if (q.meaning && q.word) {
                expanded.push({
                    id: `${q.id}_meaning`,
                    subject: 'chi',
                    unit: q.unit,
                    qType: '字詞解釋',
                    subMode: 'MEANING',
                    question: `【字詞釋義】「${q.meaning}」請問這是哪一個成語或詞語？`,
                    prompt: `【字詞釋義】「${q.meaning}」請問這是哪一個成語或詞語？`,
                    options: [...fullWordOptions],
                    answer: q.word
                });
            }

            // (B) 例句填充題 (一)
            if (q.sentence && q.word) {
                expanded.push({
                    id: `${q.id}_sent1`,
                    subject: 'chi',
                    unit: q.unit,
                    qType: '中文填充題',
                    subMode: 'FILL',
                    question: q.sentence,
                    prompt: q.sentence,
                    options: [...fullWordOptions].sort(() => Math.random() - 0.5),
                    answer: q.word
                });
            }

            // (C) 例句填充題 (二)
            if (q.sentence2 && q.word) {
                expanded.push({
                    id: `${q.id}_sent2`,
                    subject: 'chi',
                    unit: q.unit,
                    qType: '中文填充題',
                    subMode: 'FILL',
                    question: q.sentence2,
                    prompt: q.sentence2,
                    options: [...fullWordOptions].sort(() => Math.random() - 0.5),
                    answer: q.word
                });
            }
        });

        // 🌟 2. 英文科：保留「英文填充題」與「英文串字」
        engRaw.forEach(q => {
            if (q.sentence && q.answer) {
                expanded.push({
                    id: `${q.id}_fill`,
                    subject: 'eng',
                    unit: q.unit,
                    qType: '英文填充題',
                    subMode: 'FILL',
                    question: `${q.sentence} (${q.meaning})`,
                    prompt: `${q.sentence} (${q.meaning})`,
                    options: [...(q.options || [q.answer])],
                    answer: q.answer
                });
            }
            if (q.word && q.meaning) {
                expanded.push({
                    id: `${q.id}_spell`,
                    subject: 'eng',
                    unit: q.unit,
                    qType: '英文串字',
                    subMode: 'SPELL',
                    question: `請拼寫出「${q.meaning}」的英文：`,
                    prompt: `請拼寫出「${q.meaning}」的英文：`,
                    options: [...(q.options || [q.word])],
                    answer: q.word
                });
            }
        });

        // 🌟 3. 科學科與人文科：自動為所有分類題補齊完整文字項目
        sciRaw.forEach(rawQ => {
            expanded.push(enrichAnyClassifyQuestion({ ...rawQ, subject: 'sci' }));
        });
        humRaw.forEach(rawQ => {
            expanded.push(enrichAnyClassifyQuestion({ ...rawQ, subject: 'hum' }));
        });

        return expanded;
    }

    buildSubjectDataFromBank(bank) {
        const subMap = {
            chi: { id: 'chi', name: '中文科', unitsMap: {} },
            eng: { id: 'eng', name: '英文科', unitsMap: {} },
            sci: { id: 'sci', name: '科學科', unitsMap: {} },
            hum: { id: 'hum', name: '人文科', unitsMap: {} }
        };

        (bank || []).forEach(rawQ => {
            const q = { ...rawQ };
            const sKey = subMap[q.subject] ? q.subject : 'sci';
            const unitName = q.unit || '預設單元';

            if (!subMap[sKey].unitsMap[unitName]) {
                subMap[sKey].unitsMap[unitName] = {
                    id: `${sKey}_${unitName}`,
                    name: unitName,
                    questions: []
                };
            }

            const rawText = String(q.question || q.prompt || '').replace(/^\[看圖填充.*?\]\s*/g, '');
            q.question = rawText;
            q.prompt = rawText;
            q.cleanPrompt = rawText;

            if (Array.isArray(q.answer)) {
                q.answer = q.answer[0];
            }

            if (q.svgKey && MASTER_SVG_LIBRARY[q.svgKey]) {
                q.svgHtml = MASTER_SVG_LIBRARY[q.svgKey];
            }

            subMap[sKey].unitsMap[unitName].questions.push(q);
        });

        return Object.values(subMap).map(sub => ({
            id: sub.id,
            name: sub.name,
            units: Object.values(sub.unitsMap)
        }));
    }

    setSubjectMode(subId, mode) {
        if (this.subjectModes[subId] !== undefined) {
            this.subjectModes[subId] = mode;
            this.questionDeck = [];
        }
    }

    setActiveSubjects(unitIds) {
        this.activeUnitIds = Array.isArray(unitIds) ? unitIds : [];
        this.questionDeck = [];
    }

    setActiveTypes(types) {
        if (!Array.isArray(types) || types.length === 0) {
            this.activeTypes = ['ALL'];
        } else {
            this.activeTypes = types;
        }
        this.questionDeck = [];
    }

    matchesSubjectMode(q, subId) {
        const mode = this.subjectModes[subId] || 'ALL';
        if (mode === 'ALL') return true;
        const qt = q.qType || '選擇題';

        if (subId === 'chi') {
            if (mode === 'FILL') return qt === '中文填充題';
            if (mode === 'MEANING') return qt === '字詞解釋';
        } else if (subId === 'eng') {
            if (mode === 'FILL') return qt === '英文填充題';
            if (mode === 'SPELL') return qt === '英文串字';
        } else if (subId === 'sci' || subId === 'hum') {
            if (mode === 'INTERACTIVE') return ['看圖填充題', '分類題'].includes(qt);
            if (mode === 'FILL_MC') return ['填充題', '選擇題'].includes(qt);
            if (mode === 'QA_SCENARIO') return ['簡答題', '情境題'].includes(qt);
            return qt === mode;
        }
        return true;
    }

    matchesTypeFilter(q, subId = null) {
        const sId = subId || q.subjectId || 'sci';
        if (!this.matchesSubjectMode(q, sId)) return false;
        if (this.activeTypes.includes('ALL')) return true;
        const qt = q.qType || '選擇題';
        return this.activeTypes.some(t => {
            if (t === '填充題') return ['填充題', '中文填充題', '英文填充題', '填空題'].includes(qt);
            return qt === t;
        });
    }

    getPoolCount() {
        let count = 0;
        this.subjectData.forEach(sub => {
            sub.units.forEach(u => {
                if (this.activeUnitIds.includes(u.id)) {
                    u.questions.forEach(q => {
                        if (this.matchesTypeFilter(q, sub.id)) count++;
                    });
                }
            });
        });
        return count;
    }

    rebuildDeck() {
        const pool = [];
        this.subjectData.forEach(sub => {
            sub.units.forEach(u => {
                if (!this.activeUnitIds.includes(u.id)) return;
                u.questions.forEach(q => {
                    if (!this.matchesTypeFilter(q, sub.id)) return;
                    pool.push({
                        ...q,
                        subjectId: sub.id,
                        subject: sub.name,
                        unit: u.name
                    });
                });
            });
        });

        if (pool.length === 0) {
            this.subjectData.forEach(sub => {
                sub.units.forEach(u => {
                    if (!this.activeUnitIds.includes(u.id)) return;
                    u.questions.forEach(q => {
                        pool.push({
                            ...q,
                            subjectId: sub.id,
                            subject: sub.name,
                            unit: u.name
                        });
                    });
                });
            });
        }

        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }
        this.questionDeck = pool;
    }

    getRandomQuestion() {
        if (!this.questionDeck || this.questionDeck.length === 0) {
            this.rebuildDeck();
        }
        if (this.questionDeck.length === 0) return null;
        return this.questionDeck.pop();
    }
}
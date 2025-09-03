import React, { useState, useEffect, useRef, useCallback, ReactNode, useMemo } from 'react';

// --- DATA CONSTANTS ---
const M_DATA = [
  {y:1698, label:"Savery 'Miner’s Friend' pump", domain:"Mines/Pumping", w:1.2}, {y:1712, label:"Newcomen atmospheric engine", domain:"Mines/Pumping", w:1.4},
  {y:1765, label:"Watt separate condenser", domain:"Engine Efficiency", w:2.5}, {y:1776, label:"Boulton & Watt commercial rollout", domain:"Industrial Power", w:1.6},
  {y:1781, label:"Watt rotary motion", domain:"Industrial Power", w:2.0}, {y:1782, label:"Watt double-acting engine", domain:"Industrial Power", w:1.6},
  {y:1788, label:"Centrifugal governor (control)", domain:"Controls", w:1.2}, {y:1804, label:"Trevithick locomotive haul", domain:"Rail", w:1.8},
  {y:1807, label:"Clermont commercial steamboat", domain:"Steamships", w:1.6}, {y:1819, label:"SS Savannah partial Atlantic steam", domain:"Steamships", w:1.0},
  {y:1825, label:"Stockton & Darlington public railway", domain:"Rail", w:1.8}, {y:1829, label:"Rainhill Trials (Rocket)", domain:"Rail", w:1.6},
  {y:1830, label:"Liverpool–Manchester inter-city rail", domain:"Rail", w:2.0}, {y:1838, label:"SS Great Western transatlantic", domain:"Steamships", w:1.4},
  {y:1851, label:"Great Exhibition (steam on display)", domain:"Showcase", w:0.8}, {y:1884, label:"Parsons steam turbine generator", domain:"Turbines/Electricity", w:3.0},
  {y:1897, label:"Turbinia (marine turbine)", domain:"Turbines/Marine", w:1.6}, {y:1901, label:"First U.S. utility steam-turbine unit", domain:"Turbines/Electricity", w:1.6},
  {y:1913, label:"Larderello geothermal (steam→turbine)", domain:"Geothermal", w:1.8}, {y:1954, label:"Obninsk nuclear (steam cycle)", domain:"Nuclear", w:2.2},
  {y:1957, label:"Philo 6 supercritical steam", domain:"Steam Cycle/Materials", w:2.0}, {y:1961, label:"Early combined-cycle (steam bottoming)", domain:"Combined Cycle", w:1.8},
  {y:1984, label:"SEGS I CSP (solar→steam)", domain:"Solar Thermal/CSP", w:1.8}, {y:2000, label:"Ultra-supercritical scaling (2000s)", domain:"Steam Cycle/Materials", w:1.6},
  {y:2010, label:"Hybrid CSP-CC (e.g., Archimede)", domain:"Solar Thermal/CSP", w:1.2}, {y:2022, label:"~42% US electricity via steam turbines", domain:"Energy System Status", w:1.4},
  {y:2024, label:"IEA: geothermal >10% in some nations", domain:"Geothermal/Status", w:1.0}, {y:2025, label:"ORC/Kalina low-temp waste-heat growth", domain:"Waste-Heat/Rankine", w:1.4},
].sort((a,b)=>a.y-b.y);

const letterTextContent = `Dear Dr. Graham,

I am excited about the Enterprise Account Executive, Pharma position at Seeq. Your vision for scaling the organization and driving digital transformation in process industries truly resonates with me.

While I have some experience in pharmaceuticals, my background also includes work in Oil and Gas, Mining, Metals & Materials, and Food & Beverage. My passion for leveraging data to solve manufacturing challenges and my appreciation for values-driven companies make Seeq a standout choice for me.

I have over seven years of enterprise SaaS sales experience, consistently achieving exceptional results, including 225% of my target at Gluware and 200% of my quota at HyperVelocity Consulting. My skills in navigating complex sales cycles are evidenced by my successful closure of a $1.5 million deal with EnergyTransfer.

My MBA in Data Analytics allows me to understand the value of data in pharma, from optimizing processes to accelerating drug discovery. I am eager to apply this knowledge to position Seeq’s Industrial Analytics & AI Suite as a key asset for pharmaceutical clients.

I believe my expertise in enterprise SaaS sales, my passion for data-driven solutions, and my alignment with Seeq's values make me a strong candidate for this role. I look forward to the opportunity to discuss how I can contribute to Seeq’s success.

Thank you for your consideration.

Best regards,`;

// --- TYPE DEFINITIONS ---
interface SlideProps {
  isActive: boolean;
  registerRef: (el: HTMLDivElement | null) => void;
}

interface RevealProps {
  children: ReactNode;
  d?: number;
  isActive: boolean;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

// --- SVG ICONS ---
const BrandStarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 100 100" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <polygon points="50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35" />
  </svg>
);
const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const ExpandIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>;

// --- UI HELPER COMPONENTS ---
const Reveal: React.FC<RevealProps> = ({ children, d = 1, isActive, className = '', as = 'div' }) => {
  const delayValue = (d - 1) * 120;
  const delayClass = d > 1 ? `[animation-delay:${delayValue}ms]` : '';
  const Tag = as;

  return (
    <Tag className={`${className} ${isActive ? `animate-fadeUp ${delayClass}` : 'opacity-0 translate-y-[18px]'}`}>
      {children}
    </Tag>
  );
};

const Panel: React.FC<{children: ReactNode, className?: string}> = ({ children, className }) => (
  <div className={`bg-white/5 border border-white/10 rounded-2xl p-5 ${className}`}>
    {children}
  </div>
);

const Chip: React.FC<{children: ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`absolute flex items-center gap-2 py-2 px-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md font-semibold text-sm ${className}`}>
        {children}
    </div>
);

const Tag: React.FC<{ children: ReactNode }> = ({ children }) => (
    <span className="inline-block px-3 py-2 rounded-full bg-white/10 border border-white/12 mr-2 font-semibold text-sm/none">{children}</span>
);

// --- SLIDE COMPONENTS ---
const Slide01: React.FC<SlideProps> = ({ isActive, registerRef }) => (
    <section ref={registerRef} className="slide grid grid-cols-[1.05fr_.95fr] h-full p-12 gap-6" aria-label="Opening">
      <div className="flex flex-col justify-center gap-6">
        <Reveal isActive={isActive} d={1} as="span" className="kicker">Opening</Reveal>
        <Reveal isActive={isActive} d={2} as="h1" className="font-archivo font-extrabold text-7xl/tight">From Perseverance to Promise:<br/>A 1% Better Story <span aria-hidden="true">🚀</span></Reveal>
        <Reveal isActive={isActive} d={3} as="p" className="text-3xl font-semibold text-indigo-100/90">Navigating the New Workforce with <strong>Strategic Tools</strong></Reveal>
        <Reveal isActive={isActive} d={4} className="flex flex-wrap gap-2">
          <Tag>Perseverance</Tag><Tag>Skills of the Future</Tag><Tag>AI Collaboration</Tag><Tag>Texas Workforce</Tag>
        </Reveal>
        <Reveal isActive={isActive} d={5} as="p" className="note">We’ll pair grit with modern tools—so the same effort travels farther.</Reveal>
      </div>
      <div className="relative">
        <Reveal isActive={isActive} d={3} className="absolute inset-0">
          <svg viewBox="0 0 800 700" xmlns="http://www.w3.org/2000/svg" aria-label="Texas motif" className="w-full h-full">
            <defs><radialGradient id="g1" cx="70%" cy="20%" r="60%"><stop offset="0%" stopColor="#BF0D3E" stopOpacity="0.25"/><stop offset="100%" stopColor="#BF0D3E" stopOpacity="0"/></radialGradient></defs>
            <rect x="0" y="0" width="800" height="700" fill="url(#g1)"/>
            <g transform="translate(350,180)"><circle cx="50" cy="50" r="110" fill="rgba(255,255,255,.08)" /><circle cx="50" cy="50" r="150" fill="rgba(0,32,91,.18)" /><polygon points="50,0 65,40 110,40 75,64 88,110 50,84 12,110 25,64 -10,40 35,40" fill="#fff"/></g>
            <g stroke="rgba(255,255,255,.55)" strokeWidth="2" fill="none"><path d="M400 230 C 520 260, 600 340, 580 420"/><path d="M400 230 C 520 200, 620 180, 680 120"/><path d="M400 230 C 460 320, 480 460, 540 520"/><path d="M400 230 C 460 260, 540 260, 620 300"/><path d="M400 230 C 420 300, 420 360, 420 460"/></g>
            <circle fill="#fff" opacity=".9" cx="680" cy="120" r="5"/><circle fill="#fff" opacity=".9" cx="620" cy="300" r="5"/><circle fill="#fff" opacity=".9" cx="580" cy="420" r="5"/><circle fill="#fff" opacity=".9" cx="540" cy="520" r="5"/><circle fill="#fff" opacity=".9" cx="420" cy="460" r="5"/>
          </svg>
        </Reveal>
        <Reveal isActive={isActive} d={1}><Chip className="right-7 top-24">🔧 Tech</Chip></Reveal>
        <Reveal isActive={isActive} d={2}><Chip className="right-12 top-64">🚚 Logistics</Chip></Reveal>
        <Reveal isActive={isActive} d={3}><Chip className="right-28 top-96">⚡ Energy</Chip></Reveal>
        <Reveal isActive={isActive} d={4}><Chip className="right-32 top-[490px]">❤️ Healthcare</Chip></Reveal>
        <Reveal isActive={isActive} d={5}><Chip className="right-60 top-[420px]">💼 Business</Chip></Reveal>
      </div>
    </section>
);

const Slide02: React.FC<SlideProps> = ({ isActive, registerRef }) => {
    const [imgError, setImgError] = useState(false);
    useEffect(() => { if (isActive) setImgError(false); }, [isActive]);
    
    const newImageUrl = "https://raw.githubusercontent.com/tonicsouls/slides-/6ced54ab4db4785189f4f9acabdc40e17ba9764f/0902%20images/069498ed-d341-4967-bdfc-bf3681466681.png";

    return (
        <section ref={registerRef} className="slide grid grid-cols-[1.05fr_.95fr] h-full p-12 gap-6" aria-label="Core Idea: The New Shovels">
            <div className="flex flex-col justify-center gap-6">
                <Reveal isActive={isActive} d={1} as="span" className="kicker">Core Idea</Reveal>
                <Reveal isActive={isActive} d={1} as="h2" className="h2-style">The New Shovels</Reveal>
                <Reveal isActive={isActive} d={2} as="p" className="p-big-style">We’re all still “digging.” The biggest change isn’t what we dig for, but the tools we use.</Reveal>
                <ul className="bullets">
                    <Reveal isActive={isActive} d={3} as="li"><strong>Old Shovel:</strong> Manual labor for centuries; Newcomen’s 1712 engine pumped water from mines—replacing hundreds of literal shovels.</Reveal>
                    <Reveal isActive={isActive} d={4} as="li"><strong>1% → Revolution:</strong> James Watt’s separate condenser = small change, huge efficiency, industry transformed.</Reveal>
                </ul>
                <Reveal isActive={isActive} d={5} as="div" className="note"><Tag>+1%</Tag> × <Tag>Time</Tag> = <Tag>Big Change</Tag></Reveal>
            </div>
            <div className="relative flex items-center justify-center" aria-label="Diagram comparing old tools and new tools">
                <Reveal isActive={isActive} d={3} className="w-full h-full">
                    <Panel className="flex items-center justify-center h-full w-full p-4">
                        <figure className="w-full h-full">
                            <img src={imgError ? "https://picsum.photos/800/450" : newImageUrl} alt="Comparison of the old way of doing things versus the new way leveraging better tools." loading="lazy" onError={() => setImgError(true)} className="w-full h-full object-contain rounded-xl" />
                        </figure>
                    </Panel>
                </Reveal>
            </div>
        </section>
    );
};

const Slide02A: React.FC<SlideProps> = ({ isActive, registerRef }) => (
    <section ref={registerRef} className="slide grid grid-cols-[1.05fr_.95fr] h-full p-12 gap-6" aria-label="Innovation Swimlanes">
        <div className="flex flex-col justify-center gap-5">
            <Reveal isActive={isActive} d={1} as="span" className="kicker">Act I</Reveal>
            <Reveal isActive={isActive} d={2} as="h2" className="h2-style">From Tweaks to Transformations</Reveal>
            <Reveal isActive={isActive} d={3} as="p" className="p-big-style">Improvements (left) unlock applications (right).</Reveal>
            <Reveal isActive={isActive} d={4} as="p" className="note">Same energy idea → broader uses over time.</Reveal>
        </div>
        <div className="flex items-center justify-center">
            <Reveal isActive={isActive} d={2} className="w-full h-full">
                <Panel className="p-6 h-full">
                    <div className="grid grid-cols-4 gap-5 h-full">
                        {[
                            { title: "Pumping", items: [{ year: 1698, name: "Savery", desc: "Mine dewatering" }, { year: 1712, name: "Newcomen", desc: "Atmospheric engine" }] },
                            { title: "Industrial Power", items: [{ year: "1765–82", name: "Watt", desc: "Condenser / rotary" }, { year: 1788, name: "", desc: "Centrifugal governor" }] },
                            { title: "Transport", items: [{ year: 1804, name: "", desc: "First locomotive haul" }, { year: "1825–30", name: "", desc: "Public & inter-city rail" }, { year: "1807–38", name: "", desc: "Steamboats & Atlantic" }] },
                            { title: "Electricity & Beyond", items: [{ year: 1884, name: "", desc: "Parsons turbine" }, { year: 1954, name: "", desc: "Nuclear steam cycle" }, { year: "1984–90", name: "", desc: "Solar-thermal CSP" }, { year: "2010–25", name: "", desc: "ORC/Kalina waste-heat" }] }
                        ].map(col => (
                            <div key={col.title}>
                                <h3 className="title-xl">{col.title}</h3>
                                {col.items.map(item => (
                                    <div key={item.desc} className="flex items-start gap-2.5 mb-4">
                                        <span className="dot bg-white/40"></span>
                                        <div>
                                            <h5 className="font-extrabold text-[15px]/[1.2] text-white m-0">{item.year} {item.name}</h5>
                                            <small className="block font-semibold text-xs/[1.35] text-indigo-200/80">{item.desc}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </Panel>
            </Reveal>
        </div>
    </section>
);

const Slide02D: React.FC<SlideProps> = ({ isActive, registerRef }) => (
    <section ref={registerRef} className="slide flex flex-col items-center justify-center h-full p-12 text-center" aria-label="The Branching Timeline">
        <Reveal isActive={isActive} d={1} as="h2" className="h2-style">The Branching Timeline</Reveal>
        <Reveal isActive={isActive} d={2} as="p" className="p-big-style mt-4 max-w-4xl mx-auto">The steam engine didn't just get better; it branched into entirely new industries.</Reveal>
        <div className="w-full max-w-6xl mx-auto mt-16 relative">
            <Reveal isActive={isActive} d={2}>
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/20 rounded-full -translate-y-1/2"></div>
            </Reveal>
            <div className="grid grid-cols-4 gap-8">
                {[
                    { d: 3, dir: 'down', icon: '⛏️', title: 'Mines & Pumping', year: 1698 },
                    { d: 4, dir: 'up', icon: '🏭', title: 'Manufacturing', year: 1781 },
                    { d: 5, dir: 'down', icon: '🚂', title: 'Transportation', year: 1804 },
                    { d: 6, dir: 'up', icon: '⚡', title: 'Electricity & Power', year: 1884 }
                ].map(node => (
                    <Reveal key={node.title} isActive={isActive} d={node.d} className={`flex items-center ${node.dir === 'down' ? 'flex-col pt-8' : 'flex-col-reverse pb-8'}`}>
                        <div className="w-1 h-8 bg-white/20"></div>
                        <div className="relative w-5 h-5 bg-white rounded-full border-4 border-bg-deep ring-4 ring-white/50 z-10 my-[-2px]"></div>
                        <Panel className={`${node.dir === 'down' ? 'mt-8' : 'mb-8'}`}>
                            <div className="text-4xl mb-2">{node.icon}</div>
                            <h5 className="font-bold text-lg">{node.title}</h5>
                            <small className="text-sm text-indigo-200/80">{node.year}</small>
                        </Panel>
                    </Reveal>
                ))}
            </div>
        </div>
        <Reveal isActive={isActive} d={7} as="p" className="note mt-16 text-xl max-w-3xl mx-auto">Your skills, when compounded with AI, can also branch out, opening doors to new, unexpected roles and industries.</Reveal>
    </section>
);

const Slide02B: React.FC<SlideProps> = ({ isActive, registerRef }) => {
    const chartData = useMemo(() => {
        const M = M_DATA;
        const minY = Math.floor(Math.min(...M.map(d => d.y)) / 10) * 10;
        const maxY = Math.max(...M.map(d => d.y));
        let cum = 0;
        const pts = M.map(d => { cum += d.w; return { y: d.y, cum, w: d.w, label: d.label }; });
        const maxCum = Math.max(...pts.map(p => p.cum));
        return { minY, maxY, pts, maxCum };
    }, []);
    
    const scale = (x: number, a1: number, a2: number, b1: number, b2: number) => b1 + ((x - a1) * (b2 - b1) / (a2 - a1));

    return (
    <section ref={registerRef} className="slide flex flex-col h-full py-12 px-2 gap-6" aria-label="Yield Curve">
        <div className="text-center max-w-5xl mx-auto">
            <Reveal isActive={isActive} d={1} as="span" className="kicker">Act II</Reveal>
            <Reveal isActive={isActive} d={2} as="h2" className="h2-style">The Innovation Yield Curve</Reveal>
            <Reveal isActive={isActive} d={3} as="p" className="p-big-style mt-4">Innovation isn't linear—it compounds. This curve plots the cumulative impact of steam technology over 300 years.</Reveal>
            <Reveal isActive={isActive} d={4} as="p" className="note mt-2">The pattern reveals a historical doubling of impact roughly every 89 years, visualizing the return on a single core technology.</Reveal>
        </div>
        <div className="flex-grow min-h-0 pt-4">
            <Reveal isActive={isActive} d={3} className="h-full">
                <Panel className="h-full flex flex-col p-6">
                    <div className="flex-grow min-h-0">
                        <svg viewBox="0 0 800 460" width="100%" height="100%" role="img" aria-label="Cumulative weighted innovation curve">
                            <text transform="rotate(-90)" y="10" x="-220" textAnchor="middle" fill="#cfe0ff" fontSize="12" fontWeight="600" letterSpacing="0.5">Cumulative Impact Score</text>
                            <line x1="30" y1="420" x2="780" y2="420" stroke="rgba(255,255,255,.25)" strokeWidth="1" />
                            <line x1="30" y1="20" x2="30" y2="420" stroke="rgba(255,255,255,.25)" strokeWidth="1" />
                            {Array.from({length: Math.ceil((chartData.maxY - chartData.minY) / 50) + 1}, (_, i) => chartData.minY + i * 50).map(y => (
                                <g key={y}>
                                    <line x1={scale(y, chartData.minY, chartData.maxY, 30, 780)} y1="420" x2={scale(y, chartData.minY, chartData.maxY, 30, 780)} y2="426" stroke="rgba(255,255,255,.25)" strokeWidth="1" />
                                    <text x={scale(y, chartData.minY, chartData.maxY, 30, 780)} y="448" textAnchor="middle" fill="#cfe0ff" fontSize="12">{y}</text>
                                </g>
                            ))}
                            <path d={chartData.pts.map((p,i) => `${i === 0 ? 'M' : 'L'} ${scale(p.y, chartData.minY, chartData.maxY, 30, 780)} ${scale(p.cum, 0, chartData.maxCum, 420, 26)}`).join(' ')} fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="2.2" />
                            {chartData.pts.map((p, i) => (
                                <circle key={i} cx={scale(p.y, chartData.minY, chartData.maxY, 30, 780)} cy={scale(p.cum, 0, chartData.maxCum, 420, 26)} r={3 + p.w * 2} fill="#fff" opacity=".9">
                                    <title>{`${p.y} · ${p.label} · weight ${p.w.toFixed(2)} · cumulative ${p.cum.toFixed(1)}`}</title>
                                </circle>
                            ))}
                        </svg>
                    </div>
                </Panel>
            </Reveal>
        </div>
    </section>
)};

const Slide02C: React.FC<SlideProps> = ({ isActive, registerRef }) => (
    <section ref={registerRef} className="slide flex flex-col h-full p-12 gap-4" aria-label="Innovation Data Deep Dive">
        <div className="text-center max-w-5xl mx-auto">
            <Reveal isActive={isActive} d={1} as="span" className="kicker">Data Deep Dive</Reveal>
            <Reveal isActive={isActive} d={2} as="h2" className="h2-style">Weighted Innovation Milestones</Reveal>
            <Reveal isActive={isActive} d={3} as="p" className="p-big-style mt-4">The raw data shows how innovations clustered over time, with each step assigned a weight for its relative impact.</Reveal>
        </div>
        <div className="flex-grow min-h-0 pt-4">
            <Reveal isActive={isActive} d={2} className="w-full h-full">
                <Panel className="p-4 h-full flex flex-col">
                    <h3 className="title-xl mb-2 flex-shrink-0">Full Milestone Table</h3>
                    <div className="overflow-auto flex-grow text-sm">
                        <table className="w-full border-collapse">
                            <thead className="text-left text-indigo-200/90 font-semibold">
                                <tr>
                                    <th className="p-2 border-b border-white/10 sticky top-0 bg-black/20 backdrop-blur-sm w-[8%]">Year</th>
                                    <th className="p-2 border-b border-white/10 sticky top-0 bg-black/20 backdrop-blur-sm">Milestone</th>
                                    <th className="p-2 border-b border-white/10 sticky top-0 bg-black/20 backdrop-blur-sm w-[20%]">Domain</th>
                                    <th className="p-2 border-b border-white/10 sticky top-0 bg-black/20 backdrop-blur-sm text-right w-[8%]">Weight</th>
                                </tr>
                            </thead>
                            <tbody className="text-indigo-50/90 font-medium">
                                {M_DATA.map(d => (
                                    <tr key={d.label} className="align-top">
                                        <td className="p-2 border-b border-white/5">{d.y}</td><td className="p-2 border-b border-white/5">{d.label}</td>
                                        <td className="p-2 border-b border-white/5 opacity-80">{d.domain}</td><td className="p-2 border-b border-white/5 text-right font-semibold">{d.w.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <small className="note mt-auto pt-2">Full data drives the charts; these are landmark examples.</small>
                </Panel>
            </Reveal>
        </div>
    </section>
);

const Slide03: React.FC<SlideProps> = ({ isActive, registerRef }) => {
    const [imgError, setImgError] = useState(false);
    useEffect(() => { if (isActive) setImgError(false); }, [isActive]);

    const newImageUrl = "https://raw.githubusercontent.com/tonicsouls/slides-/6ced54ab4db4785189f4f9acabdc40e17ba9764f/0902%20images/Gemini_Generated_Image_pibd7cpibd7cpibd.png";

    return (
        <section ref={registerRef} className="slide grid grid-cols-[1.05fr_.95fr] h-full p-12 gap-6" aria-label="The Digital Workforce">
            <div className="flex flex-col justify-center gap-5">
                <Reveal isActive={isActive} d={1} as="span" className="kicker">The New Reality</Reveal>
                <Reveal isActive={isActive} d={1} as="h2" className="h2-style">The Digital Workforce</Reveal>
                <Reveal isActive={isActive} d={2} as="p" className="p-big-style">The job search is still about “digging.” Today the most powerful shovels are digital—and accessible to everyone.</Reveal>
                <ul className="bullets">
                    <Reveal isActive={isActive} d={3} as="li"><strong>Old Mindset:</strong> Single path, one skill set, brute force.</Reveal>
                    <Reveal isActive={isActive} d={4} as="li"><strong>New Mindset:</strong> Many companies still use old shovels—bring the 1% upgrade.</Reveal>
                    <Reveal isActive={isActive} d={5} as="li"><strong>New Strategy:</strong> Use AI to compound small improvements in your workflow.</Reveal>
                </ul>
                <Reveal isActive={isActive} d={6} as="p" className="note">We’re not just looking for a job—we're looking for where our skills have the greatest impact.</Reveal>
            </div>
            <div className="flex items-center justify-center">
                <Reveal isActive={isActive} d={3} className="w-full h-full">
                    <Panel className="flex items-center justify-center h-full w-full p-4">
                        <figure className="w-full h-full">
                            <img src={imgError ? "https://picsum.photos/800/450" : newImageUrl} alt="Artistic representation of a modern, strategic document, symbolizing a new digital tool." loading="lazy" onError={() => setImgError(true)} className="w-full h-full object-contain rounded-xl" />
                        </figure>
                    </Panel>
                </Reveal>
            </div>
        </section>
    );
};

const Slide04: React.FC<SlideProps> = ({ isActive, registerRef }) => (
    <section ref={registerRef} className="slide grid grid-cols-[1.05fr_.95fr] h-full p-12 gap-6" aria-label="My Professional Story">
        <div className="flex flex-col justify-center gap-5">
            <Reveal isActive={isActive} d={1} as="span" className="kicker">My Journey</Reveal>
            <Reveal isActive={isActive} d={1} as="h2" className="h2-style">My Professional Story</Reveal>
            <ul className="bullets">
                <Reveal isActive={isActive} d={2} as="li">Started as an <strong>Oil and Gas Landman</strong>.</Reveal>
                <Reveal isActive={isActive} d={3} as="li">Moved into <strong>car sales</strong>, then ran a <strong>staffing agency</strong> (earned <strong>PHR</strong>).</Reveal>
                <Reveal isActive={isActive} d={4} as="li"><strong>CPG loyalty data</strong>, became a <strong>Professional Scrum Master</strong>, led Argentina team, scaled loyalty/mobile SaaS.</Reveal>
                <Reveal isActive={isActive} d={5} as="li"><strong>MBA</strong> in Data Analytics.</Reveal>
                <Reveal isActive={isActive} d={6} as="li">Startups & enterprise SaaS — closed <strong>multi-million dollar deals</strong>.</Reveal>
                <Reveal isActive={isActive} d={7} as="li">Intentionally stepped into <strong>new, non-specialist areas</strong> and used <strong>AI tools</strong> to ramp fast and translate prior skills.</Reveal>
            </ul>
            <Reveal isActive={isActive} d={8} as="p" className="note">Each step added tools; perseverance connected them all.</Reveal>
        </div>
        <div className="flex items-center justify-center">
            <Reveal isActive={isActive} d={3} className="w-full">
                <Panel className="h-full flex flex-col justify-center">
                    <div className="grid grid-cols-4 gap-x-4 gap-y-8">
                        {[
                            { color: '#b71c36', title: 'Landman', desc: 'Oil & Gas' }, { color: '#ff6b6b', title: 'Car Sales', desc: 'Retail' },
                            { color: '#6991ff', title: 'Staffing', desc: 'PHR' }, { color: '#ffd166', title: 'Volunteer', desc: 'Independent' },
                            { color: '#30d0a7', title: 'CPG Loyalty', desc: 'PSM • Mobile SaaS' }, { color: '#8ecae6', title: 'MBA', desc: 'Data Analytics' },
                            { color: '#0a2b6f', title: 'Startups', desc: 'Enterprise SaaS' }
                        ].map(item => (
                            <div key={item.title} className="flex items-start gap-2.5">
                                <span className="dot" style={{ background: item.color }}></span>
                                <div><h5 className="m-0 font-extrabold text-[15px]/[1.2] text-white">{item.title}</h5><small className="block font-semibold text-xs/[1.35] text-indigo-200/80">{item.desc}</small></div>
                            </div>
                        ))}
                    </div>
                    <p className="note mt-6 text-center">Next: strategic perseverance + AI.</p>
                </Panel>
            </Reveal>
        </div>
    </section>
);

const VideoCard: React.FC<{title: string, videoId: string, caption: string, link: string}> = ({ title, videoId, caption, link }) => (
    <figure className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
        <div className="aspect-video relative w-full">
            <iframe className="absolute inset-0 w-full h-full border-0 bg-black" title={title} loading="lazy" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&color=white`}></iframe>
        </div>
        <figcaption className="p-3 border-t border-white/10 font-semibold text-sm/[1.4] text-indigo-100/90">{caption} · <a href={link} target="_blank" rel="noopener" className="text-white hover:underline">Open on YouTube</a></figcaption>
    </figure>
);

const Slide05: React.FC<SlideProps> = ({ isActive, registerRef }) => (
    <section ref={registerRef} className="slide grid grid-cols-[1.05fr_.95fr] h-full p-12 gap-6" aria-label="Actionable Strategies">
        <div className="flex flex-col justify-center gap-5">
            <Reveal isActive={isActive} d={1} as="span" className="kicker">Actionable Strategies</Reveal>
            <Reveal isActive={isActive} d={1} as="h2" className="h2-style">Your Turn: How to Leverage AI Tools</Reveal>
            <Reveal isActive={isActive} d={2} as="p" className="p-big-style">Start with a powerful AI conversational tool and follow these steps.</Reveal>
            <Reveal isActive={isActive} d={3} className="grid gap-3">
                <Panel><h3>1) Understand Your Value</h3><p className="note">Upload your CV + JD. Ask for strengths, risks, and rewrites of 3 CV bullets to match the role.</p></Panel>
                <Panel><h3>2) Conduct Deep Research</h3><p className="note">Upload PDFs/10-Ks/press. Ask for <strong>role-specific</strong> interview questions tied to citations.</p></Panel>
                <Panel><h3>3) Practice with a Mock Interview</h3><p className="note">Paste interviewer’s LinkedIn and practice conversational Q&A with coaching.</p></Panel>
            </Reveal>
        </div>
        <div className="flex items-center justify-center">
            <Reveal isActive={isActive} d={3} className="w-full">
                <Panel className="h-full">
                    <h3 className="title-xl mb-3">Walkthrough videos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <VideoCard title="Talking with AI in the Browser" videoId="3XH75KUU91A" caption="Talking with AI in the Browser" link="https://youtu.be/3XH75KUU91A" />
                       <VideoCard title="Talking with Gemini (Phone) — Part 1" videoId="_R9XS2r1zYc" caption="Talking with Gemini (Phone) — Part 1" link="https://youtu.be/_R9XS2r1zYc" />
                       <VideoCard title="Talking with Gemini (Phone) — Part 2" videoId="RXjTWyxhjXw" caption="Talking with Gemini (Phone) — Part 2" link="https://youtu.be/RXjTWyxhjXw" />
                       <VideoCard title="SEEQ Interview reference (NotebookLM + AI, train2)" videoId="lUaoYybGdmI" caption="SEEQ Interview reference (NotebookLM + AI)" link="https://youtu.be/lUaoYybGdmI" />
                       <VideoCard title="Additional Walkthrough" videoId="3E-1ETRZMvg" caption="Additional Walkthrough" link="https://youtu.be/3E-1ETRZMvg" />
                    </div>
                </Panel>
            </Reveal>
        </div>
    </section>
);

const Slide06: React.FC<SlideProps> = ({ isActive, registerRef }) => (
    <section ref={registerRef} className="slide grid grid-cols-[1.05fr_.95fr] h-full p-12 gap-6" aria-label="Turning Point">
        <div className="flex flex-col justify-center gap-5">
            <Reveal isActive={isActive} d={1} as="span" className="kicker">Turning Point</Reveal>
            <Reveal isActive={isActive} d={1} as="h2" className="h2-style">The Direct Approach: A Letter to the CEO</Reveal>
            <ul className="bullets">
                <Reveal isActive={isActive} d={2} as="li">Wrote a personal letter to the CEO for a role I was <strong>“not even qualified for.”</strong></Reveal>
                <Reveal isActive={isActive} d={3} as="li">Targeted, respectful, specific—not a mass email.</Reveal>
                <Reveal isActive={isActive} d={4} as="li">It made an impact and started a buzz.</Reveal>
            </ul>
            <Reveal isActive={isActive} d={5} as="p" className="note">Next: the actual letter (fully readable).</Reveal>
        </div>
        <div className="flex items-center justify-center">
            <Reveal isActive={isActive} d={3} className="w-full">
                <Panel className="flex items-center justify-center h-full">
                    <svg viewBox="0 0 500 280" width="92%" aria-hidden="true"><rect x="20" y="20" width="460" height="240" rx="16" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.18)"/><rect x="60" y="70" width="380" height="12" fill="#fff" opacity=".8"/><rect x="60" y="100" width="320" height="10" fill="#fff" opacity=".5"/><rect x="60" y="120" width="360" height="10" fill="#fff" opacity=".5"/><rect x="60" y="140" width="340" height="10" fill="#fff" opacity=".5"/><rect x="60" y="160" width="300" height="10" fill="#fff" opacity=".5"/><rect x="60" y="180" width="360" height="10" fill="#fff" opacity=".5"/></svg>
                </Panel>
            </Reveal>
        </div>
    </section>
);

const Slide07: React.FC<SlideProps & {onOpenModal: () => void, onCopy: () => void, isCopied: boolean}> = ({ isActive, registerRef, onOpenModal, onCopy, isCopied }) => {
    return (
        <section ref={registerRef} className="slide grid grid-cols-[1.05fr_.95fr] h-full p-12 gap-6" aria-label="Exhibit: Full Letter">
            <div className="flex flex-col justify-center gap-5">
                <Reveal isActive={isActive} d={1} as="span" className="kicker">Exhibit</Reveal>
                <Reveal isActive={isActive} d={1} as="h2" className="h2-style">My Letter to Seeq CEO, Dr. Graham</Reveal>
                <Reveal isActive={isActive} d={2} as="p" className="p-big-style">Full text — so the room can see structure, tone, and metrics.</Reveal>
                <Reveal isActive={isActive} d={3} className="flex gap-2 flex-wrap">
                    <button className="btn btn-alt" onClick={onOpenModal}>Open Fullscreen</button>
                    <button className="btn" onClick={onCopy}>{isCopied ? 'Copied!' : 'Copy Letter'}</button>
                </Reveal>
            </div>
            <div className="flex items-center justify-center">
                 <Reveal isActive={isActive} d={2} className="w-full h-full">
                    <Panel className="p-6 h-full flex flex-col">
                        <pre className="flex-1 overflow-auto whitespace-pre-wrap font-medium text-base/relaxed text-indigo-50/90 my-2">{letterTextContent}</pre>
                    </Panel>
                </Reveal>
            </div>
        </section>
    );
};

const Slide08: React.FC<SlideProps> = ({ isActive, registerRef }) => (
    <section ref={registerRef} className="slide grid grid-cols-[1.05fr_.95fr] h-full p-12 gap-6" aria-label="Outcome">
        <div className="flex flex-col justify-center gap-5">
            <Reveal isActive={isActive} d={1} as="span" className="kicker">Outcome</Reveal>
            <Reveal isActive={isActive} d={1} as="h2" className="h2-style">Strategic Perseverance Pays Off</Reveal>
            <ul className="bullets">
                <Reveal isActive={isActive} d={2} as="li">Offer secured after targeted, persistent approach.</Reveal>
                <Reveal isActive={isActive} d={3} as="li">Guaranteed compensation: <strong>$210,000</strong> in year one.</Reveal>
                <Reveal isActive={isActive} d={4} as="li">Proof that small, smart improvements compound.</Reveal>
            </ul>
            <Reveal isActive={isActive} d={5} as="p" className="note">System: profile → research → targeting → CEO letter → interviews → offer.</Reveal>
        </div>
        <div className="flex items-center justify-center">
            <Reveal isActive={isActive} d={3} className="w-full">
                <Panel className="flex items-center justify-center h-full">
                    <svg viewBox="0 0 520 260" width="92%" aria-hidden="true"><defs><linearGradient id="grad" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stopColor="rgba(255,255,255,.2)"/><stop offset="100%" stopColor="#fff"/></linearGradient></defs><rect x="20" y="200" width="60" height="20" fill="url(#grad)"/><rect x="90" y="180" width="60" height="40" fill="url(#grad)"/><rect x="160" y="160" width="60" height="60" fill="url(#grad)"/><rect x="230" y="130" width="60" height="90" fill="url(#grad)"/><rect x="300" y="90" width="60" height="130" fill="url(#grad)"/><rect x="370" y="50" width="60" height="170" fill="url(#grad)"/><rect x="440" y="20" width="60" height="200" fill="url(#grad)"/></svg>
                </Panel>
            </Reveal>
        </div>
    </section>
);

const Slide08A: React.FC<SlideProps> = ({ isActive, registerRef }) => (
    <section ref={registerRef} className="slide grid grid-cols-[1.05fr_.95fr] h-full p-12 gap-6" aria-label="Apply the Pattern">
        <div className="flex flex-col justify-center gap-5">
            <Reveal isActive={isActive} d={1} as="span" className="kicker">Act III</Reveal>
            <Reveal isActive={isActive} d={2} as="h2" className="h2-style">AI = Your New Shovel</Reveal>
            <Reveal isActive={isActive} d={3} as="p" className="p-big-style">Small daily habits → faster throughput & better hit rate.</Reveal>
        </div>
        <div className="flex items-center justify-center">
             <Reveal isActive={isActive} d={2} className="w-full h-full">
                <Panel className="p-6 h-full">
                    <div className="grid grid-cols-4 gap-5 h-full">
                        {[
                            { title: "Drafting", items: [{ name: "CV bullets", desc: "3 rewrites / role" }, { name: "Cover letter", desc: "120-word value pitch" }] },
                            { title: "Research", items: [{ name: "10-K parse", desc: "6 Qs w/ citations" }, { name: "Competitors", desc: "3 insights" }] },
                            { title: "Outreach", items: [{ name: "Personalized note", desc: "75 words, 1 ask" }, { name: "Follow-up", desc: "2 value links" }] },
                            { title: "Interviewing", items: [{ name: "Mock Q&A", desc: "STAR coaching" }, { name: "Mini demo", desc: "1-pager or gist" }] }
                        ].map(col => (
                            <div key={col.title}>
                                <h3 className="title-xl">{col.title}</h3>
                                {col.items.map(item => (
                                    <div key={item.name} className="flex items-start gap-2.5 mb-4">
                                        <span className="dot bg-white/40"></span>
                                        <div><h5 className="m-0 font-extrabold text-[15px]/[1.2] text-white">{item.name}</h5><small className="block font-semibold text-xs/[1.35] text-indigo-200/80">{item.desc}</small></div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <p className="note mt-2.5">Track: mins/app, apps/week, replies, interviews, time-to-first interview.</p>
                </Panel>
            </Reveal>
        </div>
    </section>
);

const PromptCard: React.FC<{title: string, prompt: string, link: string, onCopy: ()=>void, isCopied: boolean}> = ({title, prompt, link, onCopy, isCopied}) => (
    <div className="flex flex-col gap-2.5 p-4 rounded-xl border border-white/15 bg-white/5">
        <h4 className="font-archivo font-extrabold text-base">{title}</h4>
        <pre className="m-0 whitespace-pre-wrap bg-white/5 border border-dashed border-white/20 p-2.5 rounded-lg text-indigo-100/90 font-medium text-[13px]/[1.45] flex-grow">{prompt}</pre>
        <div className="flex gap-2 flex-wrap mt-auto pt-2">
            <a className="btn btn-ghost" href={link} target="_blank" rel="noopener">{title.split('—')[0].trim()}</a>
            <button className="btn btn-alt" onClick={onCopy}>{isCopied ? 'Copied!' : 'Copy prompt'}</button>
        </div>
    </div>
);

const Slide09: React.FC<SlideProps & {onCopy: (key: string, text: string) => void, copiedState: Record<string, boolean>}> = ({ isActive, registerRef, onCopy, copiedState }) => {
    const prompts = {
        chatgpt: "You are my job-search copilot. I’ll paste my CV and a job description. Identify my top strengths vs the JD, the risks/gaps, and rewrite 3 bullets from my CV that better match the role without exaggeration. Output: strengths, risks, 3 rewritten bullets.",
        gemini: "You are my research analyst. I’ll upload a 10-K, recent press, and product pages. Produce 6 targeted questions for an interview for ROLE, each tied to a specific passage/citation, plus a one-paragraph insight summary.",
        copilot: "Act as an interviewer for ROLE. Use my CV and this LinkedIn summary of the interviewer. Ask 8 questions, one at a time, with follow-ups. After each of my answers, give brief coaching to tighten STAR structure."
    };
    return (
    <section ref={registerRef} className="slide grid grid-cols-[1.05fr_.95fr] h-full p-12 gap-6" aria-label="Overview & Call to Action">
        <div className="flex flex-col justify-center gap-5">
            <Reveal isActive={isActive} d={1} as="span" className="kicker">Synopsis</Reveal>
            <Reveal isActive={isActive} d={1} as="h2" className="h2-style">Overview & Call to Action</Reveal>
            <ul className="bullets">
                <Reveal isActive={isActive} d={2} as="li"><strong>Watt Principle:</strong> 1% improvements compound.</Reveal>
                <Reveal isActive={isActive} d={3} as="li"><strong>Pick one skill</strong> to start (data viz, AI prompting, storytelling, automation).</Reveal>
                <Reveal isActive={isActive} d={4} as="li"><strong>Run the system:</strong> profile → research → targeted outreach.</Reveal>
            </ul>
            <Reveal isActive={isActive} d={5} as="p" className="note"><strong>Group Target:</strong> choose a skill, an industry, and a 30-day micro-project. Share progress weekly.</Reveal>
        </div>
        <div className="flex items-center justify-center">
            <Reveal isActive={isActive} d={3} className="w-full">
                <Panel className="h-full">
                    <h3 className="title-xl mb-3">Start now with these prompts</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 h-full">
                        <PromptCard title="ChatGPT — CV ➜ Role Fit" prompt={prompts.chatgpt} link="https://chat.openai.com" onCopy={() => onCopy('chatgpt', prompts.chatgpt)} isCopied={!!copiedState['chatgpt']} />
                        <PromptCard title="Gemini — Company Deep Research" prompt={prompts.gemini} link="https://gemini.google.com" onCopy={() => onCopy('gemini', prompts.gemini)} isCopied={!!copiedState['gemini']} />
                        <PromptCard title="Microsoft Copilot — Mock Interview" prompt={prompts.copilot} link="https://copilot.microsoft.com" onCopy={() => onCopy('copilot', prompts.copilot)} isCopied={!!copiedState['copilot']} />
                    </div>
                    <p className="note mt-3">Copy a prompt, open a tool, and time-box a 30-minute micro-project today.</p>
                </Panel>
            </Reveal>
        </div>
    </section>
)};

const Slide09A: React.FC<SlideProps> = ({ isActive, registerRef }) => (
    <section ref={registerRef} className="slide flex flex-col items-center justify-center h-full p-12 text-center" aria-label="1% Compounding">
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-3 gap-8 text-center">
                <Reveal isActive={isActive} d={1} className="flex flex-col">
                    <span className="font-archivo font-extrabold text-7xl text-white">1.35×</span><span className="text-2xl font-semibold text-indigo-200/90 mt-2">30 days</span>
                </Reveal>
                <Reveal isActive={isActive} d={2} className="flex flex-col">
                    <span className="font-archivo font-extrabold text-7xl text-white">1.82×</span><span className="text-2xl font-semibold text-indigo-200/90 mt-2">60 days</span>
                </Reveal>
                <Reveal isActive={isActive} d={3} className="flex flex-col">
                    <span className="font-archivo font-extrabold text-7xl text-white">2.46×</span><span className="text-2xl font-semibold text-indigo-200/90 mt-2">90 days</span>
                </Reveal>
            </div>
            <Reveal isActive={isActive} d={4} as="p" className="text-4xl font-semibold text-indigo-100/90 mt-8">Same hours, better tool, more output.</Reveal>
        </div>
    </section>
);

const Slide10: React.FC<SlideProps> = ({ isActive, registerRef }) => (
    <section ref={registerRef} className="slide grid grid-cols-[1.05fr_.95fr] h-full p-12 gap-6" aria-label="Conclusion">
        <div className="flex flex-col justify-center gap-5">
            <Reveal isActive={isActive} d={1} as="span" className="kicker">Conclusion</Reveal>
            <Reveal isActive={isActive} d={1} as="h2" className="h2-style">Your Moment of Perseverance</Reveal>
            <Reveal isActive={isActive} d={2} as="p" className="p-big-style">The tools are here. What’s left is courage—and steady 1% improvements.</Reveal>
        </div>
        <div className="relative flex items-center justify-center">
            <Reveal isActive={isActive} d={3} className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 800 600" className="w-full h-full" aria-hidden="true">
                    <circle cx="400" cy="300" r="150" fill="rgba(255,255,255,.1)"/><text x="400" y="300" textAnchor="middle" dominantBaseline="central" fontFamily="Archivo" fontSize="200" fill="var(--twc-blue)" opacity=".2">1%</text>
                </svg>
            </Reveal>
            <Reveal isActive={isActive} d={4}><Chip className="right-32 bottom-48">Courage</Chip></Reveal>
            <Reveal isActive={isActive} d={5}><Chip className="left-32 top-48">Perseverance</Chip></Reveal>
        </div>
    </section>
);

const allSlides = [Slide01, Slide02, Slide02A, Slide02D, Slide02B, Slide02C, Slide03, Slide04, Slide05, Slide06, Slide07, Slide08, Slide08A, Slide09, Slide09A, Slide10];

// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isModalOpen, setModalOpen] = useState(false);
    const [copiedState, setCopiedState] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);

    const deckRef = useRef<HTMLDivElement>(null);
    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

    const totalSlides = allSlides.length;

    const navigate = useCallback((offset: number) => {
        setCurrentSlide(prev => (prev + offset + totalSlides) % totalSlides);
    }, [totalSlides]);

    const fit = useCallback(() => {
        if (deckRef.current?.parentElement) {
            const wrap = deckRef.current.parentElement;
            const scale = Math.min(wrap.clientWidth / 1600, wrap.clientHeight / 900);
            deckRef.current.style.transform = `scale(${scale})`;
        }
    }, []);

    const handleCopy = useCallback((key: string, text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedState(prev => ({ ...prev, [key]: true }));
            const timer = setTimeout(() => {
                setCopiedState(prev => ({ ...prev, [key]: false }));
            }, 1200);
            return () => clearTimeout(timer);
        });
    }, []);

    const handleExport = useCallback(async (all = false) => {
        const html2canvas = (window as any).html2canvas;
        if (!html2canvas) {
            console.error("html2canvas not loaded");
            return;
        }
        
        setIsLoading(true);
        const originalSlide = currentSlide;

        const exportSlide = async (index: number) => {
            if (!slideRefs.current[index]) return;
            
            if (index !== originalSlide) {
                setCurrentSlide(index);
                await new Promise(r => setTimeout(r, 100));
            }

            const canvas = await html2canvas(slideRefs.current[index], { backgroundColor: null, scale: 2 });
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = `Slide_${index + 1}.png`;
            a.click();
            await new Promise(r => setTimeout(r, 60));
        };

        try {
            if (all) {
                for (let i = 0; i < totalSlides; i++) await exportSlide(i);
            } else {
                await exportSlide(currentSlide);
            }
        } catch (error) {
            console.error("Failed to export slide(s):", error);
        } finally {
            if (currentSlide !== originalSlide) setCurrentSlide(originalSlide);
            setIsLoading(false);
        }
    }, [currentSlide, totalSlides]);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    }, [fit]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') navigate(1);
            if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') navigate(-1);
            if (e.key === 'f' || e.key === 'F') toggleFullScreen();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navigate]);

    return (
        <div className="fixed inset-[72px_16px_80px] grid place-items-center">
            <div id="deck" ref={deckRef} className="deck relative w-[1600px] h-[900px] rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,.45),inset_0_0_0_1px_rgba(255,255,255,.06)] origin-top transition-transform duration-300 ease-in-out bgfx" role="region" aria-label="Presentation slides">
                <div className="absolute top-0 left-0 right-0 h-[72px] flex items-center px-7 gap-3.5 bg-gradient-to-r from-twc-blue to-[#041a44] border-b border-white/10 z-10">
                    <BrandStarIcon /><span className="font-archivo font-extrabold text-xl tracking-wide">1% Better Series</span>
                    <span id="slidenum" className="ml-auto font-semibold text-sm text-indigo-100/90" aria-live="polite">{currentSlide + 1} / {totalSlides}</span>
                </div>
                
                <div className="w-full h-full pt-[72px]">
                    {allSlides.map((SlideComponent, i) => (
                        <div key={i} className={`w-full h-full ${i !== currentSlide ? 'hidden' : ''}`} aria-roledescription="slide">
                            { i === 10 ? <Slide07 isActive={i === currentSlide} registerRef={el => slideRefs.current[i] = el} onOpenModal={() => setModalOpen(true)} onCopy={() => handleCopy('letter', letterTextContent)} isCopied={!!copiedState['letter']} />
                            : i === 13 ? <Slide09 isActive={i === currentSlide} registerRef={el => slideRefs.current[i] = el} onCopy={handleCopy} copiedState={copiedState} />
                            : <SlideComponent isActive={i === currentSlide} registerRef={el => slideRefs.current[i] = el} />}
                        </div>
                    ))}
                </div>
            </div>

            {isModalOpen && (
                <div id="modal" className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 animate-fadeIn" role="dialog" aria-modal="true">
                    <div className="bg-[#0b1224] border border-white/15 rounded-2xl p-6 w-[min(1100px,92vw)] max-h-[88vh] flex flex-col">
                        <h3 className="font-archivo font-extrabold text-2xl mt-0">Full Cover Letter</h3>
                        <pre className="flex-1 overflow-auto whitespace-pre-wrap font-medium text-lg/relaxed text-indigo-50/90 my-4">{letterTextContent}</pre>
                        <div className="flex gap-2 justify-end">
                            <button className="btn btn-alt" onClick={() => setModalOpen(false)}>Close</button>
                            <button className="btn" onClick={() => handleCopy('modalLetter', letterTextContent)}>{copiedState['modalLetter'] ? 'Copied!' : 'Copy Letter'}</button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="fixed left-1/2 -translate-x-1/2 bottom-4 flex gap-2.5 z-10 p-1.5 bg-bg-deep/60 rounded-2xl border border-white/10 backdrop-blur-md" role="toolbar" aria-label="Slide controls">
                <button className="btn btn-alt" onClick={() => navigate(-1)} aria-label="Previous slide"><ChevronLeftIcon /></button>
                <button className="btn" onClick={() => navigate(1)} aria-label="Next slide"><ChevronRightIcon /></button>
                <button className="btn btn-alt" onClick={() => handleExport(false)} disabled={isLoading} aria-label="Export current slide as PNG"><DownloadIcon /> {isLoading ? '...' : 'PNG'}</button>
                <button className="btn btn-alt" onClick={() => handleExport(true)} disabled={isLoading} aria-label="Export all slides as PNGs">All PNGs</button>
                <button className="btn btn-alt" onClick={toggleFullScreen} aria-label="Toggle fullscreen"><ExpandIcon /></button>
            </div>
            
            <style>{`
                .bgfx::before{content:"";position:absolute;inset:0;background:
                    radial-gradient(1200px 800px at 80% 20%, rgba(191,13,62,.18), transparent 60%),
                    radial-gradient(1600px 1200px at 20% 80%, rgba(0,32,91,.22), transparent 65%);pointer-events:none}
                .bgfx::after{content:"";position:absolute;inset:0;background-image:
                    linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px);
                    background-size:48px 48px;opacity:.18;mix-blend:screen;pointer-events:none}
                .h2-style { @apply font-archivo font-extrabold text-[56px] leading-[1.08] m-0; }
                .p-big-style { @apply font-inter font-semibold text-[28px] leading-[1.3] text-indigo-100/90; }
                .kicker { @apply inline-block font-inter font-semibold text-sm tracking-[.18em] uppercase text-indigo-300/80; }
                .bullets { @apply mt-2 pl-4; }
                .bullets li { @apply font-inter font-medium text-2xl leading-[1.35] my-[0.4rem] text-indigo-50/95 pl-2; }
                .note { @apply font-inter font-medium text-lg leading-snug text-indigo-200/90; }
                .title-xl { @apply font-archivo font-extrabold text-2xl mb-4; }
                .dot { @apply flex-shrink-0 w-[18px] h-[18px] rounded-full border-[3px] border-white shadow-lg; }
                .btn { @apply flex items-center justify-center gap-2 bg-white text-bg-deep border-0 px-3.5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer shadow-lg shadow-black/30 transition-all duration-200 min-w-[50px]; }
                .btn:hover:not(:disabled) { @apply -translate-y-0.5 shadow-xl shadow-black/40; }
                .btn:disabled { @apply opacity-50 cursor-not-allowed; }
                .btn-alt { @apply bg-transparent text-indigo-100/95 border border-white/20; }
                .btn-ghost { @apply bg-transparent border border-white/25 text-white; }
            `}</style>
        </div>
    );
};

export default App;

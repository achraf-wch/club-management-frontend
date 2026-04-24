import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../Context/AuthContext';
import MemberLayout from '../components/MemberLayout';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:          #080e1a;
    --bg2:         #0c1424;
    --panel:       #0f1c30;
    --panel2:      #132035;
    --border:      rgba(255,255,255,0.07);
    --border2:     rgba(59,130,246,0.25);
    --blue:        #3b82f6;
    --blue-light:  #60a5fa;
    --cyan:        #06b6d4;
    --teal:        #14b8a6;
    --white:       #f8fafc;
    --grey:        #64748b;
    --grey2:       #94a3b8;
    --green:       #10b981;
    --green-bg:    rgba(16,185,129,0.1);
    --green-border:rgba(16,185,129,0.3);
    --red-bg:      rgba(239,68,68,0.1);
    --red-border:  rgba(239,68,68,0.3);
    --red:         #f87171;
    --yellow:      #fbbf24;
    --purple:      #a78bfa;
    --glow:        rgba(59,130,246,0.15);
    --glow2:       rgba(6,182,212,0.1);
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --topbar-bg: rgba(8,14,26,0.85);
    --footer-bg: #1a3a5c;
    --shadow-card: 0 8px 32px rgba(0,0,0,0.4);
    --accent-red: #e74c3c;
  }

  .light-mode {
    --bg:          #f0f4ff;
    --bg2:         #e8eeff;
    --panel:       #ffffff;
    --panel2:      #f5f8ff;
    --border:      rgba(59,130,246,0.15);
    --border2:     rgba(59,130,246,0.35);
    --blue:        #2563eb;
    --blue-light:  #3b82f6;
    --cyan:        #0891b2;
    --teal:        #0d9488;
    --white:       #1e293b;
    --grey:        #64748b;
    --grey2:       #475569;
    --green:       #059669;
    --green-bg:    rgba(5,150,105,0.08);
    --green-border:rgba(5,150,105,0.25);
    --red-bg:      rgba(220,38,38,0.06);
    --red-border:  rgba(220,38,38,0.25);
    --red:         #dc2626;
    --yellow:      #d97706;
    --purple:      #7c3aed;
    --glow:        rgba(59,130,246,0.08);
    --glow2:       rgba(8,145,178,0.06);
    --text-primary: #1e293b;
    --text-secondary: #475569;
    --topbar-bg: rgba(240,244,255,0.92);
    --footer-bg: #1e3a5f;
    --shadow-card: 0 4px 24px rgba(37,99,235,0.12), 0 1px 4px rgba(0,0,0,0.05);
    --accent-red: #dc2626;
  }

  .light-mode .mem-root {
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.1) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 90% 80%, rgba(8,145,178,0.07) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 20% 60%, rgba(220,38,38,0.04) 0%, transparent 50%) !important;
  }

  .light-mode .mem-dcard {
    background: linear-gradient(160deg, #dbeafe 0%, #eff6ff 50%, #f0f9ff 100%) !important;
    box-shadow: 0 20px 60px rgba(37,99,235,0.15), 0 0 0 1px rgba(59,130,246,0.2) !important;
  }
  .light-mode .mem-dcard::before {
    background: linear-gradient(90deg, transparent, rgba(8,145,178,0.5), transparent) !important;
  }
  .light-mode .mem-stat-card {
    background: #1e3a5f !important;
    border-color: rgba(59,130,246,0.2) !important;
    box-shadow: 0 8px 24px rgba(10,25,60,0.25) !important;
  }
  .light-mode .mem-stat-val { color: #f8fafc !important; }
  .light-mode .mem-stat-lbl { color: #93c5fd !important; }
  .light-mode .mem-stat-bar-track { background: rgba(255,255,255,0.1) !important; }
  .light-mode .mem-stat-icon-green  { background: rgba(16,185,129,0.18) !important; border-color: rgba(16,185,129,0.35) !important; }
  .light-mode .mem-stat-icon-purple { background: rgba(167,139,250,0.18) !important; border-color: rgba(167,139,250,0.35) !important; }
  .light-mode .mem-dcard-name { color: #1e293b !important; }
  .light-mode .mem-dcard-avatar { box-shadow: 0 8px 24px rgba(8,145,178,0.25) !important; }
  .light-mode .mem-footer-copy { color: rgba(255,255,255,0.5) !important; }
  .light-mode .mem-activity-item {
    background: #f8faff !important;
    border-color: rgba(59,130,246,0.12) !important;
  }
  .light-mode .mem-activity-item:hover {
    border-color: rgba(59,130,246,0.3) !important;
    background: rgba(59,130,246,0.04) !important;
  }
  .light-mode .mem-event-card { background: #f8faff !important; box-shadow: 0 2px 8px rgba(37,99,235,0.08); }
  .light-mode .mem-ach { background: #f8faff !important; }
  .light-mode .mem-club-stat { background: #f8faff !important; }
  .light-mode .mem-panel-head { background: rgba(59,130,246,0.04); }
  .light-mode .mem-orb-1 { background: rgba(37,99,235,0.12) !important; }
  .light-mode .mem-orb-2 { background: rgba(220,38,38,0.08) !important; }
  .light-mode .mem-orb-3 { background: rgba(8,145,178,0.1) !important; }
  .light-mode .mem-orb-4 { background: rgba(37,99,235,0.06) !important; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes pulse-glow {
    0%,100% { box-shadow: 0 0 20px rgba(59,130,246,0.2); }
    50%      { box-shadow: 0 0 40px rgba(59,130,246,0.4); }
  }
  @keyframes shimmer  { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
  @keyframes float    { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
  @keyframes float2   { 0%,100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-20px) translateX(10px); } }
  @keyframes float3   { 0%,100% { transform: translateY(0px) translateX(0px); } 50% { transform: translateY(-15px) translateX(-10px); } }
  @keyframes badge-pop { from { transform: scale(0); } to { transform: scale(1); } }
  @keyframes bell-ring {
    0%,100% { transform: rotate(0deg); }
    15%      { transform: rotate(14deg); }
    30%      { transform: rotate(-12deg); }
    45%      { transform: rotate(10deg); }
    60%      { transform: rotate(-8deg); }
    75%      { transform: rotate(5deg); }
  }
  @keyframes dropdown-in {
    from { opacity:0; transform: translateY(-8px) scale(0.96); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }

  .mem-root {
    min-height: 100vh;
    background: var(--bg);
    background-image:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 90% 80%, rgba(6,182,212,0.07) 0%, transparent 60%);
    font-family: 'DM Sans', sans-serif;
    color: var(--white);
    transition: background 0.4s ease, color 0.4s ease;
  }

  .mem-orbs { position: fixed; inset: 0; overflow: hidden; pointer-events: none; }
  .mem-orb { position: absolute; border-radius: 50%; filter: blur(60px); transition: background 0.5s ease; }
  .mem-orb-1 { top: 5%;   left: 5%;   width: 160px; height: 160px; background: rgba(6,182,212,0.12);  animation: float2 6s ease-in-out infinite; }
  .mem-orb-2 { top: 10%;  right: 5%;  width: 120px; height: 120px; background: rgba(59,130,246,0.12); animation: float3 8s ease-in-out infinite; }
  .mem-orb-3 { bottom: 8%;left: 25%;  width: 180px; height: 180px; background: rgba(167,139,250,0.08);animation: float2 7s ease-in-out 1s infinite; }
  .mem-orb-4 { bottom: 5%;right: 33%; width: 140px; height: 140px; background: rgba(236,72,153,0.07); animation: float3 9s ease-in-out 1.5s infinite; }

  .mem-loading {
    min-height: 100vh; background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif;
  }
  .mem-loading-box { text-align: center; animation: fadeIn 0.4s ease; }
  .mem-spinner {
    width: 48px; height: 48px;
    border: 2px solid var(--border); border-top-color: var(--cyan);
    border-radius: 50%; animation: spin 0.7s linear infinite;
    margin: 0 auto 16px;
  }
  .mem-loading-text { color: var(--grey2); font-size: 14px; letter-spacing: 0.04em; font-family: 'JetBrains Mono', monospace; }

  .mem-topbar {
    display: flex; align-items: center; justify-content: center;
    gap: 48px;
    padding: 0 48px; height: 68px;
    border-bottom: 1px solid var(--border);
    position: sticky; top: 72px; z-index: 100;
    background: var(--topbar-bg); backdrop-filter: blur(20px);
    animation: fadeIn 0.4s ease;
    transition: background 0.4s ease, border-color 0.4s ease;
  }
  .mem-topbar-left { display: flex; align-items: center; gap: 12px; }
  .mem-topbar-actions { display: flex; gap: 10px; align-items: center; }

  .mem-logout {
    display: flex; align-items: center; gap: 8px;
    background: transparent; border: 1px solid var(--border);
    color: var(--grey2); padding: 8px 18px; border-radius: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 0.06em;
    cursor: pointer; transition: all 0.2s;
  }
  .mem-logout:hover { border-color: var(--red); color: var(--red); background: var(--red-bg); }
  .mem-logout svg { width: 14px; height: 14px; }

  .mem-hero {
    text-align: center; padding: 100px 24px 40px;
    animation: fadeUp 0.5s ease 0.1s both;
  }
  .mem-hero-label {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(6,182,212,0.08); border: 1px solid rgba(6,182,212,0.25);
    color: var(--cyan); padding: 5px 14px; border-radius: 20px;
    font-size: 11px; font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px;
    transition: color 0.3s, border-color 0.3s;
  }
  .mem-hero-label span { width: 6px; height: 6px; border-radius: 50%; background: var(--cyan); display: inline-block; }
  .mem-hero h1 {
    font-size: clamp(28px, 4vw, 42px); font-weight: 800;
    letter-spacing: -0.03em; color: var(--white);
    line-height: 1.1; margin-bottom: 8px; transition: color 0.3s ease;
  }
  .mem-hero h1 em {
    font-style: normal;
    background: linear-gradient(90deg, var(--cyan) 0%, var(--blue) 50%, var(--teal) 100%);
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; animation: shimmer 3s linear infinite;
  }
  .mem-hero-sub { color: var(--grey2); font-size: 16px; transition: color 0.3s ease; }

  .mem-content { max-width: 1200px; margin: 0 auto; padding: 0 24px 80px; }
  @media (max-width: 860px) { .mem-topbar { padding: 0 20px; } }

  .mem-welcome { margin-bottom: 32px; animation: fadeUp 0.5s ease 0.15s both; }
  .mem-welcome h2 {
    font-size: clamp(24px, 3vw, 36px); font-weight: 800;
    letter-spacing: -0.03em; color: var(--white); margin-bottom: 6px; transition: color 0.3s ease;
  }
  .mem-welcome h2 em { font-style: normal; color: var(--cyan); }
  .mem-welcome p { color: var(--grey2); font-size: 15px; transition: color 0.3s ease; }

  .mem-top-grid {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 20px; margin-bottom: 20px;
    animation: fadeUp 0.5s ease 0.2s both;
  }
  @media (max-width: 1000px) { .mem-top-grid { grid-template-columns: 1fr; } }

  .mem-dcard {
    grid-column: span 2;
    background: linear-gradient(160deg, #0d2347 0%, #0a1a35 50%, #060d1f 100%);
    border: 1px solid var(--border2); border-radius: 20px;
    overflow: hidden; position: relative;
    animation: pulse-glow 4s ease infinite;
    box-shadow: 0 0 0 1px var(--border2), 0 40px 80px rgba(0,0,0,0.5);
    transition: background 0.4s ease, box-shadow 0.4s ease;
  }
  .mem-dcard::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(6,182,212,0.6), transparent);
  }
  .mem-dcard-pattern {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 60% 80% at 100% 0%, rgba(6,182,212,0.08) 0%, transparent 60%),
      radial-gradient(ellipse 40% 60% at 0% 100%, rgba(59,130,246,0.07) 0%, transparent 60%);
  }
  .mem-dcard-inner { position: relative; z-index: 1; padding: 28px; }
  .mem-dcard-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; gap: 16px; }
  .mem-dcard-user { display: flex; align-items: center; gap: 16px; }
  .mem-dcard-avatar {
    width: 72px; height: 72px; border-radius: 16px;
    background: linear-gradient(135deg, var(--cyan) 0%, var(--blue) 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 26px; font-weight: 800; color: #f8fafc;
    border: 3px solid rgba(6,182,212,0.3);
    box-shadow: 0 8px 24px rgba(6,182,212,0.2); flex-shrink: 0;
    cursor: pointer; position: relative; overflow: hidden;
  }
  .mem-dcard-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 13px; }
  .mem-dcard-avatar:hover .mem-avatar-overlay { opacity: 1 !important; }
  .mem-avatar-overlay {
    position: absolute; inset: 0; border-radius: 50%;
    background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s;
  }
  .mem-dcard-type {
    font-size: 10px; color: var(--cyan); font-weight: 600;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 4px;
    transition: color 0.3s ease;
  }
  .mem-dcard-name { font-size: 20px; font-weight: 800; color: var(--white); letter-spacing: -0.02em; transition: color 0.3s ease; }

  .mem-level-pill {
    flex-shrink: 0; padding: 6px 14px; border-radius: 20px;
    font-size: 11px; font-weight: 700;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.06em; border: 1px solid;
  }
  .mem-level-argent  { background: rgba(148,163,184,0.1); border-color: rgba(148,163,184,0.3); color: #94a3b8; }
  .mem-level-or      { background: rgba(251,191,36,0.1);  border-color: rgba(251,191,36,0.3);  color: #fbbf24; }
  .mem-level-platine { background: rgba(6,182,212,0.1);   border-color: rgba(6,182,212,0.3);   color: var(--cyan); }

  .mem-dcard-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
  .mem-dfield label {
    font-size: 9px; color: var(--grey); letter-spacing: 0.12em;
    text-transform: uppercase; font-family: 'JetBrains Mono', monospace;
    display: block; margin-bottom: 4px; transition: color 0.3s ease;
  }
  .mem-dfield p { font-size: 13px; color: var(--white); font-weight: 500; transition: color 0.3s ease; }
  .mem-role-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--panel2); border: 1px solid var(--border);
    padding: 4px 10px; border-radius: 6px;
    font-size: 12px; font-weight: 600; color: var(--white); transition: all 0.3s ease;
  }

  .mem-dcard-foot {
    background: rgba(255,255,255,0.04); border: 1px solid var(--border);
    border-radius: 12px; padding: 14px 18px;
    display: flex; align-items: center; gap: 14px; transition: all 0.3s ease;
  }
  .light-mode .mem-dcard-foot { background: rgba(59,130,246,0.06) !important; }
  .mem-foot-icon { font-size: 26px; }
  .mem-foot-label {
    font-size: 9px; color: var(--grey); text-transform: uppercase;
    letter-spacing: 0.12em; font-family: 'JetBrains Mono', monospace; margin-bottom: 2px;
    transition: color 0.3s ease;
  }
  .mem-foot-count { font-size: 24px; font-weight: 800; color: var(--white); line-height: 1; transition: color 0.3s ease; }
  .mem-foot-float { margin-left: auto; font-size: 28px; animation: float 2.5s ease-in-out infinite; display: flex; align-items: center; justify-content: center; }

  .mem-progress-wrap { margin-top: 14px; }
  .mem-progress-meta {
    display: flex; justify-content: space-between;
    font-size: 10px; color: var(--grey);
    font-family: 'JetBrains Mono', monospace; margin-bottom: 6px; transition: color 0.3s ease;
  }
  .mem-progress-track { width: 100%; height: 4px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; transition: background 0.3s ease; }
  .light-mode .mem-progress-track { background: rgba(37,99,235,0.12) !important; }
  .mem-progress-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--cyan), var(--blue)); transition: width 1s ease; }

  .mem-stat-col { display: flex; flex-direction: column; gap: 16px; }
  .mem-stat-card { background: var(--panel); border: 1px solid var(--border); border-radius: 18px; padding: 22px 20px; transition: all 0.3s ease; flex: 1; }
  .mem-stat-card:hover { border-color: var(--border2); }
  .mem-stat-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .mem-stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
  .mem-stat-icon-green  { background: rgba(16,185,129,0.12); border: 1px solid var(--green-border); }
  .mem-stat-icon-purple { background: rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.3); }
  .mem-stat-val { font-size: 32px; font-weight: 800; color: var(--white); line-height: 1; transition: color 0.3s ease; }
  .mem-stat-lbl { font-size: 10px; color: var(--grey); text-transform: uppercase; letter-spacing: 0.12em; font-family: 'JetBrains Mono', monospace; margin-bottom: 10px; transition: color 0.3s ease; }
  .mem-stat-bar-track { width: 100%; height: 3px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; }
  .light-mode .mem-stat-bar-track { background: rgba(37,99,235,0.1) !important; }
  .mem-stat-bar-fill-green  { height: 100%; border-radius: 99px; background: var(--green);  width: 85%; }
  .mem-stat-bar-fill-purple { height: 100%; border-radius: 99px; background: var(--purple); width: 100%; }

  .mem-tabs {
    display: flex; gap: 4px;
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 14px; padding: 5px; width: fit-content;
    margin-bottom: 24px; animation: fadeUp 0.5s ease 0.3s both;
    transition: background 0.3s ease, border-color 0.3s ease;
  }
  .mem-tab {
    padding: 9px 20px; border-radius: 10px;
    font-size: 12px; font-weight: 700;
    font-family: 'JetBrains Mono', monospace; letter-spacing: 0.04em;
    cursor: pointer; border: none; transition: all 0.2s;
    color: var(--grey2); background: transparent;
  }
  .mem-tab:hover { color: var(--white); background: rgba(255,255,255,0.04); }
  .light-mode .mem-tab:hover { color: var(--white); background: rgba(37,99,235,0.1); }
  .mem-tab.active { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: #f8fafc; box-shadow: 0 4px 16px rgba(220,38,38,0.35); }

  .mem-panel {
    background: var(--panel); border: 1px solid var(--border);
    border-radius: 18px; overflow: hidden;
    animation: fadeUp 0.5s ease 0.35s both; margin-bottom: 20px;
    transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .light-mode .mem-panel { box-shadow: var(--shadow-card); }
  .mem-panel-head {
    padding: 18px 24px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
    transition: border-color 0.3s ease, background 0.3s ease;
  }
  .mem-panel-icon { width: 32px; height: 32px; background: var(--panel2); border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.3s ease; }
  .mem-panel-title { font-size: 14px; font-weight: 700; color: var(--white); letter-spacing: -0.01em; transition: color 0.3s ease; }

  .mem-activity-list { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }
  .mem-activity-item { background: var(--panel2); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; display: flex; gap: 14px; align-items: center; transition: all 0.2s; }
  .mem-activity-item:hover { border-color: var(--border2); background: rgba(59,130,246,0.04); }
  .mem-activity-dot { width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0; background: var(--green-bg); border: 1px solid var(--green-border); display: flex; align-items: center; justify-content: center; }
  .mem-activity-title { font-size: 13px; font-weight: 700; color: var(--white); margin-bottom: 3px; transition: color 0.3s ease; }
  .mem-activity-date  { font-size: 11px; color: var(--grey2); font-family: 'JetBrains Mono', monospace; transition: color 0.3s ease; }
  .mem-attended-pill { margin-left: auto; flex-shrink: 0; background: var(--green-bg); border: 1px solid var(--green-border); color: var(--green); font-size: 9px; font-weight: 700; padding: 3px 10px; border-radius: 20px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.06em; }
  .mem-registered-pill { margin-left: auto; flex-shrink: 0; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); color: var(--blue-light); font-size: 9px; font-weight: 700; padding: 3px 10px; border-radius: 20px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.06em; }

  .mem-achievements { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; padding: 20px; }
  @media (max-width: 700px) { .mem-achievements { grid-template-columns: 1fr; } }
  .mem-ach { background: var(--panel2); border: 2px solid var(--border); border-radius: 14px; padding: 22px 18px; transition: all 0.3s ease; opacity: 0.45; }
  .mem-ach.unlocked { opacity: 1; }
  .mem-ach.unlocked-blue   { border-color: rgba(59,130,246,0.4);  background: rgba(59,130,246,0.06); }
  .mem-ach.unlocked-yellow { border-color: rgba(251,191,36,0.4);  background: rgba(251,191,36,0.06); }
  .mem-ach.unlocked-purple { border-color: rgba(167,139,250,0.4); background: rgba(167,139,250,0.06); }
  .mem-ach-icon { font-size: 32px; margin-bottom: 10px; }
  .mem-ach-title { font-size: 13px; font-weight: 700; color: var(--white); margin-bottom: 4px; transition: color 0.3s ease; }
  .mem-ach-desc  { font-size: 11px; color: var(--grey2); line-height: 1.6; transition: color 0.3s ease; }

  .mem-events-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 14px; padding: 20px; }
  .mem-event-card { background: var(--panel2); border: 1px solid var(--border); border-radius: 14px; padding: 20px; transition: all 0.2s; }
  .mem-event-card:hover { border-color: var(--border2); transform: translateY(-2px); }
  .mem-event-card-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
  .mem-event-card-dot { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, var(--cyan) 0%, var(--blue) 100%); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .mem-event-card-title { font-size: 14px; font-weight: 700; color: var(--white); margin-bottom: 12px; line-height: 1.4; transition: color 0.3s ease; }
  .mem-event-card-tags { display: flex; flex-direction: column; gap: 6px; }
  .mem-event-tag { display: flex; align-items: center; gap: 6px; font-size: 11px; color: var(--grey2); font-family: 'JetBrains Mono', monospace; transition: color 0.3s ease; }
  .mem-event-tag svg { width: 13px; height: 13px; flex-shrink: 0; }
  .mem-validated-pill { background: var(--green-bg); border: 1px solid var(--green-border); color: var(--green); font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 20px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.06em; white-space: nowrap; }
  .mem-inscrit-pill { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); color: var(--blue-light); font-size: 9px; font-weight: 700; padding: 3px 8px; border-radius: 20px; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.06em; white-space: nowrap; }

  .mem-club-split { display: flex; min-height: 160px; }
  .mem-club-fields { flex: 1; padding: 24px 28px; display: flex; flex-direction: column; gap: 20px; border-right: 1px solid var(--border); transition: border-color 0.3s ease; }
  .mem-cfield label { font-size: 9px; color: var(--grey); letter-spacing: 0.12em; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; display: block; margin-bottom: 5px; transition: color 0.3s ease; }
  .mem-cfield p { font-size: 14px; color: var(--white); font-weight: 600; line-height: 1.5; transition: color 0.3s ease; }
  .mem-cfield p.muted { font-weight: 400; color: var(--grey2); font-size: 13px; }
  .mem-club-logo-wrap { width: 160px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: var(--bg2); position: relative; overflow: hidden; transition: background 0.3s ease; }
  .mem-club-logo-wrap::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at center, var(--glow) 0%, transparent 70%); }
  .mem-club-logo-big { width: 80px; height: 80px; border-radius: 16px; background: var(--panel); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 38px; position: relative; z-index: 1; box-shadow: 0 8px 32px rgba(0,0,0,0.5); overflow: hidden; transition: all 0.3s ease; }
  .mem-club-logo-big img { width: 100%; height: 100%; object-fit: cover; border-radius: 16px; }
  .mem-club-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 20px; }
  .mem-club-stat { background: var(--panel2); border: 1px solid var(--border); border-radius: 12px; padding: 16px; transition: all 0.3s ease; }
  .mem-club-stat:hover { border-color: var(--border2); }
  .mem-club-stat-lbl { font-size: 9px; color: var(--grey); text-transform: uppercase; letter-spacing: 0.12em; font-family: 'JetBrains Mono', monospace; margin-bottom: 6px; transition: color 0.3s ease; }
  .mem-club-stat-val { font-size: 26px; font-weight: 800; color: var(--white); transition: color 0.3s ease; }

  .mem-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 20px; gap: 10px; text-align: center; min-height: 180px; }
  .mem-empty-icon { font-size: 40px; opacity: 0.25; margin-bottom: 6px; }
  .mem-empty h3 { font-size: 15px; font-weight: 600; color: var(--white); transition: color 0.3s; }
  .mem-empty p  { font-size: 12px; color: var(--grey); max-width: 240px; line-height: 1.7; transition: color 0.3s; }

  .mem-error { background: var(--red-bg); border: 1px solid var(--red-border); color: var(--red); border-radius: 12px; padding: 16px 20px; font-size: 13px; display: flex; align-items: center; gap: 10px; animation: fadeUp 0.3s ease; margin-top: 16px; }
  .mem-error svg { width: 18px; height: 18px; flex-shrink: 0; }

  .notif-wrap { position: relative; }
  .notif-btn { position: relative; width: 40px; height: 40px; border-radius: 10px; background: transparent; border: 1px solid var(--border); color: var(--grey2); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; flex-shrink: 0; }
  .notif-btn:hover { border-color: #e74c3c; color: #e74c3c; background: rgba(231,76,60,0.08); }
  .notif-btn svg { width: 18px; height: 18px; }
  .notif-btn.has-notif svg { animation: bell-ring 2.5s ease infinite; transform-origin: top center; color: #e74c3c; }
  .notif-badge { position: absolute; top: -4px; right: -4px; min-width: 18px; height: 18px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: #fff; font-size: 10px; font-weight: 800; border-radius: 99px; display: flex; align-items: center; justify-content: center; padding: 0 4px; font-family: 'JetBrains Mono', monospace; border: 2px solid var(--bg); animation: badge-pop 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  .notif-dropdown { position: absolute; top: calc(100% + 12px); right: 0; width: 360px; background: var(--panel); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04); animation: dropdown-in 0.25s cubic-bezier(0.34,1.56,0.64,1); z-index: 200; }
  .light-mode .notif-dropdown { box-shadow: 0 12px 40px rgba(37,99,235,0.15), 0 0 0 1px rgba(59,130,246,0.1); }
  .notif-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .notif-header-title { font-size: 13px; font-weight: 800; color: var(--white); letter-spacing: -0.01em; }
  .notif-header-count { font-size: 10px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: #e74c3c; background: rgba(231,76,60,0.1); border: 1px solid rgba(231,76,60,0.25); padding: 2px 8px; border-radius: 99px; letter-spacing: 0.04em; }
  .notif-list { max-height: 340px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
  .notif-list::-webkit-scrollbar { width: 4px; }
  .notif-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
  .notif-item { display: flex; gap: 12px; align-items: flex-start; padding: 12px 20px; transition: background 0.15s; cursor: pointer; border-bottom: 1px solid var(--border); }
  .notif-item:last-child { border-bottom: none; }
  .notif-item:hover { background: rgba(255,255,255,0.03); }
  .light-mode .notif-item:hover { background: rgba(59,130,246,0.04); }
  .notif-dot { width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .notif-dot-red    { background: rgba(231,76,60,0.12);  border: 1px solid rgba(231,76,60,0.25); }
  .notif-dot-blue   { background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.25); }
  .notif-dot-green  { background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); }
  .notif-dot-yellow { background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.25); }
  .notif-item-body { flex: 1; min-width: 0; }
  .notif-item-title { font-size: 12px; font-weight: 700; color: var(--white); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.3s; }
  .notif-item-sub   { font-size: 11px; color: var(--grey2); font-family: 'JetBrains Mono', monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color 0.3s; }
  .notif-item-time  { font-size: 10px; color: var(--grey); font-family: 'JetBrains Mono', monospace; flex-shrink: 0; padding-top: 2px; transition: color 0.3s; }
  .notif-empty { padding: 32px 20px; text-align: center; color: var(--grey); font-size: 12px; font-family: 'JetBrains Mono', monospace; }
  .notif-empty-icon { font-size: 28px; margin-bottom: 8px; opacity: 0.3; }
  .notif-footer { padding: 12px 20px; border-top: 1px solid var(--border); text-align: center; }
  .notif-footer-btn { background: none; border: none; cursor: pointer; font-size: 11px; font-weight: 700; font-family: 'JetBrains Mono', monospace; color: #e74c3c; letter-spacing: 0.06em; text-transform: uppercase; transition: color 0.2s; }
  .notif-footer-btn:hover { color: #c0392b; }

  .avatar-upload-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 11px 0; margin-top: 12px;
    background: linear-gradient(135deg, #06b6d4, #3b82f6);
    color: #f8fafc; border: none; border-radius: 10px;
    font-size: 12px; font-weight: 700; letter-spacing: 0.05em;
    font-family: 'JetBrains Mono', monospace;
    cursor: pointer; transition: opacity 0.2s, transform 0.15s;
  }
  .avatar-upload-btn:hover { opacity: 0.9; transform: translateY(-1px); }
  .avatar-upload-btn:active { transform: translateY(0); }
  .avatar-upload-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  @media (max-width: 600px) {
    .notif-dropdown { width: calc(100vw - 32px); right: -60px; }
    .mem-club-split { flex-direction: column; }
    .mem-club-logo-wrap { width: 100%; height: 120px; border-right: none; border-bottom: 1px solid var(--border); }
    .mem-dcard { grid-column: span 1; }
    .mem-top-grid { grid-template-columns: 1fr; }
  }
`;

const MemberDashboard = () => {
  const { user, logout } = useAuth();
  const [memberInfo, setMemberInfo] = useState(null);
  const [clubInfo, setClubInfo] = useState(null);
  const [attendedEvents, setAttendedEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [clubEvents, setClubEvents] = useState([]);
  const [clubTotalMembers, setClubTotalMembers] = useState(0);
  const [clubActiveMembers, setClubActiveMembers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
  );

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotif, setSelectedNotif] = useState(null);

  const [avatarUploadOpen, setAvatarUploadOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [localAvatar, setLocalAvatar] = useState(null);

  const fileInputRef = React.useRef(null);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const handler = () => setIsDark(document.documentElement.classList.contains('dark'));
    window.addEventListener('themeChanged', handler);
    return () => window.removeEventListener('themeChanged', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.notif-wrap')) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error('Notifications error:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMemberData();
      fetchNotifications();
    }
  }, [user]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);

      const clubResponse = await fetch(`${API_BASE_URL}/api/my-club-membership`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
      });

      let clubData = null;
      if (clubResponse.ok) {
        clubData = await clubResponse.json();
        setClubInfo(clubData.club);
        setMemberInfo(clubData.membership);
      }

      const clubId = clubData?.club?.id;

      if (clubId) {
        try {
          const eventsRes = await fetch(
            `${API_BASE_URL}/api/events?club_id=${clubId}`,
            { credentials: 'include', headers: { 'Accept': 'application/json' } }
          );
          if (eventsRes.ok) {
            const eventsData = await eventsRes.json();
            const all = Array.isArray(eventsData) ? eventsData : (eventsData.events ?? eventsData.data ?? []);
            setClubEvents(all.filter(e => (e.club_id ?? e.club?.id) === clubId));
          }
        } catch (_) {}
      }

      try {
        const regRes = await fetch(
          `${API_BASE_URL}/api/tickets?person_id=${user.id}`,
          { credentials: 'include', headers: { 'Accept': 'application/json' } }
        );
        if (regRes.ok) {
          const regData = await regRes.json();
          const allTickets = Array.isArray(regData) ? regData : (regData.data ?? []);
          setRegisteredEvents(allTickets);
          setAttendedEvents(allTickets.filter(t => t.status === 'scanned' || t.scanned === true || t.scanned_at));
        } else {
          setRegisteredEvents([]);
          setAttendedEvents([]);
        }
      } catch (_) {
        setRegisteredEvents([]);
        setAttendedEvents([]);
      }

      if (clubId) {
        try {
          const membersRes = await fetch(`${API_BASE_URL}/api/clubs/${clubId}/members`, {
            credentials: 'include',
            headers: { 'Accept': 'application/json' },
          });
          if (membersRes.ok) {
            const membersData = await membersRes.json();
            const list = Array.isArray(membersData) ? membersData : (membersData.data ?? []);
            setClubTotalMembers(list.length);
            const activeList = list.filter(m =>
              m.status === 'active' || m.status === 'approved' ||
              m.is_active === true  || m.is_active === 1
            );
            setClubActiveMembers(activeList.length);
          } else {
            setClubTotalMembers(clubData?.club?.total_members ?? clubData?.club?.members_count ?? 0);
            setClubActiveMembers(clubData?.club?.active_members ?? 0);
          }
        } catch {
          setClubTotalMembers(clubData?.club?.total_members ?? 0);
          setClubActiveMembers(clubData?.club?.active_members ?? 0);
        }
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (file) => {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setAvatarUploading(true);
    setAvatarError('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch(`${API_BASE_URL}/api/me/avatar`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setLocalAvatar(data.avatar_url || preview);
      setAvatarUploadOpen(false);
      setAvatarPreview(null);
    } catch (err) {
      setAvatarError('Erreur lors du téléchargement. Réessayez.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const closeAvatarModal = () => {
    setAvatarUploadOpen(false);
    setAvatarPreview(null);
    setAvatarError('');
  };

  const getMemberLevel = (eventCount) => {
    if (eventCount >= 10) return { name: 'Platine', icon: '💎', pillClass: 'mem-level-pill mem-level-platine', progress: 100, nextLabel: 'Niveau max atteint!' };
    if (eventCount >= 5)  return { name: 'Or',      icon: '🏆', pillClass: 'mem-level-pill mem-level-or',      progress: (eventCount / 10) * 100, nextLabel: `${10 - eventCount} pour Platine` };
    return { name: 'Argent', icon: '⭐', pillClass: 'mem-level-pill mem-level-argent', progress: (eventCount / 5) * 100, nextLabel: `${5 - eventCount} pour Or` };
  };

  const level         = getMemberLevel(attendedEvents.length);
  const initials      = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase();
  const currentAvatar = localAvatar || user?.avatar_url;

  const notifColor  = (type) => type === 'event' ? '#e74c3c' : type === 'member' ? 'var(--green)' : type === 'club' ? 'var(--blue-light)' : 'var(--yellow)';
  const notifBg     = (type) => type === 'event' ? 'rgba(231,76,60,0.12)' : type === 'member' ? 'rgba(16,185,129,0.12)' : type === 'club' ? 'rgba(59,130,246,0.12)' : 'rgba(251,191,36,0.12)';
  const notifBorder = (type) => type === 'event' ? 'rgba(231,76,60,0.3)' : type === 'member' ? 'rgba(16,185,129,0.3)' : type === 'club' ? 'rgba(59,130,246,0.3)' : 'rgba(251,191,36,0.3)';
  const notifEmoji  = (type) => type === 'event_ticket' ? '🎟️' : type === 'event' ? '🎉' : type === 'member' ? '👤' : type === 'club' ? '🏢' : '🔔';
  const notifLabel  = (type) => type === 'event_ticket' ? 'Billet Événement' : type === 'event' ? 'Événement' : type === 'member' ? 'Membre' : type === 'club' ? 'Club' : 'Notification';

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="mem-loading">
          <div className="mem-loading-box">
            <div className="mem-spinner" />
            <p className="mem-loading-text">Chargement de votre profil...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <MemberLayout isDark={isDark}>

        {/* ── Topbar ── */}
        <header className="mem-topbar">
          <div className="mem-topbar-left" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    onClick={() => setAvatarUploadOpen(true)}
                    style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--cyan), var(--blue))',
                      border: '2px solid rgba(6,182,212,0.5)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', flexShrink: 0,
                      fontSize: 13, fontWeight: 800, color: '#f8fafc',
                      cursor: 'pointer',
                    }}
                  >
                    {currentAvatar
                      ? <img src={currentAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : initials}
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--white)', letterSpacing: '-0.01em' }}>
                    {user?.first_name} {user?.last_name}
                  </span>
                </div>
                <div
                  onClick={() => setAvatarUploadOpen(true)}
                  style={{
                    position: 'absolute', top: '100%', left: 54, marginTop: 6,
                    display: 'flex', alignItems: 'center', gap: 6,
                    cursor: 'pointer', zIndex: 10, whiteSpace: 'nowrap',
                    padding: '4px 10px', borderRadius: 6,
                    border: '1px solid rgba(6,182,212,0.4)',
                    background: 'rgba(6,182,212,0.06)', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.8)'; e.currentTarget.style.background = 'rgba(6,182,212,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'; e.currentTarget.style.background = 'rgba(6,182,212,0.06)'; }}
                >
                  <svg width="11" height="11" fill="none" stroke="var(--grey2)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" />
                  </svg>
                  <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--grey2)', fontFamily: "'DM Sans', sans-serif", borderBottom: '1px dashed rgba(148,163,184,0.3)', paddingBottom: 1 }}>
                    Modifier la photo de profil
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mem-topbar-actions">
            <div className="notif-wrap">
              <button
                className={`notif-btn${unreadCount > 0 ? ' has-notif' : ''}`}
                onClick={() => {
                  setNotifOpen(o => !o);
                  if (!notifOpen && unreadCount > 0) {
                    fetch(`${API_BASE_URL}/api/notifications/read-all`, {
                      method: 'PUT', credentials: 'include',
                      headers: { 'Accept': 'application/json' },
                    }).then(() => fetchNotifications());
                  }
                }}
                title="Notifications"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span className="notif-header-title">🔔 Notifications</span>
                    {unreadCount > 0 && (
                      <span className="notif-header-count">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">
                        <div className="notif-empty-icon">🔕</div>
                        Aucune notification pour l'instant
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          className="notif-item"
                          key={notif.id}
                          style={{
                            background: notif.read ? 'transparent' : 'rgba(231,76,60,0.05)',
                            borderLeft: notif.read ? '3px solid transparent' : '3px solid #e74c3c',
                          }}
                          onClick={async () => {
                            if (!notif.read) {
                              await fetch(`${API_BASE_URL}/api/notifications/${notif.id}/read`, {
                                method: 'PUT', credentials: 'include',
                                headers: { 'Accept': 'application/json' },
                              });
                              fetchNotifications();
                            }
                            setNotifOpen(false);
                            setSelectedNotif(notif);
                          }}
                        >
                          <div className={`notif-dot ${notif.type === 'event' ? 'notif-dot-red' : notif.type === 'member' ? 'notif-dot-green' : notif.type === 'club' ? 'notif-dot-blue' : 'notif-dot-yellow'}`}>
                            {notifEmoji(notif.type)}
                          </div>
                          <div className="notif-item-body">
                            <div className="notif-item-title">{notif.title}</div>
                            <div className="notif-item-sub">{notif.message}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                            <div className="notif-item-time">{notif.time_ago}</div>
                            {!notif.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e74c3c', display: 'block' }} />}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="notif-footer">
                    <button className="notif-footer-btn" onClick={async () => {
                      await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
                        method: 'PUT', credentials: 'include',
                        headers: { 'Accept': 'application/json' },
                      });
                      fetchNotifications();
                      setNotifOpen(false);
                    }}>✓ Tout marquer comme lu</button>
                  </div>
                </div>
              )}
            </div>

            <button className="mem-logout" onClick={logout}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnexion
            </button>
          </div>
        </header>

        {/* ── Hero ── */}
        <div className="mem-hero">
          <div className="mem-hero-label"><span />Espace Membre</div>
          <h1>Votre <em>Carte Digitale</em> Membre</h1>
          <p className="mem-hero-sub">Bienvenue dans votre espace personnel</p>
        </div>

        <div className="mem-content">
          <div className="mem-welcome">
            <h2>Bonjour, <em>{user?.first_name}</em>! 👋</h2>
            <p>Retrouvez ici toutes vos informations membre.</p>
          </div>

          {/* ── Top Grid ── */}
          <div className="mem-top-grid">
            <div className="mem-dcard">
              <div className="mem-dcard-pattern" />
              <div className="mem-dcard-inner">
                <div className="mem-dcard-head">
                  <div className="mem-dcard-user">
                    <div className="mem-dcard-avatar" onClick={() => setAvatarUploadOpen(true)} title="Changer la photo de profil">
                      {currentAvatar ? <img src={currentAvatar} alt="Avatar" /> : initials}
                      <div className="mem-avatar-overlay" style={{ borderRadius: '13px' }}>
                        <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <circle cx="12" cy="13" r="3" strokeWidth={2} />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <div className="mem-dcard-type">Carte Membre · {clubInfo?.name || 'Club'}</div>
                      <div className="mem-dcard-name">{user?.first_name} {user?.last_name}</div>
                    </div>
                  </div>
                  <span className={level.pillClass}>{level.icon} {level.name}</span>
                </div>
                <div className="mem-dcard-fields">
                  <div className="mem-dfield">
                    <label>Email</label>
                    <p style={{ fontSize: '12px' }}>{user?.email}</p>
                  </div>
                  <div className="mem-dfield">
                    <label>Rôle</label>
                    <span className="mem-role-tag">
                      {memberInfo?.role === 'president' && '👑 Président'}
                      {memberInfo?.role === 'board'     && '👔 Bureau'}
                      {memberInfo?.role === 'member'    && '👤 Membre'}
                      {!memberInfo?.role                && '👤 Membre'}
                    </span>
                  </div>
                  {memberInfo?.position && (
                    <div className="mem-dfield">
                      <label>Position</label>
                      <p>{memberInfo.position}</p>
                    </div>
                  )}
                  {memberInfo?.joined_at && (
                    <div className="mem-dfield">
                      <label>Membre depuis</label>
                      <p>{new Date(memberInfo.joined_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                  )}
                </div>
                <div className="mem-dcard-foot">
                  <div className="mem-foot-icon">🎫</div>
                  <div>
                    <div className="mem-foot-label">Événements Assistés</div>
                    <div className="mem-foot-count">{attendedEvents.length}</div>
                  </div>
                  <div className="mem-foot-float">{level.icon}</div>
                </div>
                <div className="mem-progress-wrap">
                  <div className="mem-progress-meta">
                    <span>Progression · {level.nextLabel}</span>
                    <span>{Math.round(level.progress)}%</span>
                  </div>
                  <div className="mem-progress-track">
                    <div className="mem-progress-fill" style={{ width: `${level.progress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mem-stat-col">
              <div className="mem-stat-card">
                <div className="mem-stat-card-top">
                  <div className="mem-stat-icon mem-stat-icon-green">✅</div>
                  <div className="mem-stat-val">{attendedEvents.length}</div>
                </div>
                <div className="mem-stat-lbl">Événements Assistés</div>
                <div className="mem-stat-bar-track"><div className="mem-stat-bar-fill-green" /></div>
              </div>
              <div className="mem-stat-card">
                <div className="mem-stat-card-top">
                  <div className="mem-stat-icon mem-stat-icon-purple">⚡</div>
                  <div className="mem-stat-val">{registeredEvents.length}</div>
                </div>
                <div className="mem-stat-lbl">Événements Inscrits</div>
                <div className="mem-stat-bar-track"><div className="mem-stat-bar-fill-purple" /></div>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="mem-tabs">
            <button className={`mem-tab${activeTab === 'overview' ? ' active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Vue d'ensemble</button>
            <button className={`mem-tab${activeTab === 'events'   ? ' active' : ''}`} onClick={() => setActiveTab('events')}>🎫 Mes Événements ({registeredEvents.length})</button>
            <button className={`mem-tab${activeTab === 'club'     ? ' active' : ''}`} onClick={() => setActiveTab('club')}>🏢 Mon Club</button>
          </div>

          {/* ════════════ VUE D'ENSEMBLE ════════════ */}
          {activeTab === 'overview' && (
            <>
              <div className="mem-panel">
                <div className="mem-panel-head">
                  <div className="mem-panel-icon">🏢</div>
                  <div className="mem-panel-title">
                    Événements de {clubInfo?.name || 'votre club'} — participez pour débloquer des récompenses !
                  </div>
                </div>
                {clubEvents.length === 0 ? (
                  <div className="mem-empty">
                    <div className="mem-empty-icon">📅</div>
                    <h3>Aucun événement pour le moment</h3>
                    <p>Les prochains événements de votre club apparaîtront ici.</p>
                  </div>
                ) : (
                  <div className="mem-activity-list">
                    {clubEvents.slice(0, 5).map((event, index) => {
                      const isAttended = attendedEvents.some(
                        t => (t.event_id ?? t.id) === (event.id ?? event.event_id)
                      );
                      const isRegistered = registeredEvents.some(
                        t => (t.event_id ?? t.id) === (event.id ?? event.event_id)
                      );
                      return (
                        <div className="mem-activity-item" key={event.id || index}>
                          <div className="mem-activity-dot" style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.3)' }}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--blue-light)', width: 20, height: 20 }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="mem-activity-title">{event.title ?? event.event_title ?? 'Événement'}</div>
                            <div className="mem-activity-date">
                              {event.date ?? event.event_date
                                ? new Date(event.date ?? event.event_date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
                                : '—'}
                              {event.location ?? event.event_location
                                ? ` · ${event.location ?? event.event_location}`
                                : ''}
                            </div>
                          </div>
                          {isAttended
                            ? <span className="mem-attended-pill">✓ Assisté</span>
                            : isRegistered
                              ? <span className="mem-registered-pill">📋 Inscrit</span>
                              : <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: 9, fontWeight: 700, padding: '3px 10px', borderRadius: 20, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.3)', color: 'var(--grey2)' }}>À venir</span>
                          }
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mem-panel">
                <div className="mem-panel-head">
                  <div className="mem-panel-icon">🕐</div>
                  <div className="mem-panel-title">Activité Récente — Événements assistés</div>
                </div>
                {attendedEvents.length === 0 ? (
                  <div className="mem-empty">
                    <div className="mem-empty-icon">🎯</div>
                    <h3>Aucune participation encore</h3>
                    <p>Participez à des événements pour débloquer des récompenses!</p>
                  </div>
                ) : (
                  <div className="mem-activity-list">
                    {attendedEvents.slice(0, 3).map((event, index) => (
                      <div className="mem-activity-item" key={event.id || index}>
                        <div className="mem-activity-dot">
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--green)', width: 20, height: 20 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="mem-activity-title">{event.event_title ?? event.title}</div>
                          <div className="mem-activity-date">
                            {(event.event_date ?? event.date)
                              ? new Date(event.event_date ?? event.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
                              : '—'}
                          </div>
                        </div>
                        <span className="mem-attended-pill">✓ Assisté</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mem-panel">
                <div className="mem-panel-head">
                  <div className="mem-panel-icon">✨</div>
                  <div className="mem-panel-title">Succès Débloqués</div>
                </div>
                <div className="mem-achievements">
                  <div className={`mem-ach${attendedEvents.length >= 1  ? ' unlocked unlocked-blue'   : ''}`}>
                    <div className="mem-ach-icon">🎯</div>
                    <div className="mem-ach-title">Premier Pas</div>
                    <div className="mem-ach-desc">Assister à votre premier événement</div>
                  </div>
                  <div className={`mem-ach${attendedEvents.length >= 5  ? ' unlocked unlocked-yellow' : ''}`}>
                    <div className="mem-ach-icon">🏆</div>
                    <div className="mem-ach-title">Membre Actif</div>
                    <div className="mem-ach-desc">Participer à 5 événements</div>
                  </div>
                  <div className={`mem-ach${attendedEvents.length >= 10 ? ' unlocked unlocked-purple' : ''}`}>
                    <div className="mem-ach-icon">💎</div>
                    <div className="mem-ach-title">Super Star</div>
                    <div className="mem-ach-desc">Atteindre 10 événements</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════════════ ONGLET ÉVÉNEMENTS ════════════ */}
          {activeTab === 'events' && (
            <div className="mem-panel">
              <div className="mem-panel-head">
                <div className="mem-panel-icon">📅</div>
                <div className="mem-panel-title">Mes Événements — Inscriptions &amp; Participations</div>
              </div>
              {registeredEvents.length === 0 ? (
                <div className="mem-empty">
                  <div className="mem-empty-icon">🎫</div>
                  <h3>Aucun événement pour le moment</h3>
                  <p>Vos inscriptions aux événements apparaîtront ici</p>
                </div>
              ) : (
                <div className="mem-events-grid">
                  {registeredEvents.map((event, index) => {
                    const isAttended = event.status === 'scanned' || event.scanned === true || event.scanned_at;
                    return (
                      <div className="mem-event-card" key={event.id || index}>
                        <div className="mem-event-card-head">
                          <div className="mem-event-card-dot">{isAttended ? '✅' : '🎫'}</div>
                          {isAttended
                            ? <span className="mem-validated-pill">✓ Validé</span>
                            : <span className="mem-inscrit-pill">📋 Inscrit</span>
                          }
                        </div>
                        <div className="mem-event-card-title">
                          {event.event_title ?? event.title ?? 'Événement'}
                        </div>
                        <div className="mem-event-card-tags">
                          {(event.event_date ?? event.date) && (
                            <div className="mem-event-tag">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(event.event_date ?? event.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </div>
                          )}
                          {(event.event_location ?? event.location) && (
                            <div className="mem-event-tag">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {event.event_location ?? event.location}
                              </span>
                            </div>
                          )}
                          {(event.club_name ?? clubInfo?.name) && (
                            <div className="mem-event-tag">
                              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {event.club_name ?? clubInfo?.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ════════════ ONGLET MON CLUB ════════════ */}
          {activeTab === 'club' && clubInfo && (
            <div className="mem-panel">
              <div className="mem-panel-head">
                <div className="mem-panel-icon">🏢</div>
                <div className="mem-panel-title">Informations du Club</div>
              </div>
              <div className="mem-club-split">
                <div className="mem-club-fields">
                  <div className="mem-cfield">
                    <label>Nom du Club</label>
                    <p>{clubInfo.name}</p>
                  </div>
                  {clubInfo.category && (
                    <div className="mem-cfield">
                      <label>Catégorie</label>
                      <p>{clubInfo.category}</p>
                    </div>
                  )}
                  {clubInfo.description && (
                    <div className="mem-cfield">
                      <label>Description</label>
                      <p className="muted">{clubInfo.description}</p>
                    </div>
                  )}
                  {clubInfo.mission && (
                    <div className="mem-cfield">
                      <label>Mission</label>
                      <p className="muted">{clubInfo.mission}</p>
                    </div>
                  )}
                </div>
                <div className="mem-club-logo-wrap">
                  <div className="mem-club-logo-big">
                    {clubInfo.logo_url ? <img src={clubInfo.logo_url} alt={clubInfo.name} /> : clubInfo.name?.charAt(0)}
                  </div>
                </div>
              </div>
              <div className="mem-club-stats-grid">
                <div className="mem-club-stat">
                  <div className="mem-club-stat-lbl">Membres Totaux</div>
                  <div className="mem-club-stat-val">{clubTotalMembers}</div>
                </div>
                <div className="mem-club-stat">
                  <div className="mem-club-stat-lbl">Membres Actifs</div>
                  <div className="mem-club-stat-val">{clubActiveMembers}</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mem-error">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* ── Avatar Upload Modal ── */}
        {avatarUploadOpen && (
          <div onClick={e => { if (e.target === e.currentTarget) closeAvatarModal(); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: 20, padding: 28, width: 360, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeUp 0.25s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em' }}>📸 Photo de profil</span>
                <button onClick={closeAvatarModal} style={{ background: 'none', border: 'none', color: 'var(--grey2)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ width: 100, height: 100, borderRadius: 20, background: 'linear-gradient(135deg, var(--cyan), var(--blue))', border: '3px solid var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 32, fontWeight: 800, color: '#f8fafc', boxShadow: '0 8px 32px rgba(6,182,212,0.2)' }}>
                  {(avatarPreview || currentAvatar) ? <img src={avatarPreview || currentAvatar} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handleAvatarChange(e.target.files[0]); }} />
              <button className="avatar-upload-btn" disabled={avatarUploading} onClick={() => fileInputRef.current?.click()}>
                {avatarUploading
                  ? (<><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />Envoi en cours...</>)
                  : (<><svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>Choisir une image</>)
                }
              </button>
              <div
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.background = 'rgba(6,182,212,0.06)'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--panel2)'; }}
                onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--panel2)'; const file = e.dataTransfer.files[0]; if (file && file.type.startsWith('image/')) handleAvatarChange(file); }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 16px', border: '2px dashed var(--border)', borderRadius: 10, background: 'var(--panel2)', marginTop: 12, transition: 'all 0.2s' }}
              >
                <span style={{ fontSize: 11, color: 'var(--grey)', fontFamily: "'JetBrains Mono', monospace", textAlign: 'center' }}>ou glissez-déposez une image ici</span>
                <span style={{ fontSize: 10, color: 'var(--grey)', fontFamily: "'JetBrains Mono', monospace", opacity: 0.7 }}>JPG, PNG, WEBP · Max 5 MB</span>
              </div>
              {avatarError && <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--red-bg)', border: '1px solid var(--red-border)', borderRadius: 8, color: 'var(--red)', fontSize: 12 }}>{avatarError}</div>}
            </div>
          </div>
        )}

        {/* ── Notification Detail Modal ── */}
        {selectedNotif && (
          <div onClick={e => { if (e.target === e.currentTarget) setSelectedNotif(null); }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease', padding: '16px' }}>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border2)', borderRadius: 20, padding: 28, width: 440, maxWidth: 'calc(100vw - 32px)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', animation: 'fadeUp 0.25s ease', position: 'relative' }}>
              <button onClick={() => setSelectedNotif(null)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, color: 'var(--grey2)', cursor: 'pointer', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,76,60,0.15)'; e.currentTarget.style.color = '#e74c3c'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--grey2)'; }}
              >×</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: notifBg(selectedNotif.type), border: `1px solid ${notifBorder(selectedNotif.type)}` }}>
                  {notifEmoji(selectedNotif.type)}
                </div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace", color: notifColor(selectedNotif.type), marginBottom: 4 }}>{notifLabel(selectedNotif.type)}</div>
                  <div style={{ fontSize: 12, color: 'var(--grey2)', fontFamily: "'JetBrains Mono', monospace" }}>{selectedNotif.time_ago || ''}</div>
                </div>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--white)', letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.3, paddingRight: 32 }}>{selectedNotif.title}</h3>
              <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />
              <p style={{ fontSize: 13, color: 'var(--grey2)', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: 20 }}>{selectedNotif.message}</p>
              {selectedNotif.type === 'event_ticket' && selectedNotif.data?.ticket_id && (
                <a href={`${API_BASE_URL}/api/tickets/${selectedNotif.data.ticket_id}/download-pdf`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '13px 0', marginBottom: 10, background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.05em', textDecoration: 'none', cursor: 'pointer', transition: 'opacity 0.2s, transform 0.15s', boxShadow: '0 6px 20px rgba(231,76,60,0.35)' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Télécharger mon billet PDF
                </a>
              )}
              <button onClick={() => setSelectedNotif(null)}
                style={{ width: '100%', padding: '11px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--grey2)', fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.06em', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#e74c3c'; e.currentTarget.style.color = '#e74c3c'; e.currentTarget.style.background = 'rgba(231,76,60,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--grey2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              >FERMER</button>
            </div>
          </div>
        )}

      </MemberLayout>

    </>
  );
};

export default MemberDashboard;

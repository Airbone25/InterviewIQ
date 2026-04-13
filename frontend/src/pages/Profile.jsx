import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Camera, Save, Loader2, Brain, Zap, Trophy, Flame,
  Target, TrendingUp, Calendar, Code2, MessageSquare, Building2,
  Users, ExternalLink, Filter, ChevronDown, Share2, Copy, Check,
  BarChart2, Clock, Award, Star, ArrowUpRight, Home, ChevronRight,
  Edit3, X, BookOpen, GitBranch, Layers,
} from 'lucide-react'
import { apiFetch, useAuthStore } from '../context/auth.js'
import { format, isValid, formatDistanceToNow } from 'date-fns'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area,
} from 'recharts'
import toast from 'react-hot-toast'

// ── constants ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  ['#4f8ef7', '#22d3ee'],
  ['#a78bfa', '#4f8ef7'],
  ['#10b981', '#22d3ee'],
  ['#f59e0b', '#ef4444'],
  ['#ec4899', '#a78bfa'],
  ['#22d3ee', '#10b981'],
]

const TYPE_META = {
  technical:  { label: 'Technical',    color: '#4f8ef7', icon: Code2 },
  behavioral: { label: 'Behavioral',   color: '#a78bfa', icon: MessageSquare },
  hr:         { label: 'HR Round',     color: '#22d3ee', icon: Users },
  company:    { label: 'Company Style',color: '#10b981', icon: Building2 },
}

const BADGE_META = {
  first_interview: { label: 'First Interview', emoji: '🎯', desc: 'Completed your first interview' },
  streak_3:        { label: '3-Day Streak',     emoji: '🔥', desc: 'Interviewed 3 days in a row' },
  high_scorer:     { label: 'High Scorer',      emoji: '⭐', desc: 'Achieved average score ≥ 8' },
  consistent:      { label: 'Consistent',       emoji: '📈', desc: 'Completed 5+ interviews' },
}

const scoreColor = s => s >= 8 ? '#10b981' : s >= 6 ? '#f59e0b' : '#ef4444'

// ── Avatar component ─────────────────────────────────────────────────────────
function Avatar({ name, colorIdx = 0, size = 96, editable = false, onColorChange }) {
  const [g1, g2] = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length]
  const initials = name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <div className="relative group" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-bold text-white shadow-2xl select-none"
        style={{
          background: `linear-gradient(135deg, ${g1}, ${g2})`,
          fontSize: size * 0.36,
          boxShadow: `0 0 30px ${g1}50`,
        }}
      >
        {initials}
      </div>
      {editable && (
        <button
          onClick={onColorChange}
          className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-panel border-2 border-border-bright flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-electric/20"
        >
          <Camera className="w-3.5 h-3.5 text-electric" />
        </button>
      )}
    </div>
  )
}

// ── Skill bar ────────────────────────────────────────────────────────────────
function SkillBar({ label, value, max = 10, color = '#4f8ef7', delay = 0 }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-text-secondary font-medium">{label}</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>{value.toFixed(1)}/{max}</span>
      </div>
      <div className="h-1.5 bg-border/60 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 1, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

// ── Share card ───────────────────────────────────────────────────────────────
function ShareCard({ user, stats, onClose }) {
  const [copied, setCopied] = useState(false)
  const cardRef = useRef(null)

  const shareText = `🎯 ${user.name}'s InterviewIQ Profile\n` +
    `📊 ${stats.total} interviews · Avg ${(stats.avgScore || 0).toFixed(1)}/10\n` +
    `🏆 Level ${stats.level} · ${stats.points} XP\n` +
    `🔥 ${stats.streak}-day streak\n\n` +
    `Practice AI interviews at InterviewIQ`

  const copy = () => {
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const [g1, g2] = AVATAR_COLORS[0]
  const initials = user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-md p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm"
      >
        {/* The shareable card */}
        <div
          ref={cardRef}
          className="rounded-3xl overflow-hidden border border-electric/20 mb-4"
          style={{ background: 'linear-gradient(135deg, #0f1426 0%, #141928 100%)' }}
        >
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${g1}, ${g2})` }} />
          <div className="p-7">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
              >
                {initials}
              </div>
              <div>
                <h3 className="font-bold text-xl text-text-primary">{user.name}</h3>
                <p className="text-text-muted text-sm">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-electric/15 text-electric px-2 py-0.5 rounded-full border border-electric/30">
                    Level {stats.level}
                  </span>
                  {stats.badges?.includes('high_scorer') && (
                    <span className="text-xs">⭐ High Scorer</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { val: stats.total || 0, label: 'Interviews', color: '#4f8ef7' },
                { val: `${(stats.avgScore || 0).toFixed(1)}`, label: 'Avg Score', color: '#22d3ee' },
                { val: `${stats.points || 0}`, label: 'XP', color: '#a78bfa' },
              ].map(({ val, label, color }) => (
                <div key={label} className="text-center p-3 rounded-xl" style={{ background: color + '10', border: `1px solid ${color}30` }}>
                  <div className="text-lg font-bold font-mono" style={{ color }}>{val}</div>
                  <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {Object.entries(BADGE_META).map(([key, meta]) => (
                  <span
                    key={key}
                    className="text-lg"
                    style={{ opacity: stats.badges?.includes(key) ? 1 : 0.2 }}
                    title={meta.label}
                  >
                    {meta.emoji}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <Brain className="w-3 h-3 text-electric" />
                InterviewIQ
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={copy} className="btn-primary flex-1 justify-center py-3 text-sm">
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Profile'}
          </button>
          <button onClick={onClose} className="btn-ghost px-4 py-3 text-sm">
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-border-bright text-xs shadow-xl">
      <p className="text-text-secondary mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="font-mono font-bold" style={{ color: p.color || '#4f8ef7' }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
        </p>
      ))}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user }      = useAuthStore()
  const navigate      = useNavigate()

  const [stats,       setStats]      = useState(null)
  const [interviews,  setInterviews] = useState([])
  const [loading,     setLoading]    = useState(true)
  const [bio,         setBio]        = useState('')
  const [editingBio,  setEditingBio] = useState(false)
  const [savingBio,   setSavingBio]  = useState(false)
  const [colorIdx,    setColorIdx]   = useState(0)
  const [showShare,   setShowShare]  = useState(false)
  const [filter,      setFilter]     = useState('all')
  const [filterOpen,  setFilterOpen] = useState(false)
  const [page,        setPage]       = useState(1)
  const PAGE_SIZE = 6

  useEffect(() => {
    const load = async () => {
      try {
        const [stData, ivData] = await Promise.all([
          apiFetch('/api/interviews/stats'),
          apiFetch('/api/interviews?limit=50'),
        ])
        setStats(stData)
        setInterviews(ivData.interviews || [])
        setBio(user?.bio || '')
        const saved = localStorage.getItem('profile_color_idx')
        if (saved) setColorIdx(parseInt(saved))
      } catch (err) {
        console.error(err)
        toast.error('Could not load profile data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cycleColor = () => {
    const next = (colorIdx + 1) % AVATAR_COLORS.length
    setColorIdx(next)
    localStorage.setItem('profile_color_idx', next)
  }

  const saveBio = async () => {
    setSavingBio(true)
    try {
      // Optimistic update — store in localStorage since we don't have a bio endpoint
      localStorage.setItem('profile_bio', bio)
      toast.success('Bio saved!')
      setEditingBio(false)
    } catch {
      toast.error('Could not save bio')
    } finally {
      setSavingBio(false)
    }
  }

  // Init bio from storage
  useEffect(() => {
    const saved = localStorage.getItem('profile_bio')
    if (saved) setBio(saved)
  }, [])

  // Filtered interviews
  const filtered = interviews.filter(iv =>
    filter === 'all' ? true :
    filter === 'completed' ? iv.completed :
    filter === 'in-progress' ? !iv.completed :
    iv.type === filter
  )
  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore   = filtered.length > paginated.length

  // Skills progress derived from scoreHistory
  const skillsOverTime = (stats?.scoreHistory || []).map((iv, i) => ({
    n: i + 1,
    Score: iv.score,
  }))

  // Radar data
  const completedIvs = interviews.filter(iv => iv.completed && iv.scores)
  const avgScores = completedIvs.length > 0 ? {
    technical:     completedIvs.reduce((a, b) => a + (b.scores?.technical || 0), 0) / completedIvs.length,
    communication: completedIvs.reduce((a, b) => a + (b.scores?.communication || 0), 0) / completedIvs.length,
    confidence:    completedIvs.reduce((a, b) => a + (b.scores?.confidence || 0), 0) / completedIvs.length,
    depth:         completedIvs.reduce((a, b) => a + (b.scores?.depth || 0), 0) / completedIvs.length,
    problemSolving:completedIvs.reduce((a, b) => a + (b.scores?.problemSolving || 0), 0) / completedIvs.length,
  } : { technical: 0, communication: 0, confidence: 0, depth: 0, problemSolving: 0 }

  const radarData = [
    { subject: 'Technical',     value: (avgScores.technical     || 0) * 10 },
    { subject: 'Communication', value: (avgScores.communication || 0) * 10 },
    { subject: 'Confidence',    value: (avgScores.confidence    || 0) * 10 },
    { subject: 'Depth',         value: (avgScores.depth         || 0) * 10 },
    { subject: 'Solving',       value: (avgScores.problemSolving|| 0) * 10 },
  ]

  // Type breakdown
  const typeBreakdown = interviews.reduce((acc, iv) => {
    acc[iv.type] = (acc[iv.type] || 0) + 1
    return acc
  }, {})

  const nextLevelXP = 1000
  const currentXP   = (stats?.totalPoints || 0) % 1000
  const xpPct        = (currentXP / nextLevelXP) * 100

  if (loading) return (
    <div className="min-h-screen bg-void flex items-center justify-center pt-16">
      <div className="flex gap-2">
        <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-void pt-20 pb-20">
      {/* Share overlay */}
      <AnimatePresence>
        {showShare && stats && (
          <ShareCard user={user} stats={stats} onClose={() => setShowShare(false)} />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-text-muted text-sm mb-6">
          <Link to="/dashboard" className="hover:text-text-secondary transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Profile</span>
        </div>

        {/* ── Hero section ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 mb-6 relative overflow-hidden"
        >
          {/* top gradient bar */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: `linear-gradient(90deg, ${AVATAR_COLORS[colorIdx][0]}, ${AVATAR_COLORS[colorIdx][1]})` }}
          />
          {/* subtle bg glow */}
          <div
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${AVATAR_COLORS[colorIdx][0]}, transparent)` }}
          />

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar
              name={user?.name}
              colorIdx={colorIdx}
              size={100}
              editable
              onColorChange={cycleColor}
            />

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold text-text-primary">{user?.name}</h1>
                  <p className="text-text-muted text-sm mt-1">{user?.email}</p>

                  {/* Bio */}
                  {editingBio ? (
                    <div className="mt-3 flex flex-col gap-2 max-w-md">
                      <textarea
                        value={bio}
                        onChange={e => setBio(e.target.value)}
                        placeholder="Write a short bio about yourself..."
                        rows={2}
                        maxLength={160}
                        className="bg-void/60 border border-border focus:border-electric rounded-xl px-3 py-2 text-text-primary placeholder:text-text-muted text-sm transition-all resize-none"
                      />
                      <div className="flex gap-2 items-center">
                        <button onClick={saveBio} disabled={savingBio} className="btn-primary text-xs py-1.5 px-3">
                          {savingBio ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3" /> Save</>}
                        </button>
                        <button onClick={() => setEditingBio(false)} className="btn-ghost text-xs py-1.5 px-3">Cancel</button>
                        <span className="text-[10px] text-text-muted ml-auto">{bio.length}/160</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-start gap-2">
                      <p className="text-text-secondary text-sm max-w-md leading-relaxed">
                        {bio || <span className="text-text-muted italic">No bio yet — click to add one</span>}
                      </p>
                      <button
                        onClick={() => setEditingBio(true)}
                        className="text-text-muted hover:text-electric transition-colors flex-shrink-0 mt-0.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Level + XP bar */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="flex items-center gap-2 bg-white/5 border border-border/40 px-3 py-1.5 rounded-full">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: `linear-gradient(135deg, ${AVATAR_COLORS[colorIdx][0]}, ${AVATAR_COLORS[colorIdx][1]})`, color: 'white' }}
                      >
                        {stats?.level || 1}
                      </div>
                      <div className="w-20 bg-void/50 h-1.5 rounded-full overflow-hidden border border-border/20">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${xpPct}%` }}
                          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${AVATAR_COLORS[colorIdx][0]}, ${AVATAR_COLORS[colorIdx][1]})` }}
                        />
                      </div>
                      <span className="text-[10px] text-text-muted font-mono">{currentXP}/{nextLevelXP} XP</span>
                    </div>
                    {stats?.streak > 0 && (
                      <div className="flex items-center gap-1.5 text-sm font-medium text-warning">
                        <Flame className="w-4 h-4 fill-warning" />
                        {stats.streak}-day streak
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => setShowShare(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-border hover:border-border-bright hover:bg-white/10 transition-all text-text-secondary hover:text-text-primary"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  <Link to="/dashboard" className="btn-primary text-sm py-2 px-4">
                    <Brain className="w-4 h-4" /> Practice
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-border/30">
            {[
              { label: 'Total Interviews', value: stats?.total || 0,                    icon: Brain,    color: '#4f8ef7' },
              { label: 'Average Score',    value: `${(stats?.avgScore  || 0).toFixed(1)}/10`, icon: Target,   color: '#22d3ee' },
              { label: 'Best Score',       value: `${(stats?.bestScore || 0).toFixed(1)}/10`, icon: Trophy,   color: '#a78bfa' },
              { label: 'Total XP',         value: stats?.points || 0,                  icon: Zap,      color: '#f59e0b' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-display font-bold" style={{ color }}>{value}</div>
                <div className="text-text-muted text-xs mt-1 flex items-center justify-center gap-1">
                  <Icon className="w-3 h-3" /> {label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Two-column grid ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

          {/* Left: Skills & Radar */}
          <div className="lg:col-span-2 space-y-6">

            {/* Score over time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display font-semibold text-text-primary">Score Progression</h2>
                  <p className="text-xs text-text-muted mt-0.5">Overall score across last 10 sessions</p>
                </div>
                <TrendingUp className="w-5 h-5 text-electric opacity-50" />
              </div>
              {skillsOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={skillsOverTime}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={AVATAR_COLORS[colorIdx][0]} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={AVATAR_COLORS[colorIdx][0]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e2538" vertical={false} />
                    <XAxis dataKey="n" tick={{ fill: '#4a5580', fontSize: 11 }} axisLine={false} tickLine={false} label={{ value: 'Session', position: 'insideBottom', offset: -2, fill: '#4a5580', fontSize: 10 }} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#4a5580', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="Score"
                      stroke={AVATAR_COLORS[colorIdx][0]}
                      fill="url(#scoreGrad)"
                      strokeWidth={2.5}
                      dot={{ fill: AVATAR_COLORS[colorIdx][0], strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-text-muted opacity-40 flex-col gap-2">
                  <BarChart2 className="w-8 h-8" />
                  <p className="text-sm">Complete interviews to track progress</p>
                </div>
              )}
            </motion.div>

            {/* Skills breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <GitBranch className="w-4 h-4 text-electric" />
                <h2 className="font-display font-semibold text-text-primary">Skills Tracker</h2>
                <span className="text-xs text-text-muted ml-auto">Averaged from {completedIvs.length} completed sessions</span>
              </div>
              {completedIvs.length > 0 ? (
                <div className="space-y-4">
                  {[
                    { label: 'Technical Knowledge', value: avgScores.technical,     color: '#4f8ef7' },
                    { label: 'Communication',        value: avgScores.communication, color: '#22d3ee' },
                    { label: 'Confidence',           value: avgScores.confidence,    color: '#a78bfa' },
                    { label: 'Answer Depth',         value: avgScores.depth,         color: '#10b981' },
                    { label: 'Problem Solving',      value: avgScores.problemSolving,color: '#f59e0b' },
                  ].map((s, i) => (
                    <SkillBar key={s.label} {...s} delay={i * 0.08} />
                  ))}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-text-muted opacity-40 flex-col gap-2">
                  <Layers className="w-7 h-7" />
                  <p className="text-sm">Complete interviews to see skill breakdowns</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">

            {/* Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="font-display font-semibold text-text-primary mb-4">Competency Radar</h2>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1e2538" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#4a5580', fontSize: 10 }} />
                  <Radar
                    dataKey="value"
                    stroke={AVATAR_COLORS[colorIdx][0]}
                    fill={AVATAR_COLORS[colorIdx][0]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Interview type breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-electric" />
                <h2 className="font-display font-semibold text-text-primary">Session Breakdown</h2>
              </div>
              {Object.keys(typeBreakdown).length > 0 ? (
                <div className="space-y-2.5">
                  {Object.entries(typeBreakdown).map(([type, count]) => {
                    const meta = TYPE_META[type] || TYPE_META.technical
                    const pct  = Math.round((count / interviews.length) * 100)
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: meta.color + '20' }}>
                          <meta.icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-secondary">{meta.label}</span>
                            <span className="text-text-muted font-mono">{count} ({pct}%)</span>
                          </div>
                          <div className="h-1 bg-border/60 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: meta.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-text-muted text-sm opacity-40 text-center py-4">No sessions yet</p>
              )}
            </motion.div>

            {/* Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-warning" />
                <h2 className="font-display font-semibold text-text-primary">Achievements</h2>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(BADGE_META).map(([key, meta]) => {
                  const earned = stats?.badges?.includes(key)
                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        earned ? 'border-border-bright bg-white/5' : 'border-border/30 opacity-30 grayscale'
                      }`}
                    >
                      <div className="text-2xl mb-1">{meta.emoji}</div>
                      <p className="text-[10px] font-bold text-text-primary leading-tight">{meta.label}</p>
                      <p className="text-[9px] text-text-muted mt-1 leading-tight">{meta.desc}</p>
                      {earned && <div className="text-[9px] text-success mt-1 font-bold uppercase tracking-wider">Unlocked</div>}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── Interview History Timeline ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="font-display font-semibold text-text-primary">Interview History</h2>
              <p className="text-xs text-text-muted mt-0.5">{filtered.length} of {interviews.length} sessions</p>
            </div>
            {/* Filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-text-secondary border border-border hover:border-border-bright hover:text-text-primary transition-all"
              >
                <Filter className="w-3.5 h-3.5" />
                {filter === 'all' ? 'All Types' : TYPE_META[filter]?.label || filter}
                <ChevronDown className={`w-3 h-3 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-48 glass rounded-xl border border-border-bright shadow-xl z-10 overflow-hidden"
                  >
                    {[
                      { val: 'all',         label: 'All Types' },
                      { val: 'completed',   label: 'Completed' },
                      { val: 'in-progress', label: 'In Progress' },
                      ...Object.entries(TYPE_META).map(([val, m]) => ({ val, label: m.label })),
                    ].map(({ val, label }) => (
                      <button
                        key={val}
                        onClick={() => { setFilter(val); setFilterOpen(false); setPage(1) }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-white/5 ${
                          filter === val ? 'text-electric bg-electric/8' : 'text-text-secondary'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {paginated.length === 0 ? (
            <div className="text-center py-12 text-text-muted opacity-40">
              <Calendar className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No interviews match this filter</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-electric/40 via-border to-transparent" />

              <div className="space-y-4 pl-12">
                {paginated.map((iv, i) => {
                  const meta  = TYPE_META[iv.type] || TYPE_META.technical
                  const date  = iv.completedAt || iv.createdAt
                  const score = iv.scores?.overall

                  return (
                    <motion.div
                      key={iv._id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <div
                        className="absolute -left-[2.75rem] top-3 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          background: iv.completed ? meta.color + '30' : '#1e2538',
                          borderColor: iv.completed ? meta.color : '#2a3350',
                        }}
                      >
                        {iv.completed && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                        )}
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl border border-border/40 bg-void/30 hover:border-border-bright hover:bg-void/50 transition-all group">
                        {/* Type icon */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: meta.color + '20' }}
                        >
                          <meta.icon className="w-4.5 h-4.5" style={{ color: meta.color }} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-text-primary text-sm capitalize">{iv.type} Interview</p>
                            {iv.company && (
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter font-bold"
                                style={{ background: meta.color + '15', color: meta.color, border: `1px solid ${meta.color}30` }}
                              >
                                {iv.company}
                              </span>
                            )}
                            {!iv.completed && (
                              <span className="text-[10px] text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20 uppercase font-bold tracking-tighter">
                                In Progress
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <p className="text-text-muted text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {date && isValid(new Date(date))
                                ? `${format(new Date(date), 'MMM d, yyyy')} · ${formatDistanceToNow(new Date(date), { addSuffix: true })}`
                                : '—'}
                            </p>
                            {iv.questions?.length > 0 && (
                              <p className="text-text-muted text-xs">{iv.questions.length} questions</p>
                            )}
                          </div>
                        </div>

                        {/* Score + action */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {score != null && (
                            <div className="text-right">
                              <div
                                className="text-sm font-mono font-bold"
                                style={{ color: scoreColor(score) }}
                              >
                                {score.toFixed(1)}/10
                              </div>
                              <div className="text-[9px] text-text-muted uppercase tracking-widest">Score</div>
                            </div>
                          )}
                          {iv.completed ? (
                            <button
                              onClick={() => navigate(`/results/${iv._id}`)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-electric/10 text-electric"
                              title="View Report"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/interview/${iv._id}`)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-electric/10 text-electric"
                              title="Resume"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="mt-6 text-center pl-12">
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="btn-ghost text-sm py-2 px-6"
                  >
                    Load more ({filtered.length - paginated.length} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { scoreColor } from '../../utils/score.js'
import styles from './CalendarGrid.module.css'

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function isoDate(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function CalendarGrid() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [scoreMap, setScoreMap] = useState({})

  useEffect(() => {
    // fetch enough days to always cover the viewed month from today
    const msPerDay = 86400000
    const daysBack = Math.ceil((today - viewDate) / msPerDay) + 31
    window.api.getReports(Math.max(daysBack, 31)).then((data) => {
      const map = {}
      for (const d of data) map[d.date] = d.avg_focus
      setScoreMap(map)
    })
  }, [viewDate])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // build calendar cells: blank pads + day numbers
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7 // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const todayStr = isoDate(today.getFullYear(), today.getMonth(), today.getDate())

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1))
  }
  function nextMonth() {
    const next = new Date(year, month + 1, 1)
    if (next <= new Date(today.getFullYear(), today.getMonth(), 1)) setViewDate(next)
  }
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={styles.wrap}
    >
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>CALENDAR</p>
            <p className={styles.title}>Daily Focus</p>
          </div>
          <div className={styles.nav}>
            <button className={styles.navBtn} onClick={prevMonth}>‹</button>
            <span className={styles.monthLabel}>{monthLabel}</span>
            <button className={styles.navBtn} onClick={nextMonth} disabled={isCurrentMonth}>›</button>
          </div>
        </div>

        <div className={styles.grid}>
          {DAYS.map(d => (
            <div key={d} className={styles.dayHeader}>{d}</div>
          ))}
          {cells.map((day, i) => {
            if (!day) return <div key={`blank-${i}`} />
            const dateStr = isoDate(year, month, day)
            const score = scoreMap[dateStr]
            const isToday = dateStr === todayStr
            const hasData = score !== undefined

            return (
              <div key={dateStr} className={`${styles.cell} ${isToday ? styles.cellToday : ''}`}>
                <span className={`${styles.dayNum} ${isToday ? styles.dayNumToday : ''}`}>{day}</span>
                <div className={styles.barTrack}>
                  {hasData && (
                    <motion.div
                      className={styles.bar}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(score, 4)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      style={{ background: scoreColor(score), boxShadow: `0 0 6px ${scoreColor(score)}66` }}
                    />
                  )}
                </div>
                {hasData && (
                  <span className={styles.scoreLabel} style={{ color: scoreColor(score) }}>
                    {Math.round(score)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import api from '../../lib/api.js'
import SessionCard from '../../components/SessionCard/SessionCard.jsx'
import { SparkleIcon, StackIcon } from '../../components/icons/index.js'
import styles from './History.module.css'

export default function History() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getReports(90).then((data) => {
      const all = data.flatMap((d) => d.sessions || [])
      all.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      setSessions(all)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className={styles.loaderWrap}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className={styles.loader}
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
          <p className={styles.eyebrow}>
            <SparkleIcon variant="small" size={11} /> HISTORY
          </p>
          <h1 className={styles.title}>Session History</h1>
          <p className={styles.sub}>{sessions.length} sessions · last 90 days</p>
        </motion.div>
      </div>

      {sessions.length === 0 ? (
        <div className={styles.emptyCard}>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.4 }}
            className={styles.emptyIcon}
          >
            <StackIcon />
          </motion.div>
          <p className={styles.emptyTitle}>No sessions yet</p>
          <p className={styles.emptySub}>Complete a focus session to see your history</p>
        </div>
      ) : (
        <div className={styles.list}>
          {sessions.map((sess, i) => (
            <SessionCard key={sess.id} sess={sess} i={i} />
          ))}
        </div>
      )}
    </div>
  )
}

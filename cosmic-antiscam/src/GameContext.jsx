import { createContext, useContext, useState, useRef, useEffect } from 'react'
import { MONSTERS, XP_TABLE } from './data'

const GameCtx = createContext(null)

function loadSave() {
  try {
    const raw = localStorage.getItem('cosmicSave_v4')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function GameProvider({ children }) {
  const save = loadSave()
  const savedLevel = save?.level ?? 1
  const savedCoinUnlocked = save?.coinUnlocked ?? {}

  const [coins, setCoins] = useState(save?.coins ?? 0)
  const [xp, setXp] = useState(save?.xp ?? 0)
  const [level, setLevel] = useState(savedLevel)
  const [bag, setBag] = useState(save?.bag ?? {})
  const [coinUnlocked, setCoinUnlocked] = useState(savedCoinUnlocked)

  // 怪物解鎖狀態從等級 + 金幣購買推導，不信任舊的 monsters map
  const [monsters, setMonsters] = useState(() =>
    MONSTERS.map(m => ({
      ...m,
      unlocked: m.unlocked || savedLevel >= m.lv || !!savedCoinUnlocked[m.id],
    }))
  )
  const [justUnlocked, setJustUnlocked] = useState([])
  const ulQueue = useRef([])

  useEffect(() => {
    localStorage.setItem('cosmicSave_v4', JSON.stringify({
      coins, xp, level, bag, coinUnlocked,
    }))
  }, [coins, xp, level, bag, coinUnlocked])

  const xpForLv = (lv) => XP_TABLE[lv] ?? lv * 600

  const addCoins = (n) => setCoins(c => c + n)
  const spendCoins = (n) => setCoins(c => Math.max(0, c - n))

  const addXp = (amount, onUnlock) => {
    setXp(prev => {
      let newXp = prev + amount
      setLevel(prevLv => {
        let lv = prevLv
        while (lv < XP_TABLE.length - 1 && newXp >= xpForLv(lv)) {
          lv++
          checkMonsterUnlocks(lv, onUnlock)
        }
        return lv
      })
      return newXp
    })
  }

  const checkMonsterUnlocks = (lv, onUnlock) => {
    setMonsters(prev => {
      const next = prev.map(m => {
        if (!m.unlocked && lv >= m.lv) {
          if (onUnlock) onUnlock(m, false)
          return { ...m, unlocked: true }
        }
        return m
      })
      return next
    })
  }

  const unlockMonster = (id, isCoin) => {
    setMonsters(prev => prev.map(m => m.id === id ? { ...m, unlocked: true } : m))
    setJustUnlocked(prev => [...prev, id])
    if (isCoin) {
      setCoinUnlocked(prev => ({ ...prev, [id]: true }))
    }
  }

  const buyItem = (item) => {
    if (coins < item.price) return false
    spendCoins(item.price)
    setBag(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))
    return true
  }

  const useItem = (id) => {
    if ((bag[id] || 0) <= 0) return false
    setBag(prev => ({ ...prev, [id]: prev[id] - 1 }))
    return true
  }

  const clearJustUnlocked = () => setJustUnlocked([])

  const getXpProgress = () => {
    const base = level > 1 ? xpForLv(level - 1) : 0
    const next = xpForLv(level)
    const cur = xp - base
    const range = Math.max(next - base, 1)
    return { cur, range, pct: Math.min(100, Math.round(cur / range * 100)), next }
  }

  return (
    <GameCtx.Provider value={{
      coins, xp, level, bag, monsters, justUnlocked,
      addCoins, spendCoins, addXp, unlockMonster, buyItem, useItem,
      clearJustUnlocked, getXpProgress, setMonsters, xpForLv,
    }}>
      {children}
    </GameCtx.Provider>
  )
}

export const useGame = () => useContext(GameCtx)

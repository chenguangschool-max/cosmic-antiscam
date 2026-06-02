import { useState, useEffect, useCallback } from 'react'

let _show = null

export function useToast() {
  const show = useCallback((msg, isErr = false) => {
    if (_show) _show(msg, isErr)
  }, [])
  return show
}

export default function Toast() {
  const [state, setState] = useState({ msg: '', isErr: false, visible: false })

  useEffect(() => {
    _show = (msg, isErr) => {
      setState({ msg, isErr, visible: true })
      setTimeout(() => setState(s => ({ ...s, visible: false })), 2400)
    }
    return () => { _show = null }
  }, [])

  if (!state.visible) return null

  return (
    <div style={{
      position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)',
      background: state.isErr ? 'rgba(255,80,80,.14)' : 'rgba(50,200,150,.16)',
      border: `1px solid ${state.isErr ? 'rgba(255,80,80,.28)' : 'rgba(50,200,150,.34)'}`,
      color: state.isErr ? '#ffaaaa' : '#8ee8c0',
      borderRadius:9, padding:'7px 16px', fontSize:12, whiteSpace:'nowrap',
      zIndex:999, pointerEvents:'none',
    }}>
      {state.msg}
    </div>
  )
}

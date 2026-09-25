import { useCallback, useEffect, useRef, useState } from 'react'

const ANIM_MS = 220
const EASE = 'cubic-bezier(.22,.61,.36,1)'
const CLOSE_RATIO = 0.25
const CLOSE_VELOCITY = 0.6 // px/ms

function useBodyScrollLock(active, containerRef) {
  useEffect(() => {
    if (!active) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const preventScroll = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        e.preventDefault()
      }
    }
    document.addEventListener('touchmove', preventScroll, { passive: false })
    document.addEventListener('wheel', preventScroll, { passive: false })
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('touchmove', preventScroll)
      document.removeEventListener('wheel', preventScroll)
    }
  }, [active, containerRef])
}

// Empurra uma entrada de histórico enquanto a folha deveria estar aberta, e a consome
// quando ela fecha. A ref `pushedRef` garante push/pop únicos mesmo com o StrictMode
// do React invocando o efeito duas vezes (senão a folha se fechava sozinha em dev).
function useBackButtonClose(open, onClose) {
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const pushedRef = useRef(false)

  useEffect(() => {
    if (!open) return
    if (!pushedRef.current) {
      pushedRef.current = true
      window.history.pushState({ rfSheet: true }, '')
    }
    const onPop = () => {
      pushedRef.current = false
      onCloseRef.current()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [open])

  useEffect(() => {
    if (open || !pushedRef.current) return
    pushedRef.current = false
    if (window.history.state?.rfSheet) {
      window.history.back()
    }
  }, [open])
}

// Folha que sobe de baixo: fecha tocando fora, arrastando para baixo, no Esc ou no
// botão voltar. Único componente usado por todas as folhas do app.
export function Sheet({ open, onClose, title, sub, children, onExited }) {
  const rootRef = useRef(null)
  const sheetRef = useRef(null)
  const bodyRef = useRef(null)
  const [phase, setPhase] = useState(open ? 'entering' : 'closed')
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStateRef = useRef({ y: 0, base: 0, t: 0, armed: false, active: false })
  const heightRef = useRef(400)

  const active = phase !== 'closed'
  useBodyScrollLock(active, rootRef)
  useBackButtonClose(open, onClose)

  useEffect(() => {
    if (open) {
      setPhase('entering')
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase('open'))
      })
      return () => cancelAnimationFrame(id)
    }
    setPhase((p) => (p === 'closed' ? 'closed' : 'closing'))
  }, [open])

  useEffect(() => {
    if (phase !== 'closing') return
    const id = setTimeout(() => {
      setPhase('closed')
      setDragY(0)
      onExited?.()
    }, ANIM_MS)
    return () => clearTimeout(id)
  }, [phase, onExited])

  useEffect(() => {
    if (phase !== 'open' && phase !== 'entering') return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [phase, onClose])

  const beginDrag = useCallback(
    (e, fromHandle) => {
      if (phase !== 'open' || !e.isPrimary) return
      heightRef.current = sheetRef.current?.getBoundingClientRect().height || heightRef.current
      const armed = fromHandle || (bodyRef.current ? bodyRef.current.scrollTop <= 0 : true)
      dragStateRef.current = { y: e.clientY, base: dragY, t: performance.now(), armed, active: false }
      if (fromHandle) e.preventDefault()
    },
    [phase, dragY]
  )

  const onMove = useCallback((e) => {
    const st = dragStateRef.current
    if (!st.armed || !e.isPrimary) return
    const delta = e.clientY - st.y
    if (!st.active) {
      if (delta <= 0) return
      if (bodyRef.current && bodyRef.current.scrollTop > 0) return
      st.active = true
      setDragging(true)
    }
    e.preventDefault()
    setDragY(Math.max(0, st.base + delta))
  }, [])

  const endDrag = useCallback(
    (canceled) => {
      const st = dragStateRef.current
      if (!st.active) {
        st.armed = false
        return
      }
      st.active = false
      setDragging(false)
      if (canceled) {
        setDragY(0)
        return
      }
      const dt = Math.max(1, performance.now() - st.t)
      const traveled = dragY - st.base
      const velocity = traveled / dt
      const ratio = dragY / (heightRef.current || 1)
      if (ratio > CLOSE_RATIO || velocity > CLOSE_VELOCITY) {
        onClose()
      } else {
        setDragY(0)
      }
    },
    [dragY, onClose]
  )

  if (phase === 'closed') return null

  const transform = phase === 'entering' || phase === 'closing' ? 'translateY(100%)' : `translateY(${dragY}px)`
  const withTransition = !dragging
  const maxBackdrop = 0.6
  const dragRatio = Math.min(1, dragY / (heightRef.current || 400))
  const backdropOpacity = phase === 'entering' || phase === 'closing' ? 0 : maxBackdrop * (1 - dragRatio)

  return (
    <div
      ref={rootRef}
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 70,
        background: `rgba(4,10,7,${backdropOpacity})`,
        transition: withTransition ? `background ${ANIM_MS}ms ${EASE}` : 'none',
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        onPointerMove={onMove}
        onPointerUp={() => endDrag(false)}
        onPointerCancel={() => endDrag(true)}
        style={{
          width: '100%',
          maxHeight: '86dvh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '28px 28px 0 0',
          background: '#10231A',
          borderTop: '1px solid rgba(201,242,77,.2)',
          transform,
          transition: withTransition ? `transform ${ANIM_MS}ms ${EASE}` : 'none',
          touchAction: 'none',
        }}
      >
        <div
          onPointerDown={(e) => beginDrag(e, true)}
          style={{ flex: 'none', padding: '14px 0 6px', display: 'flex', justifyContent: 'center', cursor: 'grab' }}
        >
          <div
            style={{
              width: '40px',
              height: '4px',
              borderRadius: '99px',
              background: 'rgba(234,243,236,.2)',
            }}
          />
        </div>

        <div
          onPointerDown={(e) => beginDrag(e, false)}
          style={{ flex: 'none', padding: '0 22px 14px' }}
        >
          <div style={{ font: "800 25px/1.1 'Barlow Condensed', sans-serif", letterSpacing: '-.01em' }}>{title}</div>
          {sub && (
            <div style={{ font: '400 13.5px/1.45 Barlow, sans-serif', color: 'rgba(234,243,236,.7)', marginTop: '7px' }}>
              {sub}
            </div>
          )}
        </div>

        <div
          ref={bodyRef}
          onPointerDown={(e) => beginDrag(e, false)}
          style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: '0 22px 44px' }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

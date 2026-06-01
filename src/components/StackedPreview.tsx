import { useRef, useEffect, useMemo } from 'react'
import './StackedPreview.css'

const STACK_SIZE = 256

export default function StackedPreview({
  baseUrl,
  layerUrls,
}: {
  baseUrl: string
  layerUrls: { src: string; zOffset: number }[]
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const layerRefs = useRef<(HTMLImageElement | null)[]>([])
  const offsetRef = useRef({ x: 0, y: 0 })
  const draggingRef = useRef(false)
  const rafRef = useRef(0)

  const reversed = useMemo(() => [...layerUrls].reverse(), [layerUrls])
  layerRefs.current = layerRefs.current.slice(0, reversed.length)
  const depths = reversed.map((_, i) => (i + 1) * 0.04)

  function schedule() {
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        applyTransforms()
      })
    }
  }

  function applyTransforms() {
    const { x, y } = offsetRef.current
    const dragging = draggingRef.current
    const tiltMag = Math.min(1, Math.sqrt(x * x + y * y))
    const gapBoost = 1 + tiltMag * 4

    if (stageRef.current) {
      stageRef.current.style.transform = dragging
        ? `perspective(800px) rotateX(${-y * 20}deg) rotateY(${x * 20}deg)`
        : ''
    }

    layerRefs.current.forEach((el, i) => {
      if (!el) return
      const factor = dragging ? depths[i] * gapBoost : 0
      el.style.transform = `translate(${x * factor * STACK_SIZE}px, ${y * factor * STACK_SIZE}px)`
    })
  }



  function handleMove(e: MouseEvent) {
    if (!draggingRef.current || !stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    offsetRef.current = {
      x: Math.max(-1, Math.min(1, (e.clientX - cx) / rect.width)),
      y: Math.max(-1, Math.min(1, (e.clientY - cy) / rect.height)),
    }
    schedule()
  }

  function handleUp() {
    document.removeEventListener('mousemove', handleMove)
    document.removeEventListener('mouseup', handleUp)
    draggingRef.current = false
    offsetRef.current = { x: 0, y: 0 }
    schedule()
  }

  function handleMouseDown() {
    draggingRef.current = true
    schedule()
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }
  }, [])

  return (
    <div
      className="stacked-preview"
      onMouseDown={handleMouseDown}
    >
      <div ref={stageRef} className="stacked-stage">
        {baseUrl && <img src={baseUrl} alt="Base" className="stacked-layer" />}
        {reversed.map((layer, i) => (
          <img
            key={i}
            src={layer.src}
            alt={`Glass ${layerUrls.length - i}`}
            className="stacked-layer"
            ref={el => { layerRefs.current[i] = el }}
          />
        ))}
      </div>
    </div>
  )
}

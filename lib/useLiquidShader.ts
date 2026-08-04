'use client'

import { useEffect, useRef } from 'react'

// Minimal three.js liquid displacement on hover
// Uses a plane + custom fragment shader with time-based distortion
export function useLiquidShader(canvasRef: React.RefObject<HTMLCanvasElement | null>, imageUrl: string) {
  const threeRef = useRef<{ dispose: () => void } | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !imageUrl) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let mounted = true
    let animId: number

    async function init() {
      const THREE = await import('three')

      const canvas = canvasRef.current!
      const w = canvas.clientWidth
      const h = canvas.clientHeight

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false })
      renderer.setSize(w, h, false)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
      camera.position.z = 1

      // Load texture
      const tex = await new THREE.TextureLoader().loadAsync(imageUrl)
      tex.minFilter = THREE.LinearFilter

      const uniforms = {
        uTexture: { value: tex },
        uTime: { value: 0 },
        uHover: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      }

      const mat = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        vertexShader: /* glsl */`
          varying vec2 vUv;
          void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
        `,
        fragmentShader: /* glsl */`
          uniform sampler2D uTexture;
          uniform float uTime;
          uniform float uHover;
          uniform vec2 uMouse;
          varying vec2 vUv;

          void main() {
            vec2 uv = vUv;
            float dist = distance(uv, uMouse);
            float wave = sin(dist * 18.0 - uTime * 4.0) * 0.012 * uHover * (1.0 - dist * 1.5);
            uv += wave;
            gl_FragColor = texture2D(uTexture, clamp(uv, 0.0, 1.0));
          }
        `,
      })

      const geo = new THREE.PlaneGeometry(2, 2)
      scene.add(new THREE.Mesh(geo, mat))

      // Mouse tracking
      const onMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect()
        uniforms.uMouse.value.set(
          (e.clientX - rect.left) / rect.width,
          1 - (e.clientY - rect.top) / rect.height
        )
      }
      const onEnter = () => { uniforms.uHover.value = 1 }
      const onLeave = () => { uniforms.uHover.value = 0 }

      canvas.addEventListener('mousemove', onMove)
      canvas.addEventListener('mouseenter', onEnter)
      canvas.addEventListener('mouseleave', onLeave)

      function animate(t: number) {
        if (!mounted) return
        uniforms.uTime.value = t * 0.001
        renderer.render(scene, camera)
        animId = requestAnimationFrame(animate)
      }
      animId = requestAnimationFrame(animate)

      threeRef.current = {
        dispose: () => {
          cancelAnimationFrame(animId)
          canvas.removeEventListener('mousemove', onMove)
          canvas.removeEventListener('mouseenter', onEnter)
          canvas.removeEventListener('mouseleave', onLeave)
          renderer.dispose()
          geo.dispose()
          mat.dispose()
          tex.dispose()
        }
      }
    }

    init()
    return () => { mounted = false; threeRef.current?.dispose() }
  }, [canvasRef, imageUrl])
}

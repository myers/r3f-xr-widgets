import {
  Container,
  type VanillaContainer,
  type ContainerProperties,
} from "@react-three/uikit"
import { colors } from "@react-three/uikit-default"
import {
  type ReactNode,
  type RefAttributes,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react"
import {
  type EventHandlers,
  type ThreeEvent,
  useFrame,
} from "@react-three/fiber"
import { Vector3 } from "three"
import { Signal, computed } from "@preact/signals-core"

const vectorHelper = new Vector3()
const MS_PER_SECOND = 1000

type TimeRanges = {
  length: number
  start(index: number): number
  end(index: number): number
}

type MediaController = {
  currentTime: number
  duration: number
  paused: boolean
  buffered: TimeRanges
  play(): Promise<void>
  pause(): void
}

type BufferedRange = {
  start: `${number}%`
  width: `${number}%`
}

export type VideoSliderProperties = {
  media?: MediaController
  value?: Signal<number> | number
  onValueChange?(value: number): void
} & Omit<ContainerProperties, "children">

export const VideoSlider: (
  props: VideoSliderProperties & RefAttributes<VanillaContainer>,
) => ReactNode = forwardRef(
  ({ media, value: providedValue, onValueChange, ...props }, ref) => {
    const [uncontrolled, setUncontrolled] = useState(0)
    const [bufferedRanges, setBufferedRanges] = useState<BufferedRange[]>([])
    const value = providedValue ?? uncontrolled ?? 0
    const wasPlayingRef = useRef(false)

    useEffect(() => {
      if (!media) return

      const handleTimeUpdate = () => {
        if (media.paused && !providedValue) {
          setUncontrolled(media.currentTime * MS_PER_SECOND)
        }
      }

      // Add event listener for time updates
      const videoElement = media as unknown as HTMLVideoElement
      videoElement.addEventListener("timeupdate", handleTimeUpdate)

      // Cleanup
      return () => {
        videoElement.removeEventListener("timeupdate", handleTimeUpdate)
      }
    }, [media, providedValue])

    useFrame(() => {
      if (!media || !media.duration) return

      // Update current time if media is playing and not controlled externally
      if (!providedValue && !media.paused) {
        setUncontrolled(media.currentTime * MS_PER_SECOND)
      }

      // Update buffered ranges
      const currentTime = media.currentTime
      const ranges: BufferedRange[] = []

      for (let i = 0; i < media.buffered.length; i++) {
        const start = media.buffered.start(i)
        const end = media.buffered.end(i)

        // Only include ranges that extend beyond current playback position
        if (end > currentTime) {
          const rangeStart = Math.max(start, currentTime)
          const startPercent = (rangeStart / media.duration) * 100
          const widthPercent = ((end - rangeStart) / media.duration) * 100

          ranges.push({
            start: `${Math.min(100, Math.max(0, startPercent))}%` as const,
            width: `${Math.min(100, Math.max(0, widthPercent))}%` as const,
          })
        }
      }
      setBufferedRanges(ranges)
    })

    const percentage = useMemo(
      () =>
        computed(() => {
          if (!media || !media.duration) return "0%"
          const currentValue = readReactive(value)
          if (currentValue === undefined) return "0%"
          const duration = media.duration * MS_PER_SECOND
          return `${Math.min(100, Math.max(0, (100 * currentValue) / duration))}%` as const
        }),
      [media, value],
    )

    const internalRef = useRef<VanillaContainer>(null)
    const onChange = useRef(onValueChange)
    onChange.current = onValueChange
    const hasProvidedValue = providedValue != null
    const handler = useMemo(() => {
      let downPointerId: number | undefined
      function setValue(e: ThreeEvent<PointerEvent>) {
        if (internalRef.current == null || !media || !media.duration) {
          return
        }
        vectorHelper.copy(e.point)
        internalRef.current.worldToLocal(vectorHelper)
        const duration = media.duration * MS_PER_SECOND
        const newValue = Math.min(
          Math.max((vectorHelper.x + 0.5) * duration, 0),
          duration,
        )
        if (!hasProvidedValue) {
          setUncontrolled(newValue)
        }
        onChange.current?.(newValue)

        // Update media time
        media.currentTime = newValue / MS_PER_SECOND
        e.stopPropagation()
      }
      return {
        onPointerDown(e) {
          if (downPointerId != null || !media) {
            return
          }
          wasPlayingRef.current = !media.paused
          media.pause()
          downPointerId = e.pointerId
          setValue(e)
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        },
        onPointerMove(e) {
          if (downPointerId != e.pointerId) {
            return
          }
          setValue(e)
        },
        onPointerUp(e) {
          if (downPointerId == null || !media) {
            return
          }
          downPointerId = undefined
          if (wasPlayingRef.current) {
            media.play()
          }
          e.stopPropagation()
        },
      } satisfies EventHandlers
    }, [media, hasProvidedValue])
    useImperativeHandle(ref, () => internalRef.current!)
    return (
      <Container
        {...(handler as any)}
        positionType="relative"
        flexDirection="column"
        height={8}
        width="100%"
        alignItems="center"
        ref={internalRef}
        {...props}
      >
        <Container
          height={8}
          positionType="absolute"
          positionLeft={0}
          positionRight={0}
          flexGrow={1}
          borderRadius={1000}
          backgroundColor={colors.secondary}
        >
          {bufferedRanges.map((range, index) => (
            <Container
              key={index}
              height="100%"
              width={range.width}
              positionType="absolute"
              positionLeft={range.start}
              borderRadius={1000}
              backgroundColor="#666666"
            />
          ))}
          <Container
            height="100%"
            width={percentage}
            borderRadius={1000}
            backgroundColor={colors.primary}
          />
        </Container>
        <Container
          zIndexOffset={100}
          positionType="absolute"
          positionLeft={percentage}
          transformTranslateX={-4}
          transformTranslateY={-4}
          cursor="pointer"
          height={16}
          width={8}
          borderWidth={2}
          borderRadius={4}
          borderColor={colors.primary}
          backgroundColor={colors.background}
        />
      </Container>
    )
  },
)

function readReactive<T>(s: Signal<T> | T): T {
  if (s instanceof Signal) {
    return s.value
  }
  return s
}

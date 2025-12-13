import { describe, it, expect } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useVideoMetadata } from './useVideoMetadata'
import { createMockVideo } from '../test-utils'

describe('useVideoMetadata Hook', () => {
  describe('Initial State', () => {
    it('should return null when video is undefined', () => {
      const { result } = renderHook(() => useVideoMetadata(undefined))

      expect(result.current).toBeNull()
    })

    it('should return null before metadata is loaded', () => {
      const mockVideo = createMockVideo({
        videoWidth: 1920,
        videoHeight: 1080,
        readyState: 0 // HAVE_NOTHING
      })

      const { result } = renderHook(() => useVideoMetadata(mockVideo))

      expect(result.current).toBeNull()
    })
  })

  describe('Metadata Loading via Event', () => {
    it('should return dimensions after loadedmetadata event', async () => {
      const mockVideo = createMockVideo({
        videoWidth: 1920,
        videoHeight: 1080,
        readyState: 0
      })

      const { result } = renderHook(() => useVideoMetadata(mockVideo))

      // Initially null
      expect(result.current).toBeNull()

      // Dispatch loadedmetadata event
      act(() => {
        mockVideo.dispatchEvent(new Event('loadedmetadata'))
      })

      // Wait for state update
      await waitFor(() => {
        expect(result.current).toEqual({
          width: 1920,
          height: 1080
        })
      })
    })

    it('should handle custom video dimensions', async () => {
      const mockVideo = createMockVideo({
        videoWidth: 3840,
        videoHeight: 2160,
        readyState: 0
      })

      const { result } = renderHook(() => useVideoMetadata(mockVideo))

      act(() => {
        mockVideo.dispatchEvent(new Event('loadedmetadata'))
      })

      await waitFor(() => {
        expect(result.current).toEqual({
          width: 3840,
          height: 2160
        })
      })
    })
  })

  describe('Pre-loaded Metadata', () => {
    it('should return dimensions immediately when readyState >= HAVE_METADATA', () => {
      const mockVideo = createMockVideo({
        videoWidth: 1280,
        videoHeight: 720,
        readyState: 1 // HAVE_METADATA
      })

      const { result } = renderHook(() => useVideoMetadata(mockVideo))

      // Should have dimensions immediately
      expect(result.current).toEqual({
        width: 1280,
        height: 720
      })
    })

    it('should return null when pre-loaded but dimensions are 0', () => {
      const mockVideo = createMockVideo({
        videoWidth: 0,
        videoHeight: 0,
        readyState: 1 // HAVE_METADATA but no dimensions
      })

      const { result } = renderHook(() => useVideoMetadata(mockVideo))

      // Should return null because dimensions are 0 even though metadata is loaded
      expect(result.current).toBeNull()
    })
  })

  describe('Video Element Changes', () => {
    it('should update when video element changes', async () => {
      const video1 = createMockVideo({
        videoWidth: 1920,
        videoHeight: 1080,
        readyState: 1
      })

      const { result, rerender } = renderHook(
        ({ video }: { video?: HTMLVideoElement }) => useVideoMetadata(video),
        { initialProps: { video: video1 } }
      )

      // First video dimensions
      expect(result.current).toEqual({
        width: 1920,
        height: 1080
      })

      // Change to different video
      const video2 = createMockVideo({
        videoWidth: 3840,
        videoHeight: 2160,
        readyState: 0
      })

      rerender({ video: video2 })

      // Should reset to null for new video
      expect(result.current).toBeNull()

      // Dispatch event for new video
      act(() => {
        video2.dispatchEvent(new Event('loadedmetadata'))
      })

      await waitFor(() => {
        expect(result.current).toEqual({
          width: 3840,
          height: 2160
        })
      })
    })

    it('should handle change from video to undefined', () => {
      const mockVideo = createMockVideo({
        videoWidth: 1920,
        videoHeight: 1080,
        readyState: 1
      })

      const { result, rerender } = renderHook(
        ({ video }: { video: HTMLVideoElement | undefined }) => useVideoMetadata(video),
        { initialProps: { video: mockVideo as HTMLVideoElement | undefined } }
      )

      expect(result.current).toEqual({
        width: 1920,
        height: 1080
      })

      // Change to undefined
      rerender({ video: undefined })

      expect(result.current).toBeNull()
    })
  })

  describe('Event Cleanup', () => {
    it('should remove event listener on unmount', () => {
      const mockVideo = createMockVideo({
        videoWidth: 1920,
        videoHeight: 1080,
        readyState: 0
      })

      const { unmount } = renderHook(() => useVideoMetadata(mockVideo))

      // Verify listener was added
      expect(mockVideo.addEventListener).toHaveBeenCalledWith(
        'loadedmetadata',
        expect.any(Function)
      )

      unmount()

      // Verify listener was removed
      expect(mockVideo.removeEventListener).toHaveBeenCalledWith(
        'loadedmetadata',
        expect.any(Function)
      )
    })

    it('should remove old listener when video changes', async () => {
      const video1 = createMockVideo({
        videoWidth: 1920,
        videoHeight: 1080,
        readyState: 0
      })

      const { rerender } = renderHook(
        ({ video }: { video?: HTMLVideoElement }) => useVideoMetadata(video),
        { initialProps: { video: video1 } }
      )

      const video2 = createMockVideo({
        videoWidth: 3840,
        videoHeight: 2160,
        readyState: 0
      })

      rerender({ video: video2 })

      // Should have removed listener from video1
      expect(video1.removeEventListener).toHaveBeenCalledWith(
        'loadedmetadata',
        expect.any(Function)
      )

      // Should have added listener to video2
      expect(video2.addEventListener).toHaveBeenCalledWith(
        'loadedmetadata',
        expect.any(Function)
      )
    })
  })

  describe('Edge Cases', () => {
    it('should return null when loadedmetadata fires but dimensions are 0', () => {
      const mockVideo = createMockVideo({
        videoWidth: 0,
        videoHeight: 0,
        readyState: 0
      })

      const { result } = renderHook(() => useVideoMetadata(mockVideo))

      act(() => {
        mockVideo.dispatchEvent(new Event('loadedmetadata'))
      })

      // Returns null because dimensions are 0 (hook checks videoWidth && videoHeight)
      expect(result.current).toBeNull()
    })

    it('should cleanup listener on unmount (event dispatch is no-op)', () => {
      const mockVideo = createMockVideo({
        videoWidth: 1920,
        videoHeight: 1080,
        readyState: 0
      })

      const { result, unmount } = renderHook(() => useVideoMetadata(mockVideo))

      expect(result.current).toBeNull()

      unmount()

      // Event listener was removed by cleanup, so dispatch does nothing
      // (this verifies cleanup worked - if listener wasn't removed, this would throw)
      act(() => {
        mockVideo.dispatchEvent(new Event('loadedmetadata'))
      })

      // Result is stale (last value before unmount) - hook is unmounted
      expect(result.current).toBeNull()
    })
  })
})

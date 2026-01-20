import { useState, useCallback, useRef } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

interface FaceRecognitionState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useFaceRecognition = () => {
  const [state, setState] = useState<FaceRecognitionState>({
    isLoaded: false,
    isLoading: false,
    error: null,
  });
  const loadedRef = useRef(false);

  const loadModels = useCallback(async () => {
    if (loadedRef.current || state.isLoading) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      
      loadedRef.current = true;
      setState({ isLoaded: true, isLoading: false, error: null });
    } catch (error) {
      console.error('Failed to load face-api models:', error);
      setState({
        isLoaded: false,
        isLoading: false,
        error: 'Failed to load face recognition models',
      });
    }
  }, [state.isLoading]);

  const detectFace = useCallback(async (
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ): Promise<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68> | null> => {
    if (!loadedRef.current) {
      throw new Error('Face recognition models not loaded');
    }

    const detection = await faceapi
      .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();

    return detection || null;
  }, []);

  const getFaceDescriptor = useCallback(async (
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement
  ): Promise<Float32Array | null> => {
    if (!loadedRef.current) {
      throw new Error('Face recognition models not loaded');
    }

    const detection = await faceapi
      .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    return detection?.descriptor || null;
  }, []);

  const compareFaces = useCallback((
    descriptor1: Float32Array,
    descriptor2: Float32Array,
    threshold: number = 0.6
  ): { match: boolean; distance: number } => {
    const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
    return {
      match: distance < threshold,
      distance,
    };
  }, []);

  const checkLiveness = useCallback(async (
    videoElement: HTMLVideoElement,
    durationMs: number = 2000
  ): Promise<{ isLive: boolean; message: string }> => {
    if (!loadedRef.current) {
      throw new Error('Face recognition models not loaded');
    }

    const detections: faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>[] = [];
    const startTime = Date.now();
    const checkInterval = 200;

    return new Promise((resolve) => {
      const intervalId = setInterval(async () => {
        const elapsed = Date.now() - startTime;
        
        if (elapsed >= durationMs) {
          clearInterval(intervalId);
          
          // Analyze collected detections for liveness
          if (detections.length < 5) {
            resolve({ isLive: false, message: 'Could not detect face consistently' });
            return;
          }

          // Check for natural movement variation in landmarks
          const nosePositions = detections.map(d => ({
            x: d.landmarks.getNose()[3].x,
            y: d.landmarks.getNose()[3].y,
          }));

          let totalMovement = 0;
          for (let i = 1; i < nosePositions.length; i++) {
            const dx = nosePositions[i].x - nosePositions[i - 1].x;
            const dy = nosePositions[i].y - nosePositions[i - 1].y;
            totalMovement += Math.sqrt(dx * dx + dy * dy);
          }

          const avgMovement = totalMovement / (nosePositions.length - 1);
          
          // Real faces have slight natural movement (breathing, micro-expressions)
          // Photos are typically very stable
          if (avgMovement < 0.5) {
            resolve({ isLive: false, message: 'Possible photo detected. Please use a live face.' });
          } else if (avgMovement > 50) {
            resolve({ isLive: false, message: 'Too much movement. Please hold still.' });
          } else {
            resolve({ isLive: true, message: 'Liveness verified' });
          }
          return;
        }

        try {
          const detection = await faceapi
            .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();
          
          if (detection) {
            detections.push(detection);
          }
        } catch (e) {
          // Continue even if a single detection fails
        }
      }, checkInterval);
    });
  }, []);

  return {
    ...state,
    loadModels,
    detectFace,
    getFaceDescriptor,
    compareFaces,
    checkLiveness,
  };
};

export const descriptorToArray = (descriptor: Float32Array): number[] => {
  return Array.from(descriptor);
};

export const arrayToDescriptor = (arr: number[]): Float32Array => {
  return new Float32Array(arr);
};

'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass';

// Vertex shader from index.html
const vertexShader = `
  uniform float u_time;

      vec3 mod289(vec3 x)
      {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec4 mod289(vec4 x)
      {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }
      
      vec4 permute(vec4 x)
      {
        return mod289(((x*34.0)+10.0)*x);
      }
      
      vec4 taylorInvSqrt(vec4 r)
      {
        return 1.79284291400159 - 0.85373472095314 * r;
      }
      
      vec3 fade(vec3 t) {
        return t*t*t*(t*(t*6.0-15.0)+10.0);
      }

      // Classic Perlin noise, periodic variant
      float pnoise(vec3 P, vec3 rep)
      {
        vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
        vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
        Pi0 = mod289(Pi0);
        Pi1 = mod289(Pi1);
        vec3 Pf0 = fract(P); // Fractional part for interpolation
        vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        vec4 iy = vec4(Pi0.yy, Pi1.yy);
        vec4 iz0 = Pi0.zzzz;
        vec4 iz1 = Pi1.zzzz;

        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);

        vec4 gx0 = ixy0 * (1.0 / 7.0);
        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
        gx0 = fract(gx0);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        vec4 sz0 = step(gz0, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        gy0 -= sz0 * (step(0.0, gy0) - 0.5);

        vec4 gx1 = ixy1 * (1.0 / 7.0);
        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
        gx1 = fract(gx1);
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        vec4 sz1 = step(gz1, vec4(0.0));
        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        gy1 -= sz1 * (step(0.0, gy1) - 0.5);

        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
        g000 *= norm0.x;
        g010 *= norm0.y;
        g100 *= norm0.z;
        g110 *= norm0.w;
        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
        g001 *= norm1.x;
        g011 *= norm1.y;
        g101 *= norm1.z;
        g111 *= norm1.w;

        float n000 = dot(g000, Pf0);
        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
        float n111 = dot(g111, Pf1);

        vec3 fade_xyz = fade(Pf0);
        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
        return 2.2 * n_xyz;
      }

      uniform float u_frequency;

      void main() {
          float noise = 3.0 * pnoise(position + u_time, vec3(10.0));
          float displacement = (u_frequency / 30.) * (noise / 10.);
          vec3 newPosition = position + normal * displacement;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
`;

// You may need to add the fragment shader as well
const fragmentShader = `
  uniform float u_red;
  uniform float u_blue;
  uniform float u_green;
  uniform float u_red_end;
  uniform float u_green_end;
  uniform float u_blue_end;
  uniform float u_frequency;
  void main() {
    float gradient = gl_FragCoord.y / 600.0;
    vec3 color = mix(vec3(u_red, u_green, u_blue), vec3(u_red_end, u_green_end, u_blue_end), gradient);
    gl_FragColor = vec4(color, 1.0);
  }
`;

interface VisualizerProps {
  circleSize?: number;
  width?: number;
  height?: number;
  gradientStart?: [number, number, number];
  gradientEnd?: [number, number, number];
  showShadow?: boolean;
  wireframe?: boolean;
  bloomStrength?: number;
  bloomRadius?: number;
  bloomThreshold?: number;
  minFrequency?: number;
  meshDensity?: number;
  auth_token?: string;
  onClick?: () => void;
  [key: string]: any;
}

const Visualizer: React.FC<VisualizerProps> = ({
  circleSize = 2,
  width = 400,
  height = 400,
  gradientStart = [0.388, 0.439, 0.643], // #636FA4
  gradientEnd = [0.388, 0.439, 0.643],   // #636FA4
  showShadow = false,
  wireframe = true,
  bloomStrength = 0,
  bloomRadius = 0,
  bloomThreshold = 0,
  minFrequency = 20,
  meshDensity = 10, // new param for geometry detail
  auth_token = "",
  onClick,
  ...props
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const audioElRef = useRef<HTMLAudioElement>(null);
  const audioNodes = useRef<{
    audioContext?: AudioContext;
    analyser?: AnalyserNode;
    dataArray?: Uint8Array;
    micSource?: MediaStreamAudioSourceNode;
  }>({});
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearAlpha(0);
    mountRef.current.appendChild(renderer.domElement);

    // Setup scene and camera
    const scene = new THREE.Scene();
    if (showShadow) {
      const shadow = new THREE.Mesh(
        new THREE.CircleGeometry(circleSize * 1.2, 60),
        new THREE.MeshBasicMaterial({ color: '#222', opacity: 0.3, transparent: true })
      );
      shadow.position.z = -0.5;
      scene.add(shadow);
    }
    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      1000
    );
    camera.position.set(0, -2, 14);
    camera.lookAt(0, 0, 0);

    // Setup postprocessing
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height)
    );
    bloomPass.threshold = bloomThreshold;
    bloomPass.strength = bloomStrength;
    bloomPass.radius = bloomRadius;
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());

    // --- Add geometry, material, mesh, and uniforms ---
    const uniforms = {
      u_time: { value: 0.0 },
      u_frequency: { value: 0.0 },
      u_red: { value: gradientStart[0] },
      u_green: { value: gradientStart[1] },
      u_blue: { value: gradientStart[2] },
      u_red_end: { value: gradientEnd[0] },
      u_green_end: { value: gradientEnd[1] },
      u_blue_end: { value: gradientEnd[2] }
    };
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader: `
        uniform float u_red;
        uniform float u_blue;
        uniform float u_green;
        uniform float u_red_end;
        uniform float u_green_end;
        uniform float u_blue_end;
        uniform float u_frequency;
        void main() {
          float gradient = gl_FragCoord.y / 600.0;
          vec3 color = mix(vec3(u_red, u_green, u_blue), vec3(u_red_end, u_green_end, u_blue_end), gradient);
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      wireframe
    });
    // Adjust circleSize based on width/height (use min for scaling)
    const scale = Math.min(width, height) / 600; // 600 is a reference size
    const geo = new THREE.IcosahedronGeometry(circleSize * scale, meshDensity);
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);

    // --- Microphone audio setup only ---
    let audioContext: AudioContext, analyser: AnalyserNode, dataArray: Uint8Array;
    let animationActive = true;
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(function(stream) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const micSource = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        micSource.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        audioNodes.current = { audioContext, analyser, dataArray, micSource };
      })
      .catch(function(err) {
        alert('Microphone access denied: ' + err.message);
      });

    // --- Animation loop ---
    const clock = new THREE.Clock();
    function animate() {
      if (!animationActive) return;
      requestAnimationFrame(animate);
      uniforms.u_time.value = clock.getElapsedTime();
      if (audioNodes.current.analyser && audioNodes.current.dataArray) {
        audioNodes.current.analyser.getByteFrequencyData(audioNodes.current.dataArray);
        const avg = audioNodes.current.dataArray.reduce((a: number, b: number) => a + b, 0) / audioNodes.current.dataArray.length;
        uniforms.u_frequency.value = Math.max(avg, minFrequency);
      } else {
        uniforms.u_frequency.value = minFrequency;
      }
      composer.render();
    }
    animate();

    // --- Handle resize ---
    function handleResize() {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
    }
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      animationActive = false;
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      if (audioNodes.current.audioContext) audioNodes.current.audioContext.close();
    };
  }, [circleSize, width, height, gradientStart, gradientEnd, showShadow, wireframe, bloomStrength, bloomRadius, bloomThreshold, minFrequency, meshDensity]);

  const waitForIceGatheringComplete = async (pc: RTCPeerConnection, timeoutMs = 2000) => {
    if (pc.iceGatheringState === "complete") return;
    console.log("Waiting for ICE gathering to complete. Current state:", pc.iceGatheringState);
    return new Promise<void>((resolve) => {
      let timeoutId: NodeJS.Timeout;
      const checkState = () => {
        console.log("icegatheringstatechange:", pc.iceGatheringState);
        if (pc.iceGatheringState === "complete") {
          cleanup();
          resolve();
        }
      };
      const onTimeout = () => {
        console.warn(`ICE gathering timed out after ${timeoutMs} ms.`);
        cleanup();
        resolve();
      };
      const cleanup = () => {
        pc.removeEventListener("icegatheringstatechange", checkState);
        clearTimeout(timeoutId);
      };
      pc.addEventListener("icegatheringstatechange", checkState);
      timeoutId = setTimeout(onTimeout, timeoutMs);
      // Checking the state again to avoid any eventual race condition
      checkState();
    });
  };

  const addPeerConnectionEventListeners = (pc: RTCPeerConnection, onConnected: () => void, onDisconnected: () => void) => {
    pc.oniceconnectionstatechange = () => {
      console.log("oniceconnectionstatechange", pc?.iceConnectionState);
    };
    pc.onconnectionstatechange = () => {
      console.log("onconnectionstatechange", pc?.connectionState);
      const connectionState = pc?.connectionState;
      if (connectionState === "connected") {
        onConnected();
      } else if (connectionState === "disconnected") {
        onDisconnected();
      }
    };
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate:", event.candidate);
      } else {
        console.log("All ICE candidates have been sent.");
      }
    };
  };

  const connect = async () => {
    if (!auth_token) {
      console.error("Auth token is missing. Please wait for authentication to complete.");
      
      // Create or update status element to show the error
      let statusEl = document.getElementById("status");
      if (!statusEl) {
        statusEl = document.createElement("div");
        statusEl.id = "status";
        statusEl.style.position = "fixed";
        statusEl.style.top = "20px";
        statusEl.style.right = "20px";
        statusEl.style.backgroundColor = "#232323";
        statusEl.style.color = "#F4F3EE";
        statusEl.style.padding = "8px 16px";
        statusEl.style.borderRadius = "8px";
        statusEl.style.fontSize = "14px";
        statusEl.style.fontFamily = "Montserrat, sans-serif";
        statusEl.style.zIndex = "1000";
        document.body.appendChild(statusEl);
      }
      statusEl.textContent = "Authentication required - please wait...";
      
      // Auto-retry after a short delay
      setTimeout(() => {
        if (auth_token) {
          connect();
        }
      }, 1000);
      
      return;
    }

    setConnectionStatus('connecting');

    try {
      // Create status element if it doesn't exist
      let statusEl = document.getElementById("status");
      if (!statusEl) {
        statusEl = document.createElement("div");
        statusEl.id = "status";
        statusEl.style.position = "fixed";
        statusEl.style.top = "20px";
        statusEl.style.right = "20px";
        statusEl.style.backgroundColor = "#232323";
        statusEl.style.color = "#F4F3EE";
        statusEl.style.padding = "8px 16px";
        statusEl.style.borderRadius = "8px";
        statusEl.style.fontSize = "14px";
        statusEl.style.fontFamily = "Montserrat, sans-serif";
        statusEl.style.zIndex = "1000";
        statusEl.textContent = "Disconnected";
        document.body.appendChild(statusEl);
      }

      const audioEl = audioElRef.current!;
      // Ensure audio element is ready
      audioEl.muted = false;
      audioEl.volume = 1.0;

      // Update status to connecting
      statusEl.textContent = "Connecting...";

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const audioTrack = audioStream.getAudioTracks()[0];

      const config = {
        iceServers: [],
      };
      const pc = new RTCPeerConnection(config);

      // Set up event listeners
      addPeerConnectionEventListeners(
        pc,
        () => {
          statusEl!.textContent = "Connected - Conversation started";
          setConnectionStatus('connected');
        },
        () => {
          statusEl!.textContent = "Disconnected";
          setConnectionStatus('disconnected');
        }
      );

      pc.ontrack = async (e) => {
        console.log("ontrack event received", e);
        if (e.streams && e.streams[0]) {
          console.log("Setting audio srcObject to stream", e.streams[0]);
          audioEl.srcObject = e.streams[0];
          
          // Force unmute and set volume
          audioEl.muted = false;
          audioEl.volume = 1.0;
          
          // Wait for the audio to be ready
          await new Promise((resolve) => {
            const handler = () => {
              console.log("Audio canplay event fired");
              audioEl.removeEventListener('canplay', handler);
              resolve(void 0);
            };
            audioEl.addEventListener('canplay', handler);
            
            // Also resolve after a timeout to avoid hanging
            setTimeout(resolve, 2000);
          });
          
          // Ensure audio plays by handling autoplay restrictions
          try {
            console.log("Attempting to play audio...");
            await audioEl.play();
            console.log("Audio playback started successfully");
            statusEl!.textContent = "Connected - Conversation started";
          } catch (playError) {
            console.warn("Autoplay failed, user interaction may be required:", playError);
            // Show a user-friendly message that they need to click to enable audio
            if (statusEl) {
              statusEl.textContent = "Connected - Click anywhere to enable audio";
              statusEl.style.cursor = "pointer";
              statusEl.onclick = async () => {
                try {
                  await audioEl.play();
                  console.log("Audio playback started after user interaction");
                  statusEl.textContent = "Connected - Conversation started";
                  statusEl.style.cursor = "default";
                  statusEl.onclick = null;
                } catch (err) {
                  console.error("Failed to start audio playback:", err);
                  statusEl.textContent = "Audio failed - Please refresh";
                }
              };
            }
          }
        } else {
          console.error("No streams received");
        }
      };

      // SmallWebRTCTransport expects to receive both transceivers
      pc.addTransceiver(audioTrack, { direction: "sendrecv" });
      pc.addTransceiver("video", { direction: "sendrecv" });

      await pc.setLocalDescription(await pc.createOffer());
      await waitForIceGatheringComplete(pc);

      const offer = pc.localDescription;
      if (!offer) {
        throw new Error("Failed to create local description");
      }

      const response = await fetch(`http://0.0.0.0:7860/api/offer?token=${auth_token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdp: offer.sdp, type: offer.type }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch offer: ${response.statusText}`);
      }

      const answer = await response.json();
      if (!answer.type || !answer.sdp) {
        throw new Error("Invalid answer received from the server");
      }

      await pc.setRemoteDescription(new RTCSessionDescription(answer));

      console.log("WebRTC connection established successfully");

    } catch (error) {
      console.error("Error during connection", error);
      const statusEl = document.getElementById("status");
      if (statusEl) {
        statusEl.textContent = "Connection failed";
      }
      setConnectionStatus('disconnected');
    }
  };

  return (
    <>
      <div
        ref={mountRef}
        style={{ 
          width, 
          height, 
          cursor: 'pointer',
          borderRadius: '12px',
          transition: 'transform 0.2s ease-in-out',
        }}
        className="hover:scale-105"
        title="Click to start conversation with AI"
        onClick={connect}
        {...props}
      />
      <audio ref={audioElRef} id="audio-el" autoPlay playsInline hidden />
    </>
  );
};

export default Visualizer;

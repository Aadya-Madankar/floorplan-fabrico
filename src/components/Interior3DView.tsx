
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Interior3DViewProps {
  isLoading?: boolean;
}

export const Interior3DView = ({ isLoading }: Interior3DViewProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf5f5f5);

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 5;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add a simple room
    const roomGeometry = new THREE.BoxGeometry(4, 3, 4);
    const roomMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xcccccc,
      side: THREE.BackSide 
    });
    const room = new THREE.Mesh(roomGeometry, roomMaterial);
    scene.add(room);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (room) {
        room.rotation.y += 0.001;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
  }, []);

  return (
    <Card className="w-full h-[500px] relative">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-architectural-50">
          <div className="flex flex-col items-center gap-4 text-architectural-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Generating 3D interior...</p>
          </div>
        </div>
      ) : (
        <div ref={mountRef} className="w-full h-full" />
      )}
    </Card>
  );
};


import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Interior3DViewProps {
  isLoading?: boolean;
  imageUrl?: string;
}

export const Interior3DView = ({ isLoading, imageUrl }: Interior3DViewProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!mountRef.current || !imageUrl) return;

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
    camera.position.set(0, 5, 5);
    camera.lookAt(0, 0, 0);

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Load floor plan texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageUrl, (texture) => {
      // Create floor with floor plan texture
      const floorGeometry = new THREE.PlaneGeometry(10, 10);
      const floorMaterial = new THREE.MeshStandardMaterial({ 
        map: texture,
        side: THREE.DoubleSide
      });
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.rotation.x = -Math.PI / 2; // Rotate to be horizontal
      floor.position.y = -0.5;
      scene.add(floor);

      // Create walls
      const wallHeight = 3;
      const wallMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xcccccc,
        transparent: true,
        opacity: 0.5
      });

      // Create four walls
      const wallGeometry = new THREE.PlaneGeometry(10, wallHeight);
      
      const frontWall = new THREE.Mesh(wallGeometry, wallMaterial);
      frontWall.position.z = -5;
      frontWall.position.y = wallHeight/2 - 0.5;
      scene.add(frontWall);

      const backWall = new THREE.Mesh(wallGeometry, wallMaterial);
      backWall.position.z = 5;
      backWall.position.y = wallHeight/2 - 0.5;
      backWall.rotation.y = Math.PI;
      scene.add(backWall);

      const leftWall = new THREE.Mesh(wallGeometry, wallMaterial);
      leftWall.position.x = -5;
      leftWall.position.y = wallHeight/2 - 0.5;
      leftWall.rotation.y = Math.PI / 2;
      scene.add(leftWall);

      const rightWall = new THREE.Mesh(wallGeometry, wallMaterial);
      rightWall.position.x = 5;
      rightWall.position.y = wallHeight/2 - 0.5;
      rightWall.rotation.y = -Math.PI / 2;
      scene.add(rightWall);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
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

    // Add orbit controls through mouse events
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      const rotationSpeed = 0.005;
      camera.position.x = camera.position.x * Math.cos(deltaMove.x * rotationSpeed) - camera.position.z * Math.sin(deltaMove.x * rotationSpeed);
      camera.position.z = camera.position.x * Math.sin(deltaMove.x * rotationSpeed) + camera.position.z * Math.cos(deltaMove.x * rotationSpeed);
      
      camera.lookAt(0, 0, 0);
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      const zoomSpeed = 0.001;
      const minDistance = 2;
      const maxDistance = 15;
      
      const distance = Math.sqrt(
        camera.position.x * camera.position.x +
        camera.position.z * camera.position.z
      );
      
      if ((distance < maxDistance || e.deltaY > 0) && (distance > minDistance || e.deltaY < 0)) {
        camera.position.x *= (1 + e.deltaY * zoomSpeed);
        camera.position.z *= (1 + e.deltaY * zoomSpeed);
      }
    };

    mountRef.current.addEventListener('mousedown', handleMouseDown);
    mountRef.current.addEventListener('mousemove', handleMouseMove);
    mountRef.current.addEventListener('mouseup', handleMouseUp);
    mountRef.current.addEventListener('wheel', handleWheel);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeEventListener('mousedown', handleMouseDown);
      mountRef.current?.removeEventListener('mousemove', handleMouseMove);
      mountRef.current?.removeEventListener('mouseup', handleMouseUp);
      mountRef.current?.removeEventListener('wheel', handleWheel);
      mountRef.current?.removeChild(renderer.domElement);
      scene.clear();
    };
  }, [imageUrl]);

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


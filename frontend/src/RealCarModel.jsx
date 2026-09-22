import {Canvas} from '@react-three/fiber';
import {OrbitControls, Environment, useGLTF, Center} from '@react-three/drei';

export default function RealCarModel({src='/models/car.glb'}){
  return <div style={{height:'600px',background:'#080b0f'}}>
    <Canvas camera={{position:[5,2.5,5],fov:42}}>
      <ambientLight intensity={1.2}/>
      <directionalLight position={[5,8,5]} intensity={3}/>
      <Environment preset="city"/>
      <Car src={src}/>
      <OrbitControls enablePan={false} minDistance={2} maxDistance={12}/>
    </Canvas>
  </div>
}
function Car({src}){
  const {scene}=useGLTF(src);
  return <Center><primitive object={scene} scale={1.8}/></Center>
}

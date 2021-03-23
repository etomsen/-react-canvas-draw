import React, { useRef, useState } from 'react';
import './App.css';
import Canvas, { clearCanvas, getCanvasImage } from './Canvas';

function App() {

  const canvasRef = useRef<HTMLCanvasElement | undefined>(undefined);
  const [img, setImg] = useState<HTMLImageElement | undefined>(undefined);

  function uploadImg(e: any) {
    if (e.target.files && e.target.files[0]) {
      const img = new Image();
      img.src = URL.createObjectURL(e.target.files[0]);
      img.onload = () => {
        // FIXME: use this to check if photo fits
        // img.naturalHeight
        // img.naturalWidth
        setImg(img);
      }
    } else {
      setImg(undefined);
    }
  }

  async function exportData() {
    if (!canvasRef.current) {
      return;
    }
    try {
      const blob = await getCanvasImage(canvasRef.current);
      const a: HTMLAnchorElement = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'annotations.jpg';
      a.click();
    } catch (error) {
      alert(JSON.stringify(error));
    }
  }

  function clearData() {
    if (!canvasRef.current) {
      return;
    }
    clearCanvas(canvasRef.current);
  }

  
  return (
    <>
      <h1 className={'App-Header'}>Annotations Spike</h1>
      <Canvas width={600} height={600} background={img} ref={(node) => {canvasRef.current = node ? node : undefined;}}></Canvas>
      <input type="file" accept="image/*" capture onChange={uploadImg} />
      <button onClick={exportData}>Save image</button>
      <button onClick={clearData}>Clear image</button>
    </>
  );
}

export default App;

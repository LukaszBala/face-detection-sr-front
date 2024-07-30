import React, { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import axios from 'axios';
import styles from './App.module.scss';

interface Face {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

function App() {
  const [image, setImage] = useState<File | null>(null);
  const [faces, setFaces] = useState<Face[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [croppedFaces, setCroppedFaces] = useState<string[]>([]);
  const [scaledFaces, setScaledFaces] = useState<Face[]>([]);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!image) return;

    const formData = new FormData();
    formData.append('file', image);

    try {
      const response = await axios.post<Face[]>('/api/detect_faces/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFaces(response.data);
    } catch (error) {
      console.error('Error uploading the image', error);
    }
  };

  useEffect(() => {
    if (imageDimensions && faces.length && imageUrl) {
      const { width: imgWidth, height: imgHeight } = imageDimensions;
      const maxWidth = 500;
      const maxHeight = (imgHeight / imgWidth) * maxWidth;

      // Set up face rectangles
      const drawRectangles = () => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');
        const img = imageRef.current;

        if (canvas && context && img) {
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          context.drawImage(img, 0, 0);

          faces.forEach((face) => {
            // Draw rectangles on the canvas
            context.beginPath();
            context.rect(face.left, face.top, face.right - face.left, face.bottom - face.top);
            context.lineWidth = 2;
            context.strokeStyle = 'red';
            context.stroke();
          });
        }
      };

      // Crop faces from the original image
      const cropFaces = () => {
        const faceCanvas = faceCanvasRef.current;
        const faceContext = faceCanvas?.getContext('2d');
        const img = imageRef.current;

        if (faceCanvas && faceContext && img) {
          faceCanvas.width = img.naturalWidth;
          faceCanvas.height = img.naturalHeight;
          faceContext.drawImage(img, 0, 0);

          const croppedFacesUrls: string[] = [];
          const padding = 50;

          faces.forEach((face, index) => {
            const top = Math.max(0, face.top - padding);
            const right = Math.min(faceCanvas.width, face.right + padding);
            const bottom = Math.min(faceCanvas.height, face.bottom + padding);
            const left = Math.max(0, face.left - padding);

            const width = right - left;
            const height = bottom - top;

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempContext = tempCanvas.getContext('2d');

            tempContext?.drawImage(faceCanvas, left, top, width, height, 0, 0, width, height);

            const faceImageUrl = tempCanvas.toDataURL('image/jpeg');
            croppedFacesUrls.push(faceImageUrl);
          });

          setCroppedFaces(croppedFacesUrls);
        }
      };

      drawRectangles();
      cropFaces();
    }
  }, [imageDimensions, faces, imageUrl]);

  useEffect(() => {
    if (imageDimensions && faces.length) {
      const { width: imgWidth, height: imgHeight } = imageDimensions;
      const maxWidth = 500;
      const maxHeight = (imgHeight / imgWidth) * maxWidth;

      const scaleX = maxWidth / imgWidth;
      const scaleY = maxHeight / imgHeight;

      setScaledFaces(faces.map(face => ({
        top: face.top * scaleY,
        right: face.right * scaleX,
        bottom: face.bottom * scaleY,
        left: face.left * scaleX,
      })));
    }
  }, [imageDimensions, faces]);

  const handleFaceSelect = (index: number) => {
    setSelectedFaceIndex(index);
  };

  const handleProcessFace = async () => {
    if (selectedFaceIndex === null || !croppedFaces[selectedFaceIndex]) return;

    try {
      const response = await axios.post('/api/process_face/', {
        image: croppedFaces[selectedFaceIndex]
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Handle response and set processed image URL
      setProcessedImageUrl(response.data.processedImageUrl);
    } catch (error) {
      console.error('Error processing the face image', error);
    }
  };

  return (
      <div className={styles.App}>
        <h1>Face Detection</h1>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleImageChange} />
          <button type="submit">Upload</button>
        </form>
        {imageUrl && (
            <div>
              <h2>Uploaded Image</h2>
              <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Uploaded"
                  style={{ maxWidth: '500px', height: 'auto' }}
                  onLoad={() => {
                    if (imageRef.current) {
                      setImageDimensions({
                        width: imageRef.current.naturalWidth,
                        height: imageRef.current.naturalHeight,
                      });
                    }
                  }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <canvas ref={faceCanvasRef} style={{ display: 'none' }} />
            </div>
        )}
        {imageUrl && scaledFaces.length > 0 && (
            <div>
              <h2>Detected Faces</h2>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                    src={imageUrl}
                    alt="Detected Faces"
                    style={{ maxWidth: '500px', height: 'auto' }}
                />
                {scaledFaces.map((face, index) => (
                    <div
                        key={index}
                        style={{
                          position: 'absolute',
                          border: '2px solid red',
                          top: face.top,
                          left: face.left,
                          width: face.right - face.left,
                          height: face.bottom - face.top,
                        }}
                    ></div>
                ))}
              </div>
            </div>
        )}
        {croppedFaces.length > 0 && (
            <div>
              <h2>Detected Faces</h2>
              <div className={styles.croppedContainer}>
                {croppedFaces.map((faceUrl, index) => (
                    <div key={index} style={{ margin: '10px', display: 'inline-block', outline: index === selectedFaceIndex ? '2px solid blue' : 'none' }}>
                      <img
                          src={faceUrl}
                          alt={`Face ${index + 1}`}
                          style={{ maxWidth: '200px', cursor: 'pointer' }}
                          onClick={() => handleFaceSelect(index)}
                      />
                    </div>
                ))}
              </div>
              {selectedFaceIndex !== null && (
                  <div>
                    <button onClick={handleProcessFace}>Process Selected Face</button>
                    {processedImageUrl && (
                        <div>
                          <h2>Processed Face Image</h2>
                          <img
                              src={processedImageUrl}
                              alt="Processed Face"
                              style={{ maxWidth: '200px' }}
                          />
                        </div>
                    )}
                  </div>
              )}
            </div>
        )}
      </div>
  );
}

export default App;

import React, { useRef, useEffect } from 'react';
import { Face } from '../types';

interface FaceCanvasProps {
    imageRef: React.RefObject<HTMLImageElement>;
    faces: Face[];
}

const FaceCanvas: React.FC<FaceCanvasProps> = ({ imageRef, faces }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {

        if (imageRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            const img = imageRef.current;

            if (context && img) {
                // Set canvas dimensions to match the image
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;

                // Draw the image on the canvas
                context.drawImage(img, 0, 0);

                // Draw the faces as rectangles
                context.strokeStyle = 'red';
                context.lineWidth = 4;
                faces.forEach((face) => {
                    context.beginPath();
                    context.rect(face.left, face.top, face.right - face.left, face.bottom - face.top);
                    context.stroke();
                });
            }
        }
    }, [imageRef, faces]);

    return (
        <canvas ref={canvasRef} style={{ maxWidth: '500px', width: '100%', height: 'auto' }} />
    );
};

export default FaceCanvas;

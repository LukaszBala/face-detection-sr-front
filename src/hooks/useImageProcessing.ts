import { useState, useEffect } from 'react';
import { Face } from '../types';

interface UseImageProcessingProps {
    image: File | null;
    imageRef: React.RefObject<HTMLImageElement>;
    imageDimensions: { width: number; height: number } | null;
    setCroppedFaces: React.Dispatch<React.SetStateAction<string[]>>;
    padding?: number; // Optional padding parameter
}

const useImageProcessing = ({
                                image,
                                imageRef,
                                imageDimensions,
                                setCroppedFaces,
                                padding
                            }: UseImageProcessingProps) => {
    const [faces, setFaces] = useState<Face[]>([]);

    useEffect(() => {
        if (imageDimensions && faces.length && imageRef.current) {
            const drawRectangles = () => {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                const img = imageRef.current;

                if (canvas && context && img) {
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    context.drawImage(img, 0, 0);

                    faces.forEach((face) => {
                        context.beginPath();
                        context.rect(face.left, face.top, face.right - face.left, face.bottom - face.top);
                        context.lineWidth = 2;
                        context.strokeStyle = 'red';
                        context.stroke();
                    });
                }
            };

            const cropFaces = () => {
                const faceCanvas = document.createElement('canvas');
                const faceContext = faceCanvas.getContext('2d');
                const img = imageRef.current;

                if (faceCanvas && faceContext && img) {
                    faceCanvas.width = img.naturalWidth;
                    faceCanvas.height = img.naturalHeight;
                    faceContext.drawImage(img, 0, 0);

                    const croppedFacesUrls: string[] = [];
                    const usePadding = padding !== undefined ? padding : 0; // Use provided padding or default to 0

                    faces.forEach((face) => {
                        // Calculate padding based on detected face size or use provided padding
                        const paddingX = usePadding === 0 ? (face.right - face.left) : usePadding;
                        const paddingY = usePadding === 0 ? (face.bottom - face.top) : usePadding;

                        const top = Math.max(0, face.top - paddingY);
                        const right = Math.min(faceCanvas.width, face.right + paddingX);
                        const bottom = Math.min(faceCanvas.height, face.bottom + paddingY);
                        const left = Math.max(0, face.left - paddingX);

                        const width = right - left;
                        const height = bottom - top;

                        const tempCanvas = document.createElement('canvas');
                        tempCanvas.width = width;
                        tempCanvas.height = height;
                        const tempContext = tempCanvas.getContext('2d');

                        if (width === 0 || height === 0) {
                            return;
                        }

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
    }, [imageDimensions, faces, imageRef, setCroppedFaces, padding]);

    return { faces, setFaces };
};

export default useImageProcessing;

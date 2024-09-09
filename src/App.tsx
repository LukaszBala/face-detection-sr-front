import React, {useState, ChangeEvent, FormEvent, useRef, useEffect, useCallback} from 'react';
import axios from 'axios';
import {Face} from './types';
import FaceCanvas from './components/FaceCanvas';
import FaceSelector from './components/FaceSelector';
import ProcessedFace from './components/ProcessedFace';
import styles from './App.module.scss';
import useImageProcessing from "./hooks/useImageProcessing";
import ImageComparer from "./components/ImageComparer";
import {ProgressBar} from "react-loader-spinner";
import TestAllMethods from "./components/TestAllMethods";

function App() {
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [croppedFaces, setCroppedFaces] = useState<string[]>([]);
    const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);
    const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<string>('gfpgan'); // Default method
    const [detectFacesLoading, setDetectFacesLoading] = useState(false);
    const [processingFace, setProcessingFace] = useState(false);

    const imageRef = useRef<HTMLImageElement>(null);

    const {faces, setFaces} = useImageProcessing({
        image,
        imageRef,
        imageDimensions,
        setCroppedFaces
    });

    const handleSubmit = useCallback(async () => {
        if (!image) return;

        const formData = new FormData();
        formData.append('file', image);

        setDetectFacesLoading(true);

        try {
            const response = await axios.post<Face[]>('/api/detect_faces/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setFaces(response.data);
        } catch (error) {
            console.error('Error uploading the image', error);
        } finally {
            setDetectFacesLoading(false);
        }
    }, [image, setFaces]); // Dependency array includes image

    const handleImageChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setImage(file);
                const url = URL.createObjectURL(file);
                setImageUrl(url);

                // Reset the states when a new image is uploaded
                setFaces([]);
                setSelectedFaceIndex(null);
                setProcessedImageUrl(null);

                // Call handleSubmit to detect faces

                return () => URL.revokeObjectURL(url); // Clean up URL object
            }
        },
        [handleSubmit, setFaces] // Dependency array includes handleSubmit
    );

    useEffect(() => {
        if (imageRef.current) {
            setImageDimensions({
                width: imageRef.current.naturalWidth,
                height: imageRef.current.naturalHeight,
            });

            handleSubmit()
        }
    }, [imageUrl, handleSubmit]);

    const handleProcessFace = async () => {
        if (selectedFaceIndex === null || !croppedFaces[selectedFaceIndex]) return;

        setProcessingFace(true);

        try {
            const response = await fetch(croppedFaces[selectedFaceIndex]);
            const blob = await response.blob();

            const formData = new FormData();
            formData.append('file', blob, `face_${selectedFaceIndex + 1}.jpg`);
            formData.append('scale', '4.0');
            formData.append('method', selectedMethod);

            const res = await axios.post('/api/process_face/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                responseType: 'blob',
            });

            const processedImageUrl = URL.createObjectURL(res.data);
            setProcessedImageUrl(processedImageUrl);
            setProcessingFace(false);
        } catch (error) {
            console.error('Error processing the face image', error);
            setProcessingFace(false);
        }
    };

    const handleDownload = useCallback(async () => {
        if (!processedImageUrl) {
            return;
        }

        try {
            const response = await fetch(processedImageUrl);
            const blob = await response.blob();

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download
                = 'image.jpg'; // Replace 'image.jpg' with your desired filename
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    }, [processedImageUrl]);

    return (
        <div className={styles.container}>
            <header className={styles.topbar}>
                <h1 className={styles.title}>Face Enhancer App</h1>
            </header>
            <div className={styles.mainContent}>
                <div className={styles.controlsContainer}>
                    {imageUrl && (
                        <div className={styles.imageWrapper}>
                            <img
                                ref={imageRef}
                                src={imageUrl}
                                alt="Uploaded"
                                style={{maxWidth: '500px', height: 'auto'}}
                            />
                        </div>
                    )}

                    <div className={styles.buttonWrapper}>
                        {detectFacesLoading && <div className={styles.loaderOverlay}>
                            <ProgressBar
                                visible={true}
                                height="80"
                                width="80"
                                ariaLabel="progress-bar-loading"
                                wrapperStyle={{}}
                            />
                        </div>}

                        <button className={styles.uploadButton}
                                onClick={() => document.getElementById('fileInput')?.click()}>
                            Upload Image
                        </button>
                        <input
                            type="file"
                            id="fileInput"
                            style={{display: 'none'}}
                            onChange={handleImageChange}
                        />
                        <p>Selected file: {image ? image.name : 'No file selected'}</p>

                        {/*<button className={styles.uploadButton} type="button" onClick={handleSubmit} disabled={!image}>*/}
                        {/*    Upload*/}
                        {/*</button>*/}
                    </div>
                </div>

                {faces.length > 0 && <div className={styles.resultsContainer}>
                    <div className={styles.resultsControlsWrapper}>
                        <div className={styles.imageWrapper}>
                            <FaceCanvas imageRef={imageRef} faces={faces}/>
                        </div>

                        {/*{selectedFaceIndex !== null && (*/}
                        {/*    <ProcessedFace*/}
                        {/*        croppedFaces={croppedFaces}*/}
                        {/*        selectedFaceIndex={selectedFaceIndex}*/}
                        {/*        handleProcessFace={handleProcessFace}*/}
                        {/*        processedImageUrl={processedImageUrl}*/}
                        {/*    />*/}
                        {/*)}*/}
                    </div>

                    <div className={styles.facesGridContainer}>
                        <h2>Detected Faces</h2>

                        <div className={styles.facesGrid}>
                            {imageUrl && faces.length > 0 && (
                                <FaceSelector
                                    selectedFaceIndex={selectedFaceIndex}
                                    setSelectedFaceIndex={setSelectedFaceIndex}
                                    croppedFaces={croppedFaces}
                                />
                            )}
                        </div>
                    </div>
                </div>
                }

                {selectedFaceIndex !== null && <div className={styles.upscalerContent}>

                    <ImageComparer image1={croppedFaces[selectedFaceIndex]} image2={processedImageUrl}
                                   loading={processingFace}></ImageComparer>

                    <div className={styles.methodSelection}>
                        <h3>Select Upscale Method:</h3>
                        <label>
                            <input
                                type="radio"
                                value="bicubic"
                                checked={selectedMethod === 'bicubic'}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                            />
                            Bicubic
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="fsrcnn"
                                checked={selectedMethod === 'fsrcnn'}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                            />
                            FSRCNN
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="edsr"
                                checked={selectedMethod === 'edsr'}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                            />
                            EDSR
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="real-esrgan"
                                checked={selectedMethod === 'real-esrgan'}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                            />
                            Real-ESRGAN
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="gfpgan"
                                checked={selectedMethod === 'gfpgan'}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                            />
                            GFPGAN
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="trained_model"
                                checked={selectedMethod === 'trained_model'}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                            />
                            Trained Model
                        </label>
                    </div>

                    <div className={styles.btnPanel}>
                        <button className={styles.uploadButton} onClick={handleProcessFace}
                                disabled={processingFace}>Process Selected Face
                        </button>

                        <button className={`${styles.uploadButton} ${styles.download}`} onClick={handleDownload}
                                disabled={!processedImageUrl || processingFace}>Download
                        </button>
                    </div>

                    <TestAllMethods croppedFaceUrl={croppedFaces[selectedFaceIndex]} selectedFaceIndex={selectedFaceIndex} />



                </div>
                }
            </div>


            {/* This canvas will contain the image with face borders */}
        </div>
    );
}

export default App;

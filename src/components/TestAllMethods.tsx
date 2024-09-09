import React, { useState } from 'react';
import axios from 'axios';
import styles from './test-all.module.scss'
import {ProgressBar} from "react-loader-spinner";

const upscaleMethods = ['bicubic', 'fsrcnn', 'edsr', 'real-esrgan', 'gfpgan', 'trained_model'];

const TestAllMethods = ({ croppedFaceUrl, selectedFaceIndex }: { croppedFaceUrl: string, selectedFaceIndex: number }) => {
    const [processedImages, setProcessedImages] = useState<{ method: string, url: string }[]>([]);
    const [loading, setLoading] = useState(false);

    const handleTestAllMethods = async () => {
        setLoading(true);
        const newProcessedImages = [];

        for (let method of upscaleMethods) {
            try {
                const response = await fetch(croppedFaceUrl);
                const blob = await response.blob();

                const formData = new FormData();
                formData.append('file', blob, `face_${selectedFaceIndex + 1}.jpg`);
                formData.append('scale', '4.0');
                formData.append('method', method);

                const res = await axios.post('/api/process_face/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    responseType: 'blob',
                });

                const processedImageUrl = URL.createObjectURL(res.data);
                newProcessedImages.push({ method, url: processedImageUrl });

            } catch (error) {
                console.error(`Error processing the face image with method ${method}`, error);
            }
        }

        setProcessedImages(newProcessedImages);
        setLoading(false);
    };

    return (
        <div className={styles.wrapper}>
            <button className={`${styles.uploadButton} ${styles.testBtn}`} onClick={handleTestAllMethods} disabled={loading}>
                {loading ? 'Processing...' : 'Test All Methods'}
            </button>

            {loading && <div className={styles.loaderOverlay}>
                <ProgressBar
                    visible={true}
                    height="80"
                    width="80"
                    ariaLabel="progress-bar-loading"
                    wrapperStyle={{}}
                />
            </div>}
            <div className={styles.imagesWrapper}>
                {processedImages.map(({ method, url }) => (
                    <div key={method} style={{ marginRight: '10px', textAlign: 'center' }}>
                        <img src={url} alt={`Processed with ${method}`} style={{ maxWidth: '200px' }} />
                        <p>{method}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TestAllMethods;

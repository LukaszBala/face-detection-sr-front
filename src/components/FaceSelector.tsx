import React from 'react';
import styles from './face-selector.module.scss';

interface FaceSelectorProps {
    setSelectedFaceIndex: (index: number) => void;
    croppedFaces: string[];
    selectedFaceIndex: number | null
}

const FaceSelector: React.FC<FaceSelectorProps> = ({setSelectedFaceIndex, croppedFaces, selectedFaceIndex}) => {


    return (
        <div>
            {croppedFaces.length > 0 && (
                <div className={styles.croppedContainer}>
                    {croppedFaces.map((faceUrl, index) => (
                        <div key={index} style={{
                            margin: '10px',
                            display: 'inline-block',
                            outline: index === selectedFaceIndex ? '2px solid blue' : 'none'
                        }}>
                            <img
                                src={faceUrl}
                                alt={`Face ${index + 1}`}
                                style={{maxWidth: '200px', cursor: 'pointer'}}
                                onClick={() => setSelectedFaceIndex(index)}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
};

export default FaceSelector;

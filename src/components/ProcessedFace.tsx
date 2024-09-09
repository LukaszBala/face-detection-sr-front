import React from 'react';

interface ProcessedFaceProps {
    croppedFaces: string[];
    selectedFaceIndex: number | null;
    handleProcessFace: () => void;
    processedImageUrl: string | null;
}

const ProcessedFace: React.FC<ProcessedFaceProps> = ({ croppedFaces, selectedFaceIndex, handleProcessFace, processedImageUrl }) => (
    <div>
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
);

export default ProcessedFace;

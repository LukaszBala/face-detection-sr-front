import axios from 'axios';
import { Face } from '../types';

export const detectFaces = async (image: File): Promise<Face[]> => {
    const formData = new FormData();
    formData.append('file', image);

    const response = await axios.post<Face[]>('/api/detect_faces/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};

export const processFaceImage = async (faceImageUrl: string): Promise<string> => {
    const response = await fetch(faceImageUrl);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('file', blob, `face_${Date.now()}.jpg`);
    formData.append('scale', '4.0');
    formData.append('method', 'gfpgan');

    const res = await axios.post('/api/process_face/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        responseType: 'blob',
    });

    return URL.createObjectURL(res.data);
};

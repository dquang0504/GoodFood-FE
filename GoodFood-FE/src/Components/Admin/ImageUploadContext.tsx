import React, { createContext, useContext, useState, ReactNode } from 'react';

// Định nghĩa kiểu dữ liệu cho context
interface ImageUploadContextType {
    resetPreview: boolean;
    resetImagePreview: () => void;
    clearResetPreview: () => void;
}

// Tạo context với giá trị mặc định
const ImageUploadContext = createContext<ImageUploadContextType | undefined>(undefined);

// Hook tùy chỉnh để sử dụng context
export const useImageUploadContext = () => {
    const context = useContext(ImageUploadContext);
    if (!context) {
        throw new Error("useImageUploadContext must be used within an ImageUploadProvider");
    }
    return context;
};

// Định nghĩa kiểu props cho Provider
interface ImageUploadProviderProps {
    children: ReactNode;
}

// Provider Component
export const ImageUploadProvider: React.FC<ImageUploadProviderProps> = ({ children }) => {
    const [resetPreview, setResetPreview] = useState(false);

    const resetImagePreview = () => setResetPreview(true);
    const clearResetPreview = () => setResetPreview(false);

    return (
        <ImageUploadContext.Provider value={{ resetPreview, resetImagePreview, clearResetPreview }}>
            {children}
        </ImageUploadContext.Provider>
    );
};

export default ImageUploadContext;

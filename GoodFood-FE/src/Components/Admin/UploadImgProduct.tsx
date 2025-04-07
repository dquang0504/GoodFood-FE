import React, { useCallback, useEffect, useState } from 'react';
import { useImageUploadContext } from './ImageUploadContext';
import {useDropzone} from "react-dropzone"

interface UploadImgProductProps{
    className?: string;
    inputClass: string;
    onFileSelect: (files: File[])=> void
    reset: boolean
}
const UploadImgProduct: React.FC<UploadImgProductProps> = ({className, inputClass, onFileSelect, reset}) => {

    const [files,setFiles] = useState<{file: File;preview: string}[]>([]);

    const onDrop = useCallback((acceptedFiles: File[])=>{
        if(acceptedFiles.length){
            //display image preview
            const previewFiles = acceptedFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setFiles(previewFiles);

            //use callback to pass files to parent component
            onFileSelect(acceptedFiles);
        }
    },[onFileSelect]);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        accept: {"image/*": []},
        maxFiles: 5, //5 pictures can be uploaded at a time
    });

    //function to remove images from preview list
    const handleRemoveImage = (fileName: string) => {
        const newFiles = files.filter(({file}) => file.name !== fileName);
        setFiles(newFiles)
        //only pass in file and not preview
        onFileSelect(newFiles.map(({file})=> file));
    }

    //reset preview when resetPreview changes
    useEffect(()=>{
        if(reset){
            setFiles([]);
        }
    },[reset])

    return (
        <div className={className}>
            <div
                {...getRootProps({ className: "dropzone" })}
                style={{
                border: "2px dashed #067a38",
                borderRadius: "4px",
                padding: "20px",
                textAlign: "center",
                cursor: "pointer",
                }}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                <p className={inputClass}>Thả ảnh ở đây ...</p>
                ) : (
                <p className={inputClass}>Kéo thả hoặc click vào để chọn ảnh</p>
                )}
            </div>

            {files.length > 0 && (
                <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginTop: "20px",
                }}
                >
                {files.map((file) => (
                    <div
                    key={file.file.name}
                    style={{
                        position: "relative",
                        width: "100px",
                        height: "100px",
                        margin: "5px",
                        borderRadius: "4px",
                        overflow: "hidden",
                        border: "2px solid #067a38",
                    }}
                    >
                    <img
                        src={file.preview}
                        alt=""
                        style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        }}
                        onLoad={() => URL.revokeObjectURL(file.preview)}
                    />
                    {/* Button X để xóa ảnh */}
                    <button
                        style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: 'rgba(255, 99, 71, 0.8)',  // Đỏ nhạt
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        fontSize: '16px',  // Tăng kích thước chữ một chút
                        fontWeight: 'bold',
                        textAlign: 'center', // Căn giữa ký tự trong nút
                        paddingBottom: '3px',  // Bỏ padding để tránh bị lệch
                        transition: 'background-color 0.3s ease',
                        }}
                        onMouseOver={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 99, 71, 0.6)';  // Đổi màu khi hover
                        }}
                        onMouseOut={(e) => {
                        (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 99, 71, 0.8)';  // Trở về màu gốc khi không hover
                        }}
                        onClick={() => handleRemoveImage(file.file.name)}
                    >
                        &times;  {/* Dấu "×" */}
                    </button>

                    </div>
                ))}
                </div>
            )}
        </div>
    );
};

export default UploadImgProduct;
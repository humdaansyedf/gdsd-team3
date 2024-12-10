import './imageUploader.css';
import React, { useState, useRef } from 'react';
import { Button } from "@mantine/core";
import { useDropzone } from 'react-dropzone';
import { usePublicFileUpload } from './fileUpload'; // Import the mutation

export function DragDropImageUploader() {
    const [images, setImages] = useState([]); // Store uploaded image URLs
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Use the mutation for uploading files
    const fileUploadMutation = usePublicFileUpload();

    function selectFiles(){
        fileInputRef.current.click();
    }

    function onFileSelect(event) {
        const files = Array.from(event.target.files);
        uploadFiles(files);
      }      

    function deleteImage(index) {
        setImages((prevImages) =>
            prevImages.filter((_, i) => i !== index)
        );
    }

    function onDragOver(event){
        event.preventDefault();
        setIsDragging(true);
        event.dataTransfer.dropEffect = 'copy';
    }

    function onDrop(event) {
        event.preventDefault();
        setIsDragging(false);
        const files = Array.from(event.dataTransfer.files);
        uploadFiles(files);
    }

    function onDragLeave(event){
        event.preventDefault();
        setIsDragging(false);
    }

    function uploadFiles(files) {
        files.forEach((file) => {
          if (file.type.split('/')[0] === 'image') {
            fileUploadMutation.mutate(
              { file },
              {
                onSuccess: (uploadedUrl) => {
                  // Add uploaded file URL to the state
                  setImages((prevImages) => [
                    ...prevImages,
                    { name: file.name, url: uploadedUrl },
                  ]);
                },
                onError: () => {
                  console.error(`Failed to upload ${file.name}`);
                },
              }
            );
          }
        });
    }

    return (
        <div className="card">
            <div className='drag-area' onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                {isDragging ? (
                    <span className='select'>Drop images here</span>
                ) : (
                    <>
                    Drag & Drop images here or {" "}
                    <span className="select" role='button' onClick={selectFiles}>
                    "Browse"
                    </span>
                    </>
                )}

                <input name='file' type='file' className='file' multiple ref={fileInputRef} onChange={onFileSelect}></input>
            </div>
            <div className="container">
                {images.map((image, index) => (
                    <div className='image' key={index}>
                        <span className='delete' onClick={()=> deleteImage(index)}>&times;</span>
                        <img src={images.url} alt={image.name} />
                    </div>
                ))}
            </div>
            <div>
                <Button type='button' onClick={() => console.log('Uploaded Images:', images)}>
                    Upload
                </Button>
            </div>
        </div>
    )
}

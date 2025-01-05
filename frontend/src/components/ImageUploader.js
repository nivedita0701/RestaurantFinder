import React from 'react';
import { useDropzone } from 'react-dropzone';

const ImageUploader = ({ onUpload }) => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => {
      onUpload(acceptedFiles);
    },
  });

  return (
    <div {...getRootProps()} style={{ border: '2px dashed gray', padding: '20px', textAlign: 'center' }}>
      <input {...getInputProps()} />
      <p>Drag 'n' drop images here, or click to select files</p>
    </div>
  );
};

export default ImageUploader;

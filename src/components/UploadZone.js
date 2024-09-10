import React from 'react';
import { useDropzone } from 'react-dropzone';
import styles from '../styles/UploadZone.module.css'; // Import CSS module

const UploadZone = ({ onDrop, accept }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept });

  return (
    <div {...getRootProps()} className={styles.dropzone}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some files here, or click to select files</p>
      }
    </div>
  );
};

export default UploadZone;

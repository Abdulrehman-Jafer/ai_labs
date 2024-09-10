import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function Dropzone(props) {
  const onAudioDropped = props.onAudioDropped;
  const onDrop = useCallback(
    (acceptedFiles) => {
      onAudioDropped(acceptedFiles[0]);
    },
    [onAudioDropped]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'audio/*,video/*' });

  if (props.predictions?.output) return null;

  if (props.userUploadedAudio) return null;

  return (
    <div
      className="absolute z-50 flex w-full h-full text-gray-500 text-sm text-center cursor-pointer select-none w-full h-full"
      {...getRootProps()}
    >
      <div className="m-auto">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the audio or video file here ...</p>
        ) : (
          <p>Optional: Drag and drop a starting audio or video file here</p>
        )}
      </div>
    </div>
  );
}

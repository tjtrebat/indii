import React from "react";

export const Video = ({ url, ...props }) => {
  return (
    <video {...props}>
      <source src={url} type="video/mp4" />
      Your browser does not support the video tag.
  </video>
  );
}
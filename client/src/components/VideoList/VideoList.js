import React from "react";
import { Link } from "react-router-dom";
import "./VideoList.css";

export const VideoList = props => {
  const { videos } = props; 
  return (
    <div>
      {videos ? (
        <ul className="video-list">
          {videos.map(video => (
            <li key={video._id}>
              <Link to={`/videos/${video._id}`}>{video.title}</Link> 
              {video.user.username ? (
                <span> by <Link to={`/users/${video.user.username}`}>{video.user.username}</Link></span>
              ) : ""}
              <br />
              <span className="uploaded">Uploaded: {video.createdAt}</span>
            </li>
          ))}
        </ul>
      ) : "No video(s) to be shown."}
    </div>
  );
}
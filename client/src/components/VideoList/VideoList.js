import React from "react";
import { Link } from "react-router-dom";

export const VideoList = props => {
  const { videos } = props; 
  return (
    <div>
      {videos ? (
        <ul>
          {videos.map(video => (
            <li key={video._id}>
              <Link to={`/videos/${video._id}`}>{video.title}</Link> 
              {video.user.username ? (
                <span> by <Link to={`/users/${video.user.username}`}>{video.user.username}</Link></span>
              ) : ""}
              <br />
              Uploaded: {video.createdAt}
            </li>
          ))}
        </ul>
      ) : "No video(s) to be shown."}
    </div>
  );
}
import React from "react";
import { Link } from "react-router-dom";
import "./VideoList.css";

export const VideoList = props => {
  const { user, videos } = props;
  return (
    <div>
      {videos.length > 0 ? (
        <ul className="video-list">
          {videos.map(video => (
            <li key={video._id}>
              <div className="video-info">
                <Link to={`/videos/${video._id}`} className="video-title">{video.title}</Link>
                {(video.user && video.user.username) ? (
                  <span> by <Link to={`/users/${video.user.username}`}>{video.user.username}</Link></span>
                ) : ""}
                {video.description ? (
                  <p className="video-description">{video.description}</p>
                ) : ""}
                <span className="uploaded">Uploaded: {video.createdAt}</span>
              </div>
              {user ? (
                <button type="button" className="btn-delete"
                  onClick={() => props.handleClick(video._id)}>Delete</button>
              ) : ""}
            </li>
          ))}
        </ul>
      ) : "No video(s) to be shown."}
    </div>
  );
}
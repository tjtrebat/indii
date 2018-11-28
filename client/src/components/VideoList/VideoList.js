import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./VideoList.css";

class VideoList extends Component {
  handleClick(id) {
    console.log("I'm clicked: " + id);
  }
  render() {
    const { user, videos } = this.props;
    return (
      <div>
        {videos.length > 0 ? (
          <ul className="video-list">
            {videos.map(video => (
              <li key={video._id}>
                <Link to={`/videos/${video._id}`} className="video-title">{video.title}</Link>
                {video.user.username ? (
                  <span> by <Link to={`/users/${video.user.username}`}>{video.user.username}</Link></span>
                ) : ""}
                {video.description ? (
                  <p className="video-description">{video.description}</p>
                ) : ""}
                <span className="uploaded">Uploaded: {video.createdAt}</span>
                {user ? (
                  <button type="button" onClick={() => this.handleClick(video._id)}>Delete</button>
                ) : ""}
              </li>
            ))}
          </ul>
        ) : "No video(s) to be shown."}
      </div>
    );
  }
}

export default VideoList;

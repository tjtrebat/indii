import React, { Component } from "react";
import { Video } from "../../components/Video";
import API from "../../utils/API";

class UserProfile extends Component {
  state = {
    videos: []
  }
  componentDidMount() {
    API.getVideos(this.props.match.params.username).then(res => {
      this.setState({
        videos: res.data.videos
      });
    });
  }
  render() {
    const { videos } = this.state;
    return (
      <div>
        <p>Hello {this.props.match.params.username}!</p>
        {videos ? (
          <ul>
            {videos.map(video => (
              <li key={video._id}>
                <span>{`Title: ${video.title}, Uploaded: ${video.createdAt}`}</span><br />
                <Video url={video.url} width="320" height="240" controls />
              </li>
            ))}
          </ul>
        ) : ""}
      </div>
    );
  }
}

export default UserProfile;
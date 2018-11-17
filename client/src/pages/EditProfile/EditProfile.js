import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Video } from "../../components/Video";

class EditProfile extends Component {
  state = {
    videos: this.props.user ? this.props.user.videos : [],
    redirect: false
  }
  componentDidMount() {
    this.props.getUserStatus().then(res => {
      this.setState({
        videos: res.data.videos
      });
    }).catch(() => {
      this.setState({
        redirect: true
      });
    });
  }
  componentWillReceiveProps(newProps) {
    if (!newProps.user) {
      this.setState({
        redirect: true
      });
    }
  }
  render() {
    const { videos, redirect } = this.state;
    if (redirect) {
      return <Redirect to="/" />;
    }
    return (
      <div>
        <h3>Profile</h3>
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

export default EditProfile;

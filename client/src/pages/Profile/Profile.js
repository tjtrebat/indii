import React, { Component } from "react";
import API from "../../utils/API";

class Profile extends Component {
  state = {
    selectedFile: "",
    fileName: "",
    videoUrl: ""
  }
  handleInputChange = event => {
    this.setState({
      selectedFile: event.target.files[0]
    })
  }
  handleFileUpload = event => {
    event.preventDefault();
    const data = new FormData();
    data.append("file", this.state.selectedFile);
    API.upload(data).then(res => {
      this.setState({
        videoUrl: res.data.url
      });
    }).catch(err => console.log(err));
  }
  render() {
    const { videoUrl } = this.state;
    return (
      <div>
        <h3>Profile</h3>
        <form>
          <input type="file" name="uploadFile"
            onChange={this.handleInputChange} />
          <button type="submit"
            onClick={this.handleFileUpload}>Upload</button>
        </form>
        {videoUrl ? (
          <video width="320" height="240" controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : ""}
      </div>
    );
  }
}

export default Profile;
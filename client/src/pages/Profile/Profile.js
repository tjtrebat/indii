import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import { Video } from "../../components/Video";
import API from "../../utils/API";

class Profile extends Component {
  state = {
    title: "",
    selectedFile: "",
    videos: this.props.user ? this.props.user.videos : [],
    errorMsg: "",
    redirect: false
  }
  componentDidMount() {
    this.props.getUserStatus().then(res => {
      this.setState({
        videos: res.data.videos
      });
    }).catch(err => {
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
  handleInputChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    });
  }
  handleFileChange = event => {
    this.setState({
      selectedFile: event.target.files[0]
    });
  }
  handleFileUpload = event => {
    event.preventDefault();
    const { title, selectedFile } = this.state;
    if (this.isFormValid()) {
      const data = new FormData();
      data.append("file", selectedFile);
      data.append("title", title);
      API.upload(data).then(res => {
        console.log(res.data);
        this.setState({
          title: "",
          selectedFile: "",
          videos: res.data,
          errorMsg: ""
        });
      }).catch(err => {
        console.log(err);
        this.setState({
          errorMsg: "File upload error."
        });
      });
    }
  }
  isFormValid() {
    let { title, selectedFile } = this.state;
    title = title.trim();
    let errorMsg;
    if (!title) {
      errorMsg = "Title can not be empty.";
    } else if (!selectedFile.name.endsWith(".mp4")) {
      errorMsg = "Invalid file format.";
    } else {
      return true;
    }
    this.setState({ errorMsg });
  }
  render() {
    const { title, videos, errorMsg, redirect } = this.state;
    if (redirect) {
      return <Redirect to="/" />;
    }
    return (
      <div>
        <h3>Profile</h3>
        {errorMsg ? <span className="error">{errorMsg}</span> : ""}
        <form>
          <input type="text" name="title" value={title}
            onChange={this.handleInputChange} placeholder="Title" /><br />
          <input type="file" name="uploadFile"
            onChange={this.handleFileChange} />
          <button type="submit"
            onClick={this.handleFileUpload}>Upload</button>
        </form>
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

export default Profile;
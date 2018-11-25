import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import API from "../../utils/API";

class UploadVideoForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      selectedFile: "",
      errorMsg: "",
      redirect: false,
      loaded: 0
    };
    this.performFileUpload = this.performFileUpload.bind(this);
    this.addErrorMessage = this.addErrorMessage.bind(this);
    this.sendRedirect = this.sendRedirect.bind(this);
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
    if (!this.isFormFieldsValid()) {
      this.addErrorMessage("Title must not be empty.");
    } else if (!this.isFileFieldValid()) {
      this.addErrorMessage("Invalid file format.");
    } else {
      this.performFileUpload();
    }
  }
  performFileUpload() {
    return API.uploadVideo(this.createFormData(),
      loaded => {
        this.setState({ loaded });
      }).then(this.sendRedirect).catch(err => {
        console.log(err);
        this.addErrorMessage(err.message);
      })
  }
  createFormData() {
    const { selectedFile, title } = this.state;
    const data = new FormData();
    data.append("file", selectedFile);
    data.append("title", title);
    return data;
  }
  isFileFieldValid() {
    const { selectedFile } = this.state;
    const fileName = selectedFile.name;
    if (fileName && fileName.match(/\.(mp4|MP4)$/)) {
      return true;
    }
    return false;
  }
  isFormFieldBlank(fieldName) {
    const value = this.state[fieldName];
    if (value && value.trim()) {
      return false;
    }
    return true;
  }
  isFormFieldsValid() {
    return !this.isFormFieldBlank("title");
  }
  addErrorMessage(errorMsg) {
    this.setState({ errorMsg });
  }
  sendRedirect() {
    this.setState({
      redirect: true
    });
  }
  render() {
    const { title, errorMsg, redirect, loaded } = this.state;
    if (redirect) {
      return <Redirect to="/profile" />;
    }
    return (
      <div>
        {errorMsg ? <span className="error">{errorMsg}</span> : ""}
        <form>
          <input type="text" name="title" value={title}
            onChange={this.handleInputChange} placeholder="Title" /><br />
          <input type="file" name="uploadFile"
            onChange={this.handleFileChange} />
          <button type="submit"
            onClick={this.handleFileUpload}>Upload</button>
        </form>
        {loaded ? (
          <p><span>Loading {Math.round(loaded, 2)}%</span></p>
        ) : ""}
      </div>
    );
  }
}

export default UploadVideoForm;
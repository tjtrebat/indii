import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import API from "../../utils/API";
import "./UploadVideoForm.css";

class UploadVideoForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      description: "",
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
    const { title, description, selectedFile } = this.state;
    const data = new FormData();
    data.append("title", title);
    data.append("file", selectedFile);
    data.append("description", description);
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
    const { title, description, errorMsg, redirect, loaded } = this.state;
    if (redirect) {
      return <Redirect to="/profile" />;
    }
    return (
      <div>
        {errorMsg ? <span className="error">{errorMsg}</span> : ""}
        <form>
          <div className="form-control">
            <input type="text" name="title" value={title}
              onChange={this.handleInputChange} placeholder="Title" />
          </div>
          <div className="form-control">
            <textarea name="description" value={description}
              onChange={this.handleInputChange} placeholder="Description"></textarea>
          </div>
          <div className="form-control">
            <input type="file" name="uploadFile"
              onChange={this.handleFileChange} />
          </div>
          <button type="submit" className="btn-upload"
            onClick={this.handleFileUpload}>Upload</button>
          {loaded ? (
            <span className="loading">Loading {Math.round(loaded, 2)}%</span>
          ) : ""}
        </form>
      </div>
    );
  }
}

export default UploadVideoForm;
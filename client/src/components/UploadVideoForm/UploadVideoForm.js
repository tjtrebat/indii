import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import API from "../../utils/API";

class UploadVideoForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      selectedFile: "",
      error: "",
      redirect: false
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
    const formErrors = this.validateForm();
    if (formErrors) {
      this.addErrorMessage(formErrors[0]);
    } else {
      this.performFileUpload();
    }
  }
  validateForm() {
    const formErrors = [];
    if (!this.isFormFieldsValid()) {
      formErrors.push(new Error("Title must not be empty."));
    } else if (!this.isFileFieldValid()) {
      formErrors.push(new Error("Invalid file format."));
    }
  }
  performFileUpload() {
    return API.upload(this.createFormData()).then(
      this.sendRedirect).catch(err => {
        console.log(err);
        this.addErrorMessage(err);
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
    if (!fileName || !fileName.match(/\.(mp4|MP4)$/)) {
      return false;
    }
    return true;
  }
  isFormFieldBlank(fieldName) {
    const value = this.state[fieldName];
    if (typeof value === "undefined" || !value.trim()) {
      return true;
    }
    return false;
  }
  isFormFieldsValid() {
    return !this.isFormFieldBlank("title");
  }
  addErrorMessage(error) {
    this.setState({ error: error.message });
  }
  sendRedirect() {
    this.setState({
      redirect: true
    });
  }
  render() {
    const { title, error, redirect } = this.state;
    if (redirect) {
      return <Redirect to="/profile" />;
    }
    return (
      <div>
        {error ? <span className="error">{error}</span> : ""}
        <form>
          <input type="text" name="title" value={title}
            onChange={this.handleInputChange} placeholder="Title" /><br />
          <input type="file" name="uploadFile"
            onChange={this.handleFileChange} />
          <button type="submit"
            onClick={this.handleFileUpload}>Upload</button>
        </form>
      </div>
    );
  }
}

export default UploadVideoForm;
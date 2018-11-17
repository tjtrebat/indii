import React, { Component } from "react";
import API from "../../utils/API";

class UploadFileForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      selectedFile: "",
      error: ""
    };
    this.performFileUpload = this.performFileUpload.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.setErrorMessage = this.setErrorMessage.bind(this);
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
  isFileFieldValid() {
    const { selectedFile } = this.state;
    const fileName = selectedFile.name;
    if (!fileName || !fileName.match(/\.mp4$/)) {
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
  createFormData() {
    const { selectedFile, title } = this.state;
    const data = new FormData();
    data.append("file", selectedFile);
    data.append("title", title);
    return data;
  }
  isFormFieldsValid() {
    return !this.isFormFieldBlank("title");
  }
  validateForm() {
    return new Promise((resolve, reject) => {
      if (!this.isFormFieldsValid()) {
        reject(new Error("Title must not be blank!"));
      } else if (!this.isFileFieldValid()) {
        reject(new Error("Invalid file type (.mp4)."));
      } else {
        resolve();
      }
    });
  }
  performFileUpload() {
    const data = this.createFormData();
    return new Promise((resolve, reject) => {
      API.upload(data).then(resolve).catch(() => {
        reject(new Error("A file upload error has occurred."))
      });
    });
  }
  resetForm() {
    this.setState({
      title: "",
      selectedFile: "",
      error: ""
    });
  }
  setErrorMessage(error) {
    this.setState({ error: error.message });
  }
  handleFileUpload = event => {
    event.preventDefault();
    this.validateForm().then(this.performFileUpload).then(
      this.resetForm).catch(this.setErrorMessage);
  }
  render() {
    const { title, error } = this.state;
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

export default UploadFileForm;
import React, { Component } from "react";
import { Redirect } from "react-router-dom";

class Register extends Component {
    state = {
        username: "",
        password: "",
        passwordConf: "",
        errorMsg: "",
        redirect: false
    }
    handleInputChange = event => {
        const { name, value } = event.target;
        this.setState({
            [name]: value
        });
    }
    handleClick = event => {
        event.preventDefault();
        const { username, password } = this.state;
        if (this.isFormValid()) {
            this.props.handleClick(username, password)
                .then(() => this.setState({
                    redirect: true
                })).catch(err => {
                    console.log("ERROR OCCURRED");
                    console.log(err);
                    this.setState({
                        errorMsg: err.message
                    });
                });
        }
    }
    isFormValid() {
        let { username, password, passwordConf } = this.state;
        username = username.trim();
        password = password.trim();
        let errorMsg;
        if (!username.length) {
            errorMsg = "Username can not be empty.";
        } else if (!password.length) {
            errorMsg = "Password can not be empty.";
        } else if (password !== passwordConf) {
            errorMsg = "Passwords do not match.";
        }
        if (!errorMsg) {
            return true;
        }
        this.setState({ errorMsg });
    }
    render() {
        const { username, password, passwordConf, errorMsg, redirect } = this.state;
        if (redirect) {
            return <Redirect to="/" />;
        }
        return (
            <div>
                <h3>Register</h3>
                {errorMsg ? <span className="error">{errorMsg}</span> : ""}
                <form>
                    <input type="text" name="username" value={username}
                        onChange={this.handleInputChange} placeholder="Username" /><br />
                    <input type="password" name="password" value={password}
                        onChange={this.handleInputChange} placeholder="Password" /><br />
                    <input type="password" name="passwordConf" value={passwordConf}
                        onChange={this.handleInputChange} placeholder="Confirm Password" />
                    <button type="submit" onClick={this.handleClick}>Register</button>
                </form>
            </div>
        );
    }
}

export default Register;
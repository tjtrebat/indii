import React, { Component } from "react";
import { Redirect } from "react-router-dom";

class Login extends Component {
    state = {
        username: "",
        password: "",
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
            this.props.handleClick(username, password).then(() => {
                this.setState({
                    redirect: true
                });
            }).catch(err => {
                this.setState({
                    errorMsg: err.message
                });
            });
        }
    }
    isFormValid() {
        let { username, password } = this.state;
        username = username.trim();
        password = password.trim();
        let errorMsg;
        if (!username.length) {
            errorMsg = "Username can not be empty.";
        } else if (!password.length) {
            errorMsg = "Password can not be empty.";
        } else {
            return true;
        }
        this.setState({ errorMsg });
    }
    render() {
        const { username, password, errorMsg, redirect } = this.state;
        if (redirect) {
            return <Redirect to="/" />;
        }
        return (
            <div>
                <h3>Login</h3>
                {errorMsg ? <span className="error">{errorMsg}</span> : ""}
                <form>
                    <input type="text" name="username" value={username}
                        onChange={this.handleInputChange} placeholder="Username" /> <br />
                    <input type="password" name="password" value={password}
                        onChange={this.handleInputChange} placeholder="Password" />
                    <button type="submit" onClick={this.handleClick}>Login</button>
                </form>
            </div>
        );
    }
}

export default Login;
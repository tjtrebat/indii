import React, { Component } from "react";
import { Redirect } from "react-router-dom";

class Login extends Component {
    state = {
        username: "",
        password: "",
        error: "",
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
        this.props.handleClick(username, password)
            .then(err => {
                const newState = {};
                if (err) {
                    newState.error = err.message;
                } else {
                    newState.redirect = true;
                }
                this.setState(newState);
            });
    }
    render() {
        const { username, password, error, redirect } = this.state;
        if (redirect) {
            return <Redirect to="/" />;
        }
        return (
            <div>
                <h3>Login</h3>
                {error ? <span className="error">{error}</span> : ""}
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
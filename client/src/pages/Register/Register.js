import React, { Component } from "react";
import { Redirect } from "react-router-dom";

class Register extends Component {
    state = {
        username: "",
        password: "",
        passwordConf: "",
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
        const { username, password, passwordConf } = this.state;
        this.props.handleClick(username, password, passwordConf)
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
        const { username, password, passwordConf, error, redirect } = this.state;
        if (redirect) {
            return <Redirect to="/" />;
        }
        return (
            <div>
                <h3>Register</h3>
                {error ? <span className="error">{error}</span> : ""}
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
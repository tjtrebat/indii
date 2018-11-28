import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import "./Header.css";

class Header extends Component {
    state = {
        redirect: false
    }
    handleClick = event => {
        event.preventDefault();
        this.props.handleClick();
    }
    render() {
        return (
            <header className="header">
                {this.state.redirect ? <Redirect to="/" /> : ""}
                {this.props.user ? (
                    <div>
                        <span className="welcome">Welcome, {this.props.user}!</span>
                        <Link to="/" onClick={this.handleClick}>Logout</Link>
                    </div>
                ) : (
                        <ul className="header-nav">
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register">Register</Link></li>
                        </ul>
                    )}
            </header>
        );
    }
}

export default Header;
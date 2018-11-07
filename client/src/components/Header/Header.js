import React, { Component } from "react";
import { Link } from "react-router-dom";

class Header extends Component {
    handleClick = event => {
        event.preventDefault();
        this.props.handleClick();
    }
    render() {
        return (
            <div>
                {this.props.user ? (
                    <div>
                        <span>Welcome, {this.props.user}!</span>
                        <Link to="/" onClick={this.handleClick}>Logout</Link>
                    </div>
                ) : (
                        <ul>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register">Register</Link></li>
                        </ul>
                    )}
            </div>
        );
    }
}

export default Header;
import React from "react";
import { NavLink } from "react-router-dom";

export const Nav = props => {
    return (
        <nav>
            {!props.user ? (
                <ul>
                    <li><NavLink to="/">Home</NavLink></li>
                </ul>
            ) : (
                    <ul>
                        <li><NavLink to="/">Home</NavLink></li>
                        <li><NavLink exact to="/profile">Profile</NavLink></li>
                        <li><NavLink exact to="/profile/upload">Upload Video</NavLink></li>
                    </ul>
                )}
        </nav>
    );
}
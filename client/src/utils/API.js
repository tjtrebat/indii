import axios from "axios";

export default {
    login: function (username, password) {
        return axios.post("/api/users/login", {
            username,
            password
        });
    },
    register: function (username, password, confirmPassword) {
        return axios.post("/api/users/register", {
            username,
            password,
            confirmPassword
        });
    },
    getUserStatus: function () {
        return axios.get("/api/users/getUserStatus");
    }
};

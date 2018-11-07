import axios from "axios";

export default {
    login: function (username, password) {
        return axios.post("/api/users/login", {
            username,
            password
        });
    },
    register: function (username, password, passwordConf) {
        return axios.post("/api/users/register", {
            username,
            password,
            passwordConf
        });
    },
    getUserStatus: function () {
        return axios.get("/api/users/getUserStatus");
    },
    logout: function () {
        return axios.get("/api/users/logout");
    }
};

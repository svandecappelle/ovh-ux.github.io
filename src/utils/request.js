import axios from "axios";

const gitURL = "https://api.github.com";
const proxyURL = "http://api-git.ux-team.ovh/users/ovh-ux";

export const api = axios.create({
    baseURL: gitURL,
    method: "get",
    headers: {
        Accept: "application/vnd.github.mercy-preview+json"
    }
});

export const proxy = axios.create({
    baseURL: proxyURL,
    method: "get"
});

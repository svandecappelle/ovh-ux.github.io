import { api, proxy } from "../../utils/request";
import lodash from "lodash";

function getLastCommit (repo) {
    return api.get(`/repos/ovh-ux/${repo}/commits`)
        .catch(() => proxy.get(`/repos/ovh-ux/${repo}/commits`))
        .then((response) => {
            const last = response.data[0].sha;
            return last;
        });
}

function compareCommits (repo, first, last) {
    return api.get(`/repos/ovh-ux/${repo}/compare/${first}...${last}`)
        .catch(() => proxy.get(`/repos/ovh-ux/${repo}/compare/${first}...${last}`))
        .then((response) => {
            const total = response.data.total_commits;
            return total;
        });
}

function getCommits (repo) {
    return getLastCommit(repo).then((lastcommit) => {
        const first = { "ovh-manager-web": "6a63e7c0199620f8e62d73a378cde770bb51f56f", "ovh-manager-cloud": "44256bffb7ab124e9537c470cbfa42b4fae7432f", "ovh-manager-telecom": "7ddd35c7ccde0f55dd217852949c5ef83e9c85a9", "ovh-manager-dedicated": "c9c25615fb3e2a8f975e5906268dc259675be799" };
        return compareCommits(repo, first[repo], lastcommit).then((response) => {
            return response + 1;
        });
    });
}

function getContributors (repo) {
    return api.get(`/repos/ovh-ux/${repo}/contributors`)
        .catch(() => proxy.get(`/repos/ovh-ux/${repo}/contributors`))
        .then((response) => {
            const data = response.data;
            const contributors = [];

            data.forEach((element) => {
                contributors.push(element);
            });

            return contributors;
        });
}

function getTopics (repo) {
    return api.get(`/repos/ovh-ux/${repo}/topics`)
        .catch(() => proxy.get(`/repos/ovh-ux/${repo}/topics`))
        .then((response) => {
            const data = response.data.names;
            const topics = [];

            data.forEach((element) => {
                topics.push(element);
            });
            return topics;
        });
}

export default {
    nbrRepos ({ commit }) {
        return api.get("/users/ovh-ux")
            .catch(() => proxy.get("/users/ovh-ux"))
            .then((response) => {
                const nbr_repos = response.data.public_repos;

                commit("NBR_REPOS", nbr_repos);
            });
    },
    lastPushed ({ commit }) {
        return api.get("/users/ovh-ux/repos?sort=pushed&direction=desc")
            .catch(() => proxy.get("/users/ovh-ux/repos?sort=pushed&direction=desc"))
            .then((response) => {
                const last = response.data[0];
                commit("LAST_PUSHED", last);
            });
    },
    aboutTechno ({ commit }) {
        return api.get("/users/ovh-ux/repos?per_page=500")
            .catch(() => proxy.get("/users/ovh-ux/repos?per_page=500"))
            .then((response) => {
                const data = response.data;
                const language_obj = {};
                let lang;
                let sort;

                data.forEach((element) => {
                    lang = element.language;
                    if (language_obj[lang] == null && lang != null) {
                        language_obj[lang] = 1;
                    } else if (language_obj[lang] != null && lang != null) {
                        language_obj[lang] += 1;
                    }
                });

                sort = _.sortBy(_.keys(language_obj), function (current) {
                    return -language_obj[current];
                });

                sort = _.pick(language_obj, sort);

                commit("ABOUT_TECHNO", sort);
            });
    },
    manager ({ commit }, repo) {
        api.get(`/repos/ovh-ux/${repo}`)
            .catch(() => proxy.get(`/repos/ovh-ux/${repo}`))
            .then((data) => {
                getCommits(repo).then((commits) => {
                    getContributors(repo).then((contributors) => {
                        getTopics(repo).then((topics) => {
                            const ret = {};
                            const rep = data.data;

                            ret.repo = rep;
                            ret.commits = commits;
                            ret.contributors = contributors;
                            ret.topics = topics;

                            commit("MANAGER", ret);
                        });
                    });
                });
            });
    },
    otherProjects ({ commit }) {
        return api.get("/users/ovh-ux/repos?sort=pushed&direction=desc")
            .catch(() => proxy.get("/users/ovh-ux/repos?sort=pushed&direction=desc"))
            .then((response) => {
                const data = response.data;
                commit("OTHER_PROJECTS", data);
            });
    }
};

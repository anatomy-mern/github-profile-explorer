
// ===================================
// 1. DOM ELEMENTS
// ===================================

const searchForm = document.getElementById("searchForm");
const usernameInput = document.getElementById("usernameInput");
const searchBtn = document.getElementById("searchBtn");

const loader = document.getElementById("loader");
const mainContent = document.getElementById("mainContent");
const message = document.getElementById("message");

const avatar = document.getElementById("avatar");
const nameElement = document.getElementById("name");
const profileUsername = document.getElementById("profileUsername");
const bio = document.getElementById("bio");
const locationElement = document.getElementById("location");
const blog = document.getElementById("blog");
const joinedDate = document.getElementById("joinedDate");
const profileLink = document.getElementById("profileLink");

const repoCount = document.getElementById("repoCount");
const followers = document.getElementById("followers");
const following = document.getElementById("following");
const totalStars = document.getElementById("totalStars");

const languagesContainer =
    document.getElementById("languagesContainer");

const repositoriesContainer =
    document.getElementById("repositoriesContainer");

const repoTotal = document.getElementById("repoTotal");


// ===================================
// 2. GLOBAL VARIABLES
// ===================================

let allRepositories = [];


// ===================================
// 3. SEARCH FORM EVENT
// ===================================

searchForm.addEventListener("submit", function (event) {

    console.log(event); // Debugging line

    event.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
        showMessage("Please enter a GitHub username.");
        return;
    }
    getGitHubProfile(username);
});


// ===================================
// 4. FETCH GITHUB PROFILE
// ===================================

async function getGitHubProfile(username) {

    showLoader(true);

    mainContent.classList.add("hidden");
    message.textContent = "";

    try {

        // Fetch profile information
        const userResponse = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}`
        );

        console.log("User Response Status:", userResponse); // Debugging line

        if (!userResponse.ok) {

            if (userResponse.status === 404) {
                throw new Error("GitHub username not found.");
            }

            if (userResponse.status === 403) {
                throw new Error(
                    "GitHub API rate limit exceeded. Try again later."
                );
            }

            throw new Error("Unable to fetch GitHub profile.");

        }

        const userData = await userResponse.json();

        console.log("Fetched User Data:", userData); // Debugging line


        // Fetch repositories
        const repoResponse = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`
        );

        if (!repoResponse.ok) {
            throw new Error("Unable to fetch repositories.");
        }

        const repoData = await repoResponse.json();


        console.log("Fetched Repositories:", repoData); // Debugging line


        // Remove forked repositories and sort by stars
        allRepositories = repoData
            .filter(repo => !repo.fork)
            .sort((a, b) => b.stargazers_count - a.stargazers_count);


        // Display all information
        displayProfile(userData);

        displayStatistics(userData, repoData);

        displayRepositories();

        mainContent.classList.remove("hidden");

    }

    catch (error) {

        showMessage(error.message);

    }

    finally {

        showLoader(false);

    }

}


// ===================================
// 5. DISPLAY PROFILE
// ===================================

function displayProfile(user) {

    avatar.src = user.avatar_url;
    avatar.alt = `${user.login}'s GitHub avatar`;

    nameElement.textContent = user.name || user.login;

    profileUsername.textContent = `@${user.login}`;
    profileUsername.href = user.html_url;

    bio.textContent = user.bio || "No bio available.";

    locationElement.textContent =
        user.location ? `📍 ${user.location}` : "";


    console.log("User Created At:", user.created_at); // Debugging line

    const date = new Date(user.created_at);

    joinedDate.textContent =
        `Joined GitHub on ${date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })}`;

    profileLink.href = user.html_url;

}


// ===================================
// 6. DISPLAY STATISTICS
// ===================================

function displayStatistics(user, repositories) {

    const stars = repositories.reduce(
        (total, repo) => total + repo.stargazers_count,
        0
    );

    repoCount.textContent = user.public_repos.toLocaleString();

    followers.textContent = user.followers.toLocaleString();

    following.textContent = user.following.toLocaleString();

    totalStars.textContent = stars.toLocaleString();

}






// ===================================
// 8. DISPLAY ALL REPOSITORIES
// ===================================

function displayRepositories() {

    repositoriesContainer.innerHTML = "";

    repoTotal.textContent =
        `${allRepositories.length} repositories`;


    if (allRepositories.length === 0) {

        repositoriesContainer.textContent =
            "No public repositories found.";

        return;

    }


    allRepositories.forEach(repo => {

        const repoCard = document.createElement("div");

        repoCard.className = "repo-card";

        const description = repo.description
            ? repo.description
            : "No description available.";

        const language = repo.language || "Not specified";

        repoCard.innerHTML = `

            <h3>
                <a href="${repo.html_url}"
                   target="_blank"
                   rel="noopener noreferrer">

                    ${repo.name}

                </a>
            </h3>

            <p>${description}</p>

            <div class="repo-meta">

                <span>⭐ ${repo.stargazers_count}</span>

                <span>🍴 ${repo.forks_count} Forks</span>

                <span>💻 ${language}</span>

            </div>

        `;

        repositoriesContainer.appendChild(repoCard);

    });

}


// ===================================
// 9. LOADING INDICATOR
// ===================================

function showLoader(isLoading) {

    if (isLoading) {

        loader.classList.remove("hidden");
        searchBtn.disabled = true;
        searchBtn.textContent = "Searching...";

    } else {

        loader.classList.add("hidden");
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
    }

}


// ===================================
// 10. ERROR MESSAGE
// ===================================

function showMessage(text) {
    message.textContent = text;
}


const API = "http://localhost:5000/api";

let token = localStorage.getItem("token");


// ==========================
// PAGE CONTROL
// ==========================

function showLogin() {
    document
        .getElementById("loginSection")
        .classList.remove("hidden");

    document
        .getElementById("registerSection")
        .classList.add("hidden");
}

function showRegister() {
    document
        .getElementById("loginSection")
        .classList.add("hidden");

    document
        .getElementById("registerSection")
        .classList.remove("hidden");
}

function showHome() {
    document
        .getElementById("loginSection")
        .classList.add("hidden");

    document
        .getElementById("registerSection")
        .classList.add("hidden");

    document
        .getElementById("homeSection")
        .classList.remove("hidden");

    loadFeed();
    loadUsers();
}


// ==========================
// REGISTER
// ==========================

async function register() {

    const username =
        document.getElementById("registerUsername").value;

    const email =
        document.getElementById("registerEmail").value;

    const password =
        document.getElementById("registerPassword").value;

    try {

        const response = await fetch(
            `${API}/auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Registration successful!");

        showLogin();

    } catch (error) {

        alert("Cannot connect to server.");

        console.error(error);
    }
}


// ==========================
// LOGIN
// ==========================

async function login() {

    const email =
        document.getElementById("loginEmail").value;

    const password =
        document.getElementById("loginPassword").value;

    try {

        const response = await fetch(
            `${API}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        token = data.token;

        localStorage.setItem(
            "token",
            token
        );

        showHome();

    } catch (error) {

        alert("Cannot connect to server.");

        console.error(error);
    }
}


// ==========================
// LOGOUT
// ==========================

function logout() {

    localStorage.removeItem("token");

    token = null;

    document
        .getElementById("homeSection")
        .classList.add("hidden");

    showLogin();
}


// ==========================
// CREATE POST
// ==========================

async function createPost() {

    const content =
        document.getElementById("postContent").value.trim();

    if (!content) {
        alert("Please write something.");
        return;
    }

    try {

        const response = await fetch(
            `${API}/posts`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    content
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        document
            .getElementById("postContent")
            .value = "";

        updateCharacterCount();

        alert("Post created!");

        loadFeed();

    } catch (error) {

        console.error(error);

        alert("Failed to create post.");
    }
}


// ==========================
// LOAD FEED
// ==========================

async function loadFeed() {

    try {

        const response = await fetch(
            `${API}/posts/feed`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        const feed =
            document.getElementById("feed");

        feed.innerHTML = "";

        if (data.posts.length === 0) {

            feed.innerHTML =
                "<p>No posts yet. Follow some users!</p>";

            return;
        }

        data.posts.forEach(post => {

            const postElement =
                document.createElement("div");

            postElement.className = "post";

            const date =
                new Date(post.createdAt)
                    .toLocaleString();

            postElement.innerHTML = `
                <div class="postUsername">
                    @${post.author.username}
                </div>

                <div class="postContent">
                    ${escapeHTML(post.content)}
                </div>

                <div class="postDate">
                    ${date}
                </div>
            `;

            feed.appendChild(postElement);
        });

    } catch (error) {

        console.error(error);

    }
}


// ==========================
// LOAD USERS
// ==========================

async function loadUsers() {

    try {

        const response = await fetch(
            `${API}/users`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const users = await response.json();

        if (!response.ok) {
            return;
        }

        const usersList =
            document.getElementById("usersList");

        usersList.innerHTML = "";

        users.forEach(user => {

            const userElement =
                document.createElement("div");

            userElement.className = "user";

            userElement.innerHTML = `
                <span>@${user.username}</span>

                <button
                    onclick="followUser('${user._id}')">
                    Follow
                </button>
            `;

            usersList.appendChild(userElement);
        });

    } catch (error) {

        console.error(error);

    }
}


// ==========================
// FOLLOW USER
// ==========================

async function followUser(userId) {

    try {

        const response = await fetch(
            `${API}/users/${userId}/follow`,
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert(data.message);

        loadUsers();
        loadFeed();

    } catch (error) {

        console.error(error);

        alert("Failed to follow user.");
    }
}


// ==========================
// CHARACTER COUNT
// ==========================

document
    .getElementById("postContent")
    .addEventListener(
        "input",
        updateCharacterCount
    );

function updateCharacterCount() {

    const content =
        document.getElementById("postContent").value;

    document
        .getElementById("characterCount")
        .textContent =
        `${content.length} / 280`;
}


// ==========================
// SECURITY
// ==========================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ==========================
// START APPLICATION
// ==========================

if (token) {
    showHome();
} else {
    showLogin();
}
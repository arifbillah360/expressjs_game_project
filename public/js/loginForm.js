/* eslint-disable */
const login = async (email, password) => {
  const fetchedData = await (
    await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    })
  ).json();

  if (fetchedData.status === "success") {
    console.log("Logged in successfully");
    window.setTimeout(() => {
      location.assign("/mypage");
    }, 1500);
  } else {
    console.log(fetchedData);
  }
};

const logoutBtn = document.querySelector(".logout");

const logout = async () => {
  const fetchedData = await (
    await fetch("http://localhost:3000/api/logout", { method: "GET" })
  ).json();
  console.log(fetchedData);

  if (fetchedData.status === "success") {
    location.reload(true);
    location.assign("/login");
  }
};

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

const loginForm = document.querySelector(".login_form");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email_login").value;
    const password = document.getElementById("password_login").value;
    login(email, password);
  });
}
//
function changePage() {
  document.querySelectorAll(".form").forEach((form) => {
    form.style.transform = `translateX(-100vw)`;
  });
}

// changePage();
//localhost:3000/mypage

const fetchUserData = async () => {
  const fetchedData = await (
    await fetch("http://localhost:3000/myPageData", {
      method: "GET",
    })
  ).json();

  document.querySelector(
    ".welcome-content"
  ).textContent = `Welcome to my page, ${fetchedData.user.username}`;
  document.querySelector(
    ".role"
  ).textContent = `Your role is: ${fetchedData.user.role}`;
  document.getElementById("username").value = `${fetchedData.user.username}`;
  document.getElementById("email").value = `${fetchedData.user.email}`;
  document.querySelector(
    ".profile-photo"
  ).src = `../img/users/${fetchedData.user.photo}`;
};

if (window.location.href === "http://localhost:3000/mypage") {
  fetchUserData();
}

// update user settings
const updateData = async (username, email) => {
  const fetchedData = await (
    await fetch("http://localhost:3000/api/updateMe", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username, email: email }),
    })
  ).json();

  if (fetchedData.status === "success") {
    console.log("data updated successfully");
  } else {
    console.log("did not work", fetchedData);
  }
};

const userData = document.querySelector(".submitBtn");

if (userData) {
  userData.addEventListener("click", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    updateData(username, email);
  });
}

// update user password
const updatePassword = async (passwordCurrent, password, passwordConfirm) => {
  const pass = document.getElementById("password").value;
  const passConfirm = document.getElementById("passwordConfirm").value;
  const passCurrent = document.getElementById("passwordCurrent").value;
  const fetchedData = await (
    await fetch("http://localhost:3000/api/updateMyPassword", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passwordCurrent: passCurrent,
        passwordConfirm: passConfirm,
        password: pass,
      }),
    })
  ).json();
  console.log("data fetched");

  if (fetchedData.status === "success") {
    console.log("password updated successfully");
  } else {
    console.log("password update did not work", fetchedData);
  }
};

const passwordForm = document.querySelector(".reset-pass-btn");

if (passwordForm) {
  passwordForm.addEventListener("click", async (e) => {
    e.preventDefault();
    passwordForm.innerHTML = "Updating... Wait...";

    await updatePassword();
    console.log("submit event worked");

    document.getElementById("password").value = "";
    document.getElementById("passwordConfirm").value = "";
    document.getElementById("passwordCurrent").value = "";

    passwordForm.innerHTML = "RESET MY PASSWORD";
  });
}

//

const photoSubmit = document.querySelector(".photo-submit");

if (photoSubmit) {
  photoSubmit.addEventListener("click", async (event) => {
    event.preventDefault();
    let form = new FormData();
    form.append("photo", document.getElementById("photo").files[0]);
    console.log(form);

    const fetchedData = await (
      await fetch("http://localhost:3000/api/updateMe", {
        method: "PATCH",
        body: form, // Send the FormData object directly
      })
    ).json();

    document.querySelector(
      ".profile-photo"
    ).src = `../img/users/${fetchedData.data.user.photo}`;

    console.log(fetchedData.data.user.photo);
  });
}

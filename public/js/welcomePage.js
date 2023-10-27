document
  .querySelectorAll("#change-form_login, #change-form_register")
  .forEach((formBtn) => {
    formBtn.addEventListener("click", () => {
      document
        .querySelectorAll(
          "#register_form, #login_form, #change-form_login, #change-form_register, #user-status_tologin, #user-status_toregister"
        )
        .forEach((form) => {
          form.classList.toggle("show_form");
        });
    });
  });

let usernameValid = false;
let emailValid = false;
let passwordValid = false;
let passwordConfirmValid = false;

document.getElementById("register_username").addEventListener("keyup", (e) => {
  if (e.target.value.trim() === "" || e.target.value.trim().length < 3) {
    e.target.style.border = "1px solid red";
    e.target.style.outline = "2px solid red";
    e.target.style.outlineOffset = "2px";
    usernameValid = false;
  } else {
    e.target.style.border = "1px solid rgba(166, 185, 199, 1)";
    e.target.style.outline = "2px solid rgba(166, 185, 199, 1)";
    e.target.style.outlineOffset = "2px";
    usernameValid = true;
  }
});

document.getElementById("register_email").addEventListener("keyup", (e) => {
  if (
    e.target.value.trim() === "" ||
    e.target.value.trim().length < 4 ||
    !e.target.value.trim().includes("@")
  ) {
    e.target.style.border = "1px solid red";
    e.target.style.outline = "2px solid red";
    e.target.style.outlineOffset = "2px";
    emailValid = false;
  } else {
    e.target.style.border = "1px solid rgba(166, 185, 199, 1)";
    e.target.style.outline = "2px solid rgba(166, 185, 199, 1)";
    e.target.style.outlineOffset = "2px";
    emailValid = true;
  }
});

document.getElementById("register_password").addEventListener("keyup", (e) => {
  if (e.target.value.trim() === "" || e.target.value.trim().length < 8) {
    e.target.style.border = "1px solid red";
    e.target.style.outline = "2px solid red";
    e.target.style.outlineOffset = "2px";
    passwordValid = false;
  } else {
    e.target.style.border = "1px solid rgba(166, 185, 199, 1)";
    e.target.style.outline = "2px solid rgba(166, 185, 199, 1)";
    e.target.style.outlineOffset = "2px";
    passwordValid = true;
  }
});

document
  .getElementById("register_confirm-password")
  .addEventListener("keyup", (e) => {
    if (
      e.target.value.trim() ===
      document.getElementById("register_password").value.trim()
    ) {
      e.target.style.border = "1px solid rgba(166, 185, 199, 1)";
      e.target.style.outline = "2px solid rgba(166, 185, 199, 1)";
      e.target.style.outlineOffset = "2px";
      passwordConfirmValid = true;
    } else {
      e.target.style.border = "1px solid red";
      e.target.style.outline = "2px solid red";
      e.target.style.outlineOffset = "2px";
      passwordConfirmValid = false;
    }
  });

// Register function
document
  .getElementById("register_form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const userMsg = document.querySelector(".user_msg");

    if (
      !usernameValid ||
      !emailValid ||
      !passwordValid ||
      !passwordConfirmValid
    ) {
      userMsg.innerHTML = `${
        usernameValid ? "" : "Username must contain 4 characters<br>"
      }${emailValid ? "" : "Please enter a valid email<br>"}${
        passwordValid ? "" : "Password must contain 8 characters<br>"
      }${
        passwordConfirmValid
          ? ""
          : "Password and password confirm do not match<br>"
      }`;

      userMsg.style.display = "block";

      return window.setTimeout(() => {
        userMsg.style.display = "none";
      }, 3000);
    }

    const username = document.getElementById("register_username");
    const email = document.getElementById("register_email");
    const password = document.getElementById("register_password");
    const passwordConfirm = document.getElementById(
      "register_confirm-password"
    );

    const fetchedData = await (
      await fetch("http://localhost:3000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.value,
          email: email.value,
          password: password.value,
          passwordConfirm: passwordConfirm.value,
        }),
      })
    ).json();

    if (fetchedData.status === "success") {
      userMsg.textContent = "Registration completed";
      userMsg.style.display = "block";

      username.value = "";
      email.value = "";
      password.value = "";
      passwordConfirm.value = "";

      window.setTimeout(() => {
        userMsg.style.display = "none";
      }, 3000);
    } else {
      if (
        fetchedData.message.includes("duplicate") &&
        fetchedData.message.includes("username")
      ) {
        userMsg.textContent = "Username already used.";
        userMsg.style.display = "block";
        username.focus();

        window.setTimeout(() => {
          userMsg.style.display = "none";
        }, 3000);
      } else if (
        fetchedData.message.includes("duplicate") &&
        fetchedData.message.includes("email")
      ) {
        userMsg.textContent = "Email already used.";
        userMsg.style.display = "block";
        email.focus();

        window.setTimeout(() => {
          userMsg.style.display = "none";
        }, 3000);
      }
    }
  });

// Login
document.getElementById("login_form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const userMsg = document.querySelector(".user_msg");
  const email = document.getElementById("login_email").value;
  const password = document.getElementById("login_password").value;

  const fetchedData = await (
    await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    })
  ).json();

  if (fetchedData.status === "success") {
    userMsg.textContent = "Login successfull!";
    userMsg.style.display = "block";
    window.setTimeout(() => {
      userMsg.style.display = "none";
      location.assign("/game");
    }, 3000);
  } else {
    userMsg.textContent = "Incorrect email or password";
    userMsg.style.display = "block";
    window.setTimeout(() => {
      userMsg.style.display = "none";
    }, 3000);
  }
});

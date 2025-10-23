const elForm = document.getElementById("form");

async function login(user) {
  try {
    const req = await fetch("https://json-api.uz/api/project/fn44/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    const res = await req.json();
    return res;
  } catch {
    throw new Error("royhatdan otishda  Xatolik  boldi");
  }
}

elForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const formData = new FormData(elForm);
  const result = {};
  formData.forEach((value, key) => {
    result[key] = value;
  });

  login(result)
    .then((res) => {
      localStorage.setItem("token", res.access_token);
      window.location.href = "../the.html";
    })
    .catch(() => {})
    .finally(() => {});
});

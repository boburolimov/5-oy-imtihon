import { checkAuth } from "./check-auth.js";
import { deleteElementLocal, editElementLocal } from "./crud.js";
import { changeLocalData, localData } from "./local-data.js";
import { getAll, getById2, editElement, addElement } from "./request.js";

import { pagination, ui } from "./ui.js";

const channel1 = new BroadcastChannel("channel_1");

channel1.onmessage = (evt) => {
  if (evt.data.action === "redirect") {
    window.location.href = evt.data.address;
  }
};

const limit = 12;
let skip = 0;

const elAuthModal = document.getElementById("authModal");
const elAuthCancel = document.getElementById("authCancel");
const elAuthLogin = document.getElementById("authLogin");

const elDeleteModal = document.getElementById("deleteModal");
const elCancelDelete = document.getElementById("cancelDelete");
const elConfirmDelete = document.getElementById("confirmDelete");

const elEditForm = document.getElementById("editForm");

const elEditModal = document.getElementById("editModal");

const elContainer = document.getElementById("container");
const elOfflinePage = document.getElementById("offlinePage");
const elFilterTypeSelect = document.getElementById("filterTypeSelect");
const elFilterVallueSelect = document.getElementById("filterValueSelect");
const elSearchInput = document.getElementById("searchInput");
const elAddCar = document.getElementById("addCar");
const elCloseEditModal = document.getElementById("closeEditModal");
const eldark = document.getElementById("dark");
const sunIcon = document.getElementById("sunIcon");
const moonIcon = document.getElementById("moonIcon");
const searchInput = document.getElementById("searchInput");
const container = document.getElementById("container");
const footer = document.querySelector("footer");

let backendData = null;
let worker = new Worker("./worker.js");

let filterKey = null;
let filterValue = null;
let editedElementId = null;

function warning() {
  window.location.href = "/pages/the.html";
  channel1.postMessage({ action: "redirect", address: "/pages/the.html" });
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.navigator.onLine === false) {
    elOfflinePage.classList.remove("hidden");
  } else {
    elOfflinePage.classList.add("hidden");
  }

  showSkeleton();

  elContainer.innerHTML = `
    <div class="col-span-3 flex flex-col items-center justify-center mt-20 gap-3">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p class="text-lg text-gray-600">Yuklanmoqda...</p>
    </div>
  `;

  getAll(`?limit=${limit}&skip=${skip}`)
    .then((res) => {
      backendData = res;
      pagination(backendData.total, backendData.limit, backendData.skip);
      changeLocalData(backendData.data);
      hideSkeleton();
      elContainer.innerHTML = "";
      ui(backendData.data);
    })
    .catch((error) => {
      alert(error.message);
        hideSkeleton();
      elContainer.innerHTML = "";
      elContainer.innerHTML = `
        <div class="col-span-3 text-center mt-20 text-red-500">
          malumot topilmadi
        </div>
      `;
    });
});

elFilterTypeSelect.addEventListener("change", (evt) => {
  const value = evt.target[evt.target.selectedIndex].value;
  filterKey = value;
  worker.postMessage({
    functionName: "filterByType",
    params: [backendData.data, value],
  });
});

elFilterVallueSelect.addEventListener("change", (evt) => {
  const value = evt.target[evt.target.selectedIndex].value;
  filterValue = value;

  const elContainer = document.getElementById("container");
  elContainer.innerHTML = null;

  elContainer.innerHTML = `
    <div class="col-span-3 flex flex-col items-center justify-center mt-20 gap-3">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p class="text-lg text-gray-600">Yuklanmoqda...</p>
    </div>
  `;

  if (filterValue === "All") {
    ui(backendData.data);
    return;
  }

  if (filterKey && filterValue) {
    getAll(`?${filterKey}=${filterValue}`)
      .then((res) => {
        backendData = res;
        ui(backendData.data);
      })
      .catch((error) => {
        console.log("Malumotni natogri olib kelindi " + error.message);
      });
  }
});

elSearchInput.addEventListener("input", (evt) => {
  const key = evt.target.value;
  worker.postMessage({
    functionName: "search",
    params: [backendData.data, key],
  });
});

worker.addEventListener("message", (evt) => {
  const response = evt.data;

  if (evt.data.target === "filterByType") {
    const result = response.result;
    elFilterVallueSelect.classList.remove("hidden");
    elFilterVallueSelect.innerHTML = "";
    const option = document.createElement("option");
    option.selected = true;
    option.disabled = true;
    option.textContent = "All";
    elFilterVallueSelect.appendChild(option);

    result.forEach((element) => {
      const option = document.createElement("option");
      option.textContent = element;
      option.value = element;
      elFilterVallueSelect.appendChild(option);
    });
  } else if (evt.data.target === "search") {
    const elContainer = document.getElementById("container");

    elContainer.innerHTML = "";

    if (response.result.length > 0) {
      elContainer.innerHTML = "";
      ui(response.result);
    } else {
      const eltext = document.createElement("h1");
      eltext.textContent = "Afsuski bunday mashina yoq";
      eltext.className =
        "text-center text-[50px] col-span-3 mt-[100px] text-gray-900 dark:text-white";

      const img = document.createElement("img");
      img.src = "img/no-data.png";
      img.alt = "No car found";
      img.className = "w-72 opacity-90 col-span-3 mx-auto mt-20";

      elContainer.appendChild(eltext);
      elContainer.appendChild(img);
      document.getElementById("pagination").innerHTML = "";
    }
  }
});

window.addEventListener("online", () => {
  elOfflinePage.classList.add("hidden");
});

window.addEventListener("offline", () => {
  elOfflinePage.classList.remove("hidden");
});

//crud

elContainer.addEventListener("click", (evt) => {
  const target = evt.target;

  //get
  if (evt.target.classList.contains("js-info")) {
  }

  //edit
  if (evt.target.classList.contains("js-edit")) {
    if (checkAuth()) {
      editedElementId = target.id;
      elEditModal.showModal();
      const foundElement = localData.find((el) => el.id == target.id);
      elEditForm.name.value = foundElement.name;
      elEditForm.description.value = foundElement.description;
      elEditForm.trim.value = foundElement.trim;
      elEditForm.generation.value = foundElement.generation;
      elEditForm.year.value = foundElement.year;
      elEditForm.colorName.value = foundElement.colorName;
      elEditForm.category.value = foundElement.category;
      elEditForm.maxSpeed.value = foundElement.maxSpeed;
      elEditForm.acceleration.value = foundElement.acceleration;
      elEditForm.fuelType.value = foundElement.fuelType;
      elEditForm.country.value = foundElement.country;
    } else {
      elAuthModal.showModal();
      elAuthCancel.addEventListener("click", () => {
        elAuthModal.close();
      });
      elAuthLogin.addEventListener("click", () => {
        window.location.href = "/pages/login.html";
      });
    }
  }

  //delete

  let deleteId = null;

  elContainer.addEventListener("click", (evt) => {
    const target = evt.target;

    if (target.classList.contains("js-delete")) {
      const token = localStorage.getItem("token");

      if (!token || !checkAuth()) {
        elAuthCancel.addEventListener("click", () => {
          elAuthModal.close();
        });

        elAuthLogin.addEventListener("click", () => {
          window.location.href = "/pages/login.html";
        });

        elAuthModal.showModal();
        return;
      }

      deleteId = target.id;
      elDeleteModal.showModal();
    }
  });

  elCancelDelete.addEventListener("click", () => {
    elDeleteModal.close();
    deleteId = null;
  });

  elConfirmDelete.addEventListener("click", (e) => {
    e.preventDefault();

    if (!deleteId) return;

    getById2(deleteId)
      .then((id) => {
        deleteElementLocal(id);
      })
      .catch(() => {
        console.log("Ochirishda xato yuz berdi");
      })
      .finally(() => {
        elDeleteModal.close();
        deleteId = null;
      });
  });
});

elEditForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const submitBtn = elEditForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Saqlanmoqda...";

  const formData = new FormData(elEditForm);
  const result = {};
  formData.forEach((value, key) => {
    result[key] = value;
  });

  if (editedElementId) {
    result.id = editedElementId;
    editElement(result)
      .then((res) => {
        editElementLocal(res);
      })
      .catch((err) => {
        console.log("Editda xato:", err);
      })
      .finally(() => {
        editedElementId = null;
        elEditModal.close();
        submitBtn.disabled = false;
        submitBtn.textContent = "Saqlash";
      });
  }
});

//pagination

const elPagination = document.getElementById("pagination");

elPagination.addEventListener("click", (evt) => {
  if (evt.target.classList.contains("js-page")) {
    skip = Number(evt.target.dataset.skip);

    elContainer.innerHTML = `
      <div class="col-span-3 flex flex-col items-center justify-center mt-20 gap-3">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p class="text-lg text-gray-600 dark:text-gray-300">Yuklanmoqda...</p>
      </div>
    `;

    getAll(`?limit=${limit}&skip=${skip}`)
      .then((res) => {
        backendData = res;

        elContainer.innerHTML = "";
        ui(res.data);

        pagination(res.total, res.limit, res.skip);
      })
      .catch((error) => {
        alert(error.message);
        elContainer.innerHTML = `
          <div class="col-span-3 text-center mt-20 text-red-500">
            Ma'lumot topilmadi
          </div>
        `;
      });
  }
});

elAddCar.addEventListener("click", () => {
  if (!checkAuth()) {
    elAuthModal.showModal();

    elAuthCancel.addEventListener("click", () => {
      elAuthModal.close();
    });

    elAuthLogin.addEventListener("click", () => {
      window.location.href = "/pages/login.html";
    });

    return;
  }

  elEditForm.reset();
  elEditModal.showModal();
  editedElementId = null;
});

elEditForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  if (!editedElementId) {
    const submitBtn = elEditForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Saqlanmoqda...";

    const formData = new FormData(elEditForm);
    const newCar = {};
    formData.forEach((value, key) => {
      newCar[key] = value;
    });

    if (!checkAuth()) {
      elEditModal.close();
      elAuthModal.showModal();
      elAuthCancel.addEventListener("click", () => {
        elAuthModal.close();
      });
      elAuthLogin.addEventListener("click", () => {
        window.location.href = "/pages/login.html";
      });
      submitBtn.disabled = false;
      submitBtn.textContent = "Saqlash";
      return;
    }

    addElement(newCar)
      .then((res) => {
        backendData.data.unshift(res);
        changeLocalData(backendData.data);
        elContainer.innerHTML = "";
        ui(backendData.data);
      })
      .catch((err) => {
        console.log("Qoshishda xato:", err);
      })
      .finally(() => {
        elEditModal.close();
        submitBtn.disabled = false;
        submitBtn.textContent = "Saqlash";
      });
  }
});

elCloseEditModal.addEventListener("click", () => {
  elEditModal.close();
});

if (localStorage.getItem("theme") === "dark") {
  document.documentElement.classList.add("dark");
  sunIcon.classList.remove("hidden");
  moonIcon.classList.add("hidden");
  sunIcon.style.opacity = "1";
  sunIcon.style.transform = "scale(1)";
  moonIcon.style.opacity = "0";
  moonIcon.style.transform = "scale(0.75)";
} else {
  document.documentElement.classList.remove("dark");
  sunIcon.classList.add("hidden");
  moonIcon.classList.remove("hidden");
  sunIcon.style.opacity = "0";
  sunIcon.style.transform = "scale(0.75)";
  moonIcon.style.opacity = "1";
  moonIcon.style.transform = "scale(1)";
}

eldark.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  const dark = document.documentElement.classList.contains("dark");

  sunIcon.classList.toggle("hidden", !dark);
  moonIcon.classList.toggle("hidden", dark);

  sunIcon.style.opacity = dark ? "1" : "0";
  sunIcon.style.transform = dark ? "scale(1)" : "scale(0.75)";
  moonIcon.style.opacity = dark ? "0" : "1";
  moonIcon.style.transform = dark ? "scale(0.75)" : "scale(1)";

  localStorage.setItem("theme", dark ? "dark" : "light");
});

window.addEventListener("storage", (event) => {
  if (event.key === "theme") {
    const dark = event.newValue === "dark";
    document.documentElement.classList.toggle("dark", dark);

    sunIcon.classList.toggle("hidden", !dark);
    moonIcon.classList.toggle("hidden", dark);

    sunIcon.style.opacity = dark ? "1" : "0";
    sunIcon.style.transform = dark ? "scale(1)" : "scale(0.75)";
    moonIcon.style.opacity = dark ? "0" : "1";
    moonIcon.style.transform = dark ? "scale(0.75)" : "scale(1)";
  }
});

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  let hasResults = false;

  const cards = container.querySelectorAll(".card");
  cards.forEach((card) => {
    const text = card.textContent.toLowerCase();
    if (text.includes(query)) {
      card.style.display = "";
      hasResults = true;
    } else {
      card.style.display = "none";
    }
  });

  if (!hasResults) {
    footer.style.display = "none";
  } else {
    footer.style.display = "";
  }
});

function showSkeleton(count = 9) {
  const skeletonContainer = document.getElementById("skeleton");
  const skeletonTemplate = document.getElementById("skeletonTemplate").content;
  const elContainer = document.getElementById("container");

  elContainer.classList.add("hidden");

  skeletonContainer.innerHTML = "";
  skeletonContainer.classList.remove("hidden");

  for (let i = 0; i < count; i++) {
    skeletonContainer.appendChild(skeletonTemplate.cloneNode(true));
  }
}

function hideSkeleton() {
  const skeletonContainer = document.getElementById("skeleton");
  const elContainer = document.getElementById("container");
  skeletonContainer.classList.add("hidden");
  elContainer.classList.remove("hidden");
}

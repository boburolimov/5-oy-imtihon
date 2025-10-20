import { checkAuth } from "./check-auth.js";
import { deleteElementLocal, editElementLocal } from "./crud.js";
import { changeLocalData, localData } from "./local-data.js";
import { getAll, getById2, editElement } from "./request.js";
import { pagination, ui } from "./ui.js";

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

let backendData = null;
let worker = new Worker("./worker.js");

let filterKey = null;
let filterValue = null;
let editedElementId = null;

window.addEventListener("DOMContentLoaded", () => {
  if (window.navigator.onLine === false) {
    elOfflinePage.classList.remove("hidden");
  } else {
    elOfflinePage.classList.add("hidden");
  }

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
      elContainer.innerHTML = "";
      ui(backendData.data);
    })
    .catch((error) => {
      alert(error.message);
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
      eltext.className = "text-center text-[50px] col-span-3 mt-[100px]";

      const img = document.createElement("img");
      img.src = "img/no-data.png";
      img.alt = "No car found";
      img.className = "w-72 opacity-90 col-span-3 mx-auto mt-20";

      elContainer.appendChild(eltext);
      elContainer.appendChild(img);
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
      .catch(() => {})
      .finally(() => {
        editedElementId = null;
        elEditModal.close();
      });
  }
});

//pagination

const elPagination = document.getElementById("pagination");
elPagination.addEventListener("click", (evt) => {
  if (evt.target.classList.contains("js-page")) {
    skip = evt.target.dataset.skip;

    getAll(`?limit=${limit}&skip=${skip}`)
      .then((res) => {
        backendData.res;
        elContainer.innerHTML = "";
        ui(res.data);
        pagination(res.total, res.limit, res.skip);
      })
      .catch((error) => {
        alert(error.message);
        elContainer.innerHTML = "";
        elContainer.innerHTML = `
        <div class="col-span-3 text-center mt-20 text-red-500">
          malumot topilmadi
        </div>
      `;
      });
  }
});

const elCloseEditModal = document.getElementById("closeEditModal");

elCloseEditModal.addEventListener("click", () => {
  elEditModal.close();
});



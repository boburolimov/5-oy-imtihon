export function ui(data) {
  const elContainer = document.getElementById("container");
  elContainer.innerHTML = null;
  data.forEach((element) => {
    const clone = document
      .getElementById("cardTemplate")
      .cloneNode(true).content;

    const elTitle = clone.querySelector("h2");
    const elDescription = clone.querySelector(".description");
    const eltrim = clone.querySelector(".trim");
    const elgeneration = clone.querySelector(".generation");
    const elyear = clone.querySelector(".year");
    const elcolorname = clone.querySelector(".colorName");
    const elcetogory = clone.querySelector(".category");
    const elmaxSpeed = clone.querySelector(".maxSpeed");
    const elacceleration = clone.querySelector(".acceleration");
    const elfuelType = clone.querySelector(".fuelType");
    const elcountry = clone.querySelector(".country");
    const elid = clone.querySelector(".id");

    const elInfoBtn = clone.querySelector(".js-info");
    const elEitBtn = clone.querySelector(".js-edit");
    const elDeleteBtn = clone.querySelector(".js-delete");

    //id

    elInfoBtn.href = `/pages/details.html?id=${element.id}`;
    elEitBtn.id = element.id;
    elDeleteBtn.id = element.id;

    elTitle.innerText = "Name : " + element.name;
    eltrim.innerText = "Trim: " + element.trim;
    elgeneration.innerText = "Generation: " + element.generation;
    elyear.innerText = "Year: " + element.year;
    elcolorname.innerText = "ColorName: " + element.colorName;
    elcetogory.innerText = "Category: " + element.category;
    elmaxSpeed.innerText = "MaxSpeed: " + element.maxSpeed;
    elacceleration.innerText = "Acceleration: " + element.acceleration;
    elfuelType.innerText = "FuelType: " + element.fuelType;
    elcountry.innerText = "Country: " + element.country;
    elDescription.innerText = "Description: " + element.description;
    elid.innerText = "Id: " + element.id;

    elContainer.appendChild(clone);
  });
}

export function pagination(total, limit, skip) {
  const elPagination = document.getElementById("pagination");
  elPagination.innerHTML = null;
  const remained = total % limit;
  const pageCount = (total - remained) / limit;
  let activePage = skip / limit + 1;

  for (let i = 1; i <= pageCount; i++) {
    const button = document.createElement("button");
    button.classList.add("join-item", "btn", "js-page");
    if (activePage == i) {
      button.classList.add("btn-active");
    }
    button.innerText = i;

    button.dataset.skip = limit * i - limit;

    elPagination.appendChild(button);
  }

  if (remained > 0) {
    const button = document.createElement("button");
    button.classList.add("join-item", "btn", "js-page");
    if(activePage === pageCount + 1) {
       button.classList.add("btn-avtive");
    }
    button.innerText = pageCount + 1;
    elPagination.appendChild(button);
    button.dataset.skip = pageCount *  limit
  }
}

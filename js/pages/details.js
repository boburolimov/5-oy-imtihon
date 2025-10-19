const elTitle = document.getElementById("name");
const eltrim = document.getElementById("trim");
const elgeneration = document.getElementById("generation");
const elDescription = document.getElementById("description");
const elyear = document.getElementById("year");
const elcoloname = document.getElementById("colorName");
const elcetegory = document.getElementById("category");
const elmaxsped = document.getElementById("maxSpeed");
const elacceleration = document.getElementById("acceleration");
const elfueltype = document.getElementById("fuelType");
const elcountry = document.getElementById("country");
const elid = document.getElementById("id");

const loader = document.getElementById("loader");
const card = document.getElementById("card");

async function getById(id) {
  document.title = "Yuklanmoqda...";
  const req = await fetch(`https://json-api.uz/api/project/fn44/cars/${id}`);
  return await req.json();
}

function ui(data) {
  document.title = data.name;

  elTitle.innerText = "Name: " + data.name;
  eltrim.innerText = "Trim: " + data.trim;
  elgeneration.innerText = "Generation: " + data.generation;
  elDescription.innerText = "Description: " + data.description;
  elyear.innerText = "Year: " + data.year;
  elcoloname.innerText = "ColorName: " + data.colorName;
  elcetegory.innerText = "Category: " + data.category;
  elmaxsped.innerText = "MaxSpeed: " + data.maxSpeed;
  elacceleration.innerText = "Acceleration: " + data.acceleration;
  elfueltype.innerText = "FuelType: " + data.fuelType;
  elcountry.innerText = "Country: " + data.country;
  elid.innerText = "Id: " + data.id;

  loader.classList.add("hidden");
  card.classList.remove("hidden");
}

window.addEventListener("DOMContentLoaded", () => {
  const id = new URLSearchParams(location.search).get("id");
  getById(id)
    .then(ui)
    .catch((err) => (loader.innerText = err.message));
});

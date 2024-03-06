
// async function getData() {
//   const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=Pizza')
//   const data = await response.json()
//   return data
// }

// const data = getData();

// data.then((result) => {
//   console.log(result["meals"]["0"])
// });

class FoodData {

  #foodName
  #ingredients
  #instructions
  #additionalInfo

  constructor(args = null) {
    this.#foodName = ""
    this.#ingredients = {}
    this.#instructions = ""
    this.#additionalInfo = {}

    if (args) {
      const meal = args["meals"]["0"];
      this.#constructFoodData(meal);
    }
  }

  #constructFoodData(meal) {
    this.#foodName = meal["strMeal"];

    for (let i = 1; i <= 20; i++) {
      if (meal["strIngredient" + i]) {
        this.#ingredients[meal["strIngredient" + i]] = meal["strMeasure" + i];
      }
    }

    this.#instructions = meal["strInstructions"];

    this.#additionalInfo["category"] = meal["strCategory"];
    this.#additionalInfo["area"] = meal["strArea"];
    this.#additionalInfo["id"] = meal["idMeal"];
    this.#additionalInfo["source"] = meal["strSource"];
    this.#additionalInfo["youtube"] = meal["strYoutube"];
  }

  get foodName() {
    return this.#foodName;
  }

  get ingredients() {
    return this.#ingredients;
  }

  get instructions() {
    return this.#instructions;
  }

  get additionalInfo() {
    return this.#additionalInfo;
  }
}

class APIHandler {
  constructor() {
    this.apiUrl = 'https://www.themealdb.com/api/json/v1/1/';
  }

  async getFoodDataByName(name) {
    const response = await fetch(this.apiUrl + 'search.php?s=' + name)
    const data = await response.json()
    return new FoodData(data)
  }

  async getFoodDataById(id) {
    const response = await fetch(this.apiUrl + 'lookup.php?i=' + id)
    const data = await response.json()
    return new FoodData(data)
  }

  async getRandomFoodData() {
    const response = await fetch(this.apiUrl + 'random.php')
    const data = await response.json()
    return new FoodData(data)
  }
}

class CardCreator {
  constructor() {
    this.foodName = "";
    this.cardHtml = `
    <img src="img/cubcake.webp" alt="cubcake gamer">
    <section class="food-info">
        <h1>${this.foodName}</h1>
        <section class="category-selector">
            <button class="ingredients-btn">See ingredients</button>
            <button class="instructions-btn>Preparation instructions</button>
            <button class="addinfo-btn>More info</button>
        </section>
        <article class="info-container">

            <div class="ingredient-container hidden">

            </div>

            <div class="instructions-container hidden">

            </div>

            <div class="more-info-container hidden">

            </div>
            
        </article>
    </section>
    <button class="favorite-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
        </svg>
    </button>
    `;
  }

  createCard(foodData) {
    this.foodName = foodData.foodName;
    const card = document.createElement('article');
    card.classList.add('card');
    card.innerHTML = this.cardHtml;
    card.querySelector('.ingredient-container').innerHTML = this.createIngredientList(foodData.ingredients);
    card.querySelector('.instructions-container').innerHTML = this.createInstructions(foodData.instructions);
    card.querySelector('.more-info-container').innerHTML = this.createMoreInfo(foodData.additionalInfo);
    this.setUpbuttons(card);
    return card;
  }

  setUpbuttons(card) {
    const ingredientBtn = card.querySelector('.ingredients-btn');
    const instructionsBtn = card.querySelector('.instructions-btn');
    const addInfoBtn = card.querySelector('.addinfo-btn');
    const favoriteBtn = card.querySelector('.favorite-button');

    ingredientBtn[0].addEventListener('click', () => {
      card.querySelector('.ingredient-container').classList.toggle('hidden');
    });

    instructionsBtn[0].addEventListener('click', () => {
      card.querySelector('.instructions-container').classList.toggle('hidden');
    });

    addInfoBtn[0].addEventListener('click', () => {
      card.querySelector('.more-info-container').classList.toggle('hidden');
    });

    // favoriteBtn.addEventListener('click', () => {
    //   favoriteBtn.classList.toggle('favorite-button-active');
    // });
  }

  createIngredientList(ingredients) {
    let ingredientList = "";
    for (let ingredient in ingredients) {
      ingredientList += `<p>${ingredient}: ${ingredients[ingredient]}</p>`;
    }
    return ingredientList;
  }

  createInstructions(instructions) {
    return `<p>${instructions}</p>`;
  }

  createMoreInfo(additionalInfo) {
    let moreInfo = "";
    for (let info in additionalInfo) {
      moreInfo += `<p>${info}: ${additionalInfo[info]}</p>`;
    }
    return moreInfo;
  }
}

class CardInsertion {
  constructor() {
    this.cardCreator = new CardCreator();
  }

  insertCard(foodData, parentElement, deleteParent = false) {
    if (deleteParent) {
      parentElement.innerHTML = "";
    }
    const card = this.cardCreator.createCard(foodData);
    parentElement.appendChild(card);
  }
}

const APIHandlerI = new APIHandler();

const cardInsertion = new CardInsertion();

const cardContainer = document.querySelector('main');

APIHandlerI.getRandomFoodData().then((result) => {
  cardInsertion.insertCard(result, cardContainer, true);
});



class FoodData {

  #foodName
  #ingredients
  #instructions
  #additionalInfo
  #mealThumb

  constructor(args = null) {
    this.#foodName = ""
    this.#ingredients = {}
    this.#instructions = ""
    this.#additionalInfo = {}
    this.#mealThumb = ""

    if (args) {
      const meal = args["meals"]["0"];
      this.#constructFoodData(meal);
    }
  }

  #constructFoodData(meal) {

    console.log(meal)

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
    this.#mealThumb = meal["strMealThumb"];
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

  get mealThumb() {
    return this.#mealThumb;
  }
}

class APIHandler {
  constructor() {
    this.parentElement = document.querySelector('main')
    this.loaderElementString = `<span class="loader"><span class="loader-inner"></span></span>`
    this.apiUrl = 'https://www.themealdb.com/api/json/v1/1/';
  }

  async getFoodDataByName(name) {
    this.showLoader()
    const response = await fetch(this.apiUrl + 'search.php?s=' + name)
    const data = await response.json()
    this.hideLoader()
    return new FoodData(data)
  }

  async getFoodDataById(id) {
    this.showLoader()
    const response = await fetch(this.apiUrl + 'lookup.php?i=' + id)
    const data = await response.json()
    this.hideLoader()
    return new FoodData(data)
  }

  async getRandomFoodData() {
    this.showLoader()
    const response = await fetch(this.apiUrl + 'random.php')
    const data = await response.json()
    this.hideLoader()
    return new FoodData(data)
  }

  showLoader() {
    this.parentElement.innerHTML = this.loaderElementString;
  }

  hideLoader() {
    this.parentElement.innerHTML = ""
  }
}

class CardCreator {
  constructor(favoriteContentManager) {
    this.foodName = "";
    this.mealThumb = "";
    this.cardHtml = "";
  }

  updateBaseCardHtml() {
    this.cardHtml = `
    <img src="${this.mealThumb}" alt="Food image">
    <section class="food-info">
        <h1>${this.foodName}</h1>
        <section class="category-selector">
            <button class="ingredients-btn non-active">See ingredients</button>
            <button class="instructions-btn non-active">Preparation instructions</button>
            <button class="addinfo-btn non-active">More info</button>
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
    this.mealThumb = foodData.mealThumb;
    this.updateBaseCardHtml();
    const card = document.createElement('article');
    card.classList.add('card');
    card.id = "card-id" + foodData.additionalInfo.id;
    card.innerHTML = this.cardHtml;
    card.querySelector('.ingredient-container').innerHTML = this.createIngredientList(foodData.ingredients);
    card.querySelector('.instructions-container').innerHTML = this.createInstructions(foodData.instructions);
    card.querySelector('.more-info-container').innerHTML = this.createMoreInfo(foodData.additionalInfo);
    this.setUpbuttons(card, foodData);
    return card;
  }

  setUpbuttons(card, foodData) {
    const foodId = foodData.additionalInfo.id;
    const ingredientBtn = card.querySelector('.ingredients-btn');
    const instructionsBtn = card.querySelector('.instructions-btn');
    const addInfoBtn = card.querySelector('.addinfo-btn');
    const favoriteBtn = card.querySelector('.favorite-button');
    favoriteBtn.classList.add(`fav-${foodId}`)

    const favoriteFoodPersistance = favoriteContentManager.favoriteFoodPersistance;

    if (favoriteFoodPersistance.contain(foodId)) {
      favoriteBtn.classList.add('favorite');
    }

    const ingredientContainer = card.querySelector('.ingredient-container');
    const instructionsContainer = card.querySelector('.instructions-container');
    const moreInfoContainer = card.querySelector('.more-info-container');

    const containerArray = [ingredientContainer, instructionsContainer, moreInfoContainer];
    const buttonArray = [ingredientBtn, instructionsBtn, addInfoBtn];

    this.turnOnContainer(containerArray, 0, 'hidden');
    this.turnOnContainer(buttonArray, 0, 'non-active');

    ingredientBtn.addEventListener('click', () => {
      this.turnOnContainer(containerArray, 0, 'hidden');
      this.turnOnContainer(buttonArray, 0, 'non-active')
    });

    instructionsBtn.addEventListener('click', () => {
      this.turnOnContainer(containerArray, 1, 'hidden');
      this.turnOnContainer(buttonArray, 1, 'non-active')
    });

    addInfoBtn.addEventListener('click', () => {
      this.turnOnContainer(containerArray, 2, 'hidden');
      this.turnOnContainer(buttonArray, 2, 'non-active')
    });

    favoriteContentManager.linkFavoriteButton(card, foodId);
  }

  turnOnContainer(elementArray, index, className) {
    elementArray.forEach((container, i) => {
      container.classList.add(className);
      if (i === index) {
        container.classList.remove(className);
      }
    });
  }

  createIngredientList(ingredients) {
    let ingredientList = "";
    for (let ingredient in ingredients) {
      ingredientList += `<p>${ingredient}: ${ingredients[ingredient]}</p>`;
    }
    return ingredientList;
  }

  createInstructions(instructions) {
    const formattedInstructions = instructions.split('\n').join('<br>');
    return `<p>${formattedInstructions}</p>`;
  }

  createMoreInfo(additionalInfo) {
    let moreInfo = "";
    for (let info in additionalInfo) {
      if (info === "youtube" || info === "source") {
        moreInfo += `<a href="${additionalInfo[info]}">${info} link</a>`;
        continue;
      }
      moreInfo += `<p>${info}: ${additionalInfo[info]}</p>`;
    }
    return moreInfo;
  }
}

class CardInsertion {
  constructor(favoriteContentManager) {
    this.cardCreator = new CardCreator(favoriteContentManager);
  }

  insertCard(foodData, parentElement, deleteParent = false) {
    if (deleteParent) {
      parentElement.innerHTML = "";
    }
    const card = this.cardCreator.createCard(foodData);

    parentElement.appendChild(card);
  }
}

class MainContentManager {
  constructor(favoriteContentManager) {
    this.cardContainer = document.querySelector('main');
    this.apiHandler = new APIHandler();
    this.cardInsertion = new CardInsertion(favoriteContentManager);

    this.randomButton = document.querySelector('#random-button');
    this.setUpRandomButton();

    this.searchBar = document.querySelector('#search-bar');
    this.searchButton = document.querySelector('#search-button');

    this.setUpSearchButton();
    this.setUpSearchBar();
  }

  setUpSearchBar() { 
    this.searchBar.addEventListener('keyup', (event) => {
      console.log(event.key);
      if (event.key === 'Enter') {
        this.addSearchedElement();
      }
    });
  }

  setUpRandomButton() {
    this.randomButton.addEventListener('click', () => {
      this.apiHandler.getRandomFoodData().then((result) => {
        this.cardInsertion.insertCard(result, this.cardContainer, true);
      });
    });
  }

  setUpSearchButton() {
    this.searchButton.addEventListener('click', () => {
      this.addSearchedElement()
    });
  }


  addSearchedElement() {
    const foodName = this.searchBar.value
    this.apiHandler.getFoodDataByName(foodName).then((result) => {
      this.cardInsertion.insertCard(result, this.cardContainer, true)
    }).catch(() => {
      const main = document.querySelector('main');
      main.innerHTML = `<h1 id="not-found">Error<br>We can't find the meal you searched for.</h1>`;
    })
  }
}

class FavoriteFoodPersistance {
  constructor() {
    this.favoriteFoods = [];
    this.loadFavoriteFoods();
  }

  loadFavoriteFoods() {
    const storedFoods = JSON.parse(localStorage.getItem('favoriteFoods'));
    if (storedFoods) {
      this.favoriteFoods = storedFoods;
    }
  }

  addFavoriteFood(foodId) {
    this.favoriteFoods.push(foodId);
    this.saveFavoriteFoods();
  }

  removeFavoriteFood(foodId) {
    this.favoriteFoods = this.favoriteFoods.filter((favoriteFood) => {
      return favoriteFood !== foodId;
    });
    this.saveFavoriteFoods();
  }

  saveFavoriteFoods() {
    localStorage.setItem('favoriteFoods', JSON.stringify(this.favoriteFoods));
  }

  contain(foodId) {
    return this.favoriteFoods.includes(foodId);
  }
}

class FavoriteContentManager {
  constructor(favoriteFoodPersistance) {
    this.favoriteFoodPersistance = favoriteFoodPersistance;
    this.cardContainer = document.querySelector('#favorite-container');
    this.cardInsertion = new CardInsertion();
    this.apiHandler = new APIHandler();
    this.setUpFavoriteContent();
  }

  setUpFavoriteContent() {
    this.cardContainer.innerHTML = "";
    this.favoriteFoodPersistance.favoriteFoods.forEach((foodId) => {
      this.apiHandler.getFoodDataById(foodId).then((result) => {
        this.cardInsertion.insertCard(result, this.cardContainer);
      });
    });
  }

  addCardToContent(card, id) {
    this.favoriteFoodPersistance.addFavoriteFood(id);
    const cardToInsert = card.cloneNode(true);
    this.linkFavoriteButton(cardToInsert, id);
    this.cardContainer.prepend(cardToInsert);
    this.changeButtonState(id);
  }

  deleteCardFromContent(card, id) {
    const childCard = this.cardContainer.querySelector("#card-id" + id);
    this.cardContainer.removeChild(childCard);
    this.favoriteFoodPersistance.removeFavoriteFood(id);
    this.changeButtonState(id);
  }

  changeButtonState(id) {
    const favoriteBtns = document.querySelectorAll('.fav-' + id);
    favoriteBtns.forEach((btn) => {
      btn.classList.toggle('favorite');
    });
  }

  linkFavoriteButton(card, id) {
    const favoriteBtn = card.querySelector('.favorite-button');
    favoriteBtn.addEventListener('click', () => {
      if (favoriteBtn.classList.contains('favorite')) {
        this.deleteCardFromContent(card, id);
      } else {
        this.addCardToContent(card, id);
      }
    });
  }
}

const favoriteFoodPersistance = new FavoriteFoodPersistance();

const favoriteContentManager = new FavoriteContentManager(favoriteFoodPersistance);

const mainContentManager = new MainContentManager(favoriteContentManager);

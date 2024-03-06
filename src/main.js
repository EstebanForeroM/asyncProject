
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
  
}

const APIHandlerI = new APIHandler();

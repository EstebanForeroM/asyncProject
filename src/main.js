
console.log('Hello World!')

async function getData() {
  const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=Pizza')
  const data = await response.json()
  return data
}

const data = getData();

data.then((result) => {
  console.log(result.meals[0]['idMeal'])
});


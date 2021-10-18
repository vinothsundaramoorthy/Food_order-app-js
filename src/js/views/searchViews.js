import { element } from "./base";

export const getInput = () => element.searchField.value;

export const clearInput = () => {
  element.searchField.value = "";
};

export const clearResults = () => {
  element.searchResList.innerHTML = "";
  element.searchResPages.innerHTML = "";
};

export const highlightSelectId = id => {

  const resultsArr = Array.from(document.querySelectorAll('.results__link'));
  resultsArr.forEach(el => {
    el.classList.remove('results__link--active');
  })

  document.querySelector(`.results__link[href*="#${id}"]`).classList.add('results__link--active');
}

export const limitRecipeTitle = (title, limit = 17) => {
  const newTitle = [];
  if (title.length > limit) {
    title.split(" ").reduce((acc, cur) => {
      if (acc + cur.length <= limit) {
        newTitle.push(cur);
      }
      return acc + cur.length;
    }, 0);

    // return the result
    return `${newTitle.join(" ")} ...`;
  }
  return title;
};

const renderRecipe = (recipe) => {
  const markup = `
    <li>
    <a class="results__link" href="#${recipe.recipe_id}">
        <figure class="results__fig">
            <img src="${recipe.image_url}" alt="${recipe.title}">
        </figure>
        <div class="results__data">
            <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
            <p class="results__author">${recipe.publisher}</p>
        </div>
    </a>
</li>
    `;
  element.searchResList.insertAdjacentHTML("beforeend", markup);
};

// Typw will be 'prev' or 'next'
const createButton = (page, type) =>  `
<button class="btn-inline results__btn--${type}" data-goto=${type === 'prev' ? page - 1 : page + 1}>
<svg class="search__icon">
    <use href="img/icons.svg#icon-triangle-${type === 'prev' ? 'left' : 'right'}"></use>
</svg>
<span>Page ${type === 'prev' ? page - 1 : page + 1}</span>
</button>
`;

const renderButtons = (page, numResults, resPerPage) => {
  const pages = Math.ceil(numResults / resPerPage);

  let button;
  if (page === 1) {
    // Display next button
    button = createButton(page, "next");
  } else if (page < pages) {
    // Display Both prev and Next
    button = `${createButton(page, "prev")}
    ${createButton(page, "next")}`;
  } else if (page === pages && pages > 1) {
    // Display Prev Page
    button = createButton(page, "prev");
  }
  element.searchResPages.insertAdjacentHTML("afterbegin", button);
};

export const renderResult = (recipes, page = 2, resPerPage = 10) => {
  const start = (page - 1) * resPerPage;
  const end = page * resPerPage;
  recipes.slice(start, end).forEach(renderRecipe);

  // render pagination buttons
  renderButtons(page, recipes.length, resPerPage);
};

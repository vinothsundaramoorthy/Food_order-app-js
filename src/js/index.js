import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/Lists";
import Likes from "./models/Likes";
import * as searchView from "./views/searchViews";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likesView from "./views/likesView";
import { element, renderLoader, clearLoader } from "./views/base";

/* Global State of the App
 - Search Object
 - Current recipe object
 - Shopping list object
 - Liked Receipe
*/

const state = {};
window.state = state;

/* SEARCH CONTROLLER */
const controlSearch = async () => {
  // 1, get query from view
  const query = searchView.getInput();
  console.log("query", query);

  // TESTING
  //const query = 'pizza';

  if (query) {
    // 2, New Search Object and add to state
    state.search = new Search(query);

    // 3, Prepare UI for the results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(element.searchRes);

    // 4, Search for Receipes
    await state.search.getResults();

    // 5, Render Results in UI
    clearLoader();
    searchView.renderResult(state.search.result);
  }
};

element.searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  controlSearch();
});

// TESTING
window.addEventListener("load", (e) => {
  e.preventDefault();
  controlSearch();
});

element.searchResPages.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-inline");

  if (btn) {
    const goToPage = parseInt(btn.dataset.goto);
    searchView.clearResults();
    searchView.renderResult(state.search.result, goToPage);
  }
});

/* RECIPE CONTROLLER */

const controlRecipe = async () => {
  // GET ID FROM URL
  const id = window.location.hash.replace("#", "");
  console.log(id);

  if (id) {
    // Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(element.recipe);

    // Highlight selected search item
    searchView.highlightSelectId(id);

    // Create a new recipe object
    state.recipe = new Recipe(id);

    // TESTING
    // window.r = state.recipe;

    try {
      // Get recipe data
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
      console.log(state.recipe.ingredients);

      // Calculate servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // Render recipe
      clearLoader();
      recipeView.renderRecipe(
        state.recipe,
        state.likes.isLiked(id)
      );
    } catch (e) {
      console.log(e);
      alert("Error Processing recipe");
    }
  }
};

// window.addEventListener("hashchange", controlRecipe);
// window.addEventListener("load", controlRecipe);

["hashchange", "load"].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);

// LIST CONTROLLER

const controlList = () => {
  // create a new list IF there is none yet
  if (!state.list) state.list = new List();

  // Add each ingredients in the list
  state.recipe.ingredients.forEach((el) => {
    const item = state.list.addItem(el.count, el.unit, el.ingredients);
    listView.renderListView(item);
  });

  // Handle Delete and Update the item in the lists
  element.shopping.addEventListener("click", (e) => {
    const id = e.target.closest(".shopping__item").dataset.itemid;

    // Handle the Delete Button
    if (e.target.matches(".shopping__delete, .shopping__delete *")) {
      // Delete from State
      state.list.deleteItem(id);

      // Delete from list view
      listView.deleteItem(id);
      // Handle the count update
    } else if (e.target.matches(".shopping__count-value")) {
      const val = parseInt(e.target.value, 10);
      state.list.updateCount(id, val);
    }
  });
};



// LIKE CONTROLLER

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  /* If user not yet liked current recipe */
  if (!state.likes.isLiked(currentID)) {
    // Add current item in the likes state
    const newLike = state.likes.addLike(currentID,state.recipe.title,state.recipe.author,state.recipe.img);
    
    // Toggle like button
    likesView.toggleLikeBtn(true);
    
    // Add like to UI list
    likesView.renderLike(newLike);

    // user has liked current recipe
  } else {
    // Remove likes from the state
    state.likes.deleteLike(currentID);

    // Toggle like button
    likesView.toggleLikeBtn(false);

    // Remove like from the UI list
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  likesView.renderLike(state.likes);
};

// Restore liked Recipes on Page Load

window.addEventListener('load', () => {
  state.likes = new Likes();

  // Restore Likes
  state.likes.readStorage();

  // toggle menu
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  // Render the existing likes
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe button clicks

element.recipe.addEventListener("click", (e) => {
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    // Decrease button is clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    // Increase button is clicked
    state.recipe.updateServings("inc");
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    // Adding ingredient in shopping list
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    // Like Controller
    controlLike();
  }
});

// List controller

window.l = new List();

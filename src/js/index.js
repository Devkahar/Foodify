import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Like';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as ListView from './views/ListView';
import * as likesView from './views/likesView';
import {elements,renderLoader,clearLoader} from './views/base';
import { equalScalarDependencies, e } from 'mathjs';
/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipe
 */
const state = {};
/**
 *  Search Controller
 */
const controlSearch = async() =>{
    // 1. get query from search view
    const query = searchView.getInput();
    console.log(query);
    if(query){
        // 2. New search object and add to state
        state.search = new Search(query);

        // 3. Prepare for UI results
        searchView.clearInput();
        searchView.clearResult();
        //recipeView.clearRecipe();
        renderLoader(elements.searchRes)
        try{
            // 4. Search for recipes
            await state.search.getResults();
            // 5. Render result on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        }catch(err){
            alert('something wrong with the search...');
        }
        
    }
};

elements.searchForm.addEventListener('submit', e =>{
    e.preventDefault();
    controlSearch();
});
elements.searchResPages.addEventListener('click', e=> {
    const btn = e.target.closest('.btn-inline')
    if(btn){
        const goTopage =parseInt(btn.dataset.goto,10);
        searchView.clearResult();
        searchView.renderResults(state.search.result,goTopage);    
    }
});

/**
 *  Recipe Controller
 */
const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    console.log(id);
    if (id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);
        //Hightlight selected search result
        if(state.search) searchView.highlightedSelected(id);
        //Create new recipe objet
        state.recipe = new Recipe(id);
        try {
            //get recipe data and parse ingredient
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
    
            //Calculate savings and  times
            state.recipe.calcTime();
            state.recipe.calcServings();
    
            //render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe,state.likes.isLiked(id));
    
        } catch (err) {
            alert('error recipe');
            console.log(err);
        }
    
        }
  };
// window.addEventListener('hashchange',controlRecipe);
// window.addEventListener('load',controlRecipe);
['hashchange','load'].forEach(event => window.addEventListener(event,controlRecipe));


/**
 * LIST CONTROLLER
 */
const controlList = ()=>{
    // create new list if tere is not yet
    if(!state.list) state.list = new List();

    // Add each ingredient to List
    state.recipe.ingredients.forEach(el =>{
        const item = state.list.addItem(el.count,el.unit,el.ingredient);
        ListView.renderItems(item);
    });
}
// Handel delete and update list item events
elements.shopping.addEventListener('click', el=>{
    const id = el.target.closest('.shopping__item').dataset.itemid;

    //handel delete button
    if(el.target.matches('.shopping__delete, .shopping__delete *')){
        //Delete from state
        state.list.deleteItem(id);
        // Delete from user interface
        ListView.deleteItem(id);

    }
    // Handel Count Update
    else if(el.target.matches('.shopping__count-value')){
        const val = parseFloat(el.target.value,10);
        state.list.updateCount(id,val);

    }
})
/**
 * LIKE CONTROLLER
 */

const controlLike = ()=>{
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    // User has not yet liked current recipe
    if(!state.likes.isLiked(currentID)){
        //add like to state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);
        // add like to UI
        likesView.renderLike(newLike)
    }
    // User has not yet liked current recipe
    else{
        // Remove like from state
        state.likes.deleteLike(currentID);
        // Toggle the like button
        likesView.toggleLikeBtn(false);
        // Remove like From UI
        likesView.deleteLike(currentID)
    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
}
// Restore liked recipe on page loads
window.addEventListener('load',()=>{
    state.likes = new Likes();

    // Restore Like
    state.likes.readStorage();
    // Toggle Like menu btn
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    // Render like recipe 
    state.likes.likes.forEach(like => likesView.renderLike(like))
})


// Handling recipe button clicks
elements.recipe.addEventListener('click', e =>{
    if(e.target.matches('.btn-decrease,.btn-decrease *')){
        //decrease button is clicked
        if(state.recipe.servings>1) state.recipe.updateServings('dec');
        recipeView.updateServingsIngredients(state.recipe);
    }
    else if(e.target.matches('.btn-increase,.btn-increase *')){
        //increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        // ADD INGREDIENTS TO SHOPPING LIST
        controlList();
    }
    else if(e.target.matches('.recipe__love, .recipe__love *')){
        controlLike();
    }
});











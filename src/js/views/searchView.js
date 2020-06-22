import {elements} from './base';
export const getInput = () => elements.searchInput.value;
export const clearInput = () =>{
    elements.searchInput.value = '';
}
export const clearResult = ()=>{
    elements.searchResList.innerHTML = '';
    elements.searchResPages.innerHTML = '';
}
export const highlightedSelected = id=>{
    const resultArr = Array.from(document.querySelectorAll('.results__link'));
    resultArr.forEach(el=> {
        el.classList.remove('results__link--active')
    });
    document.querySelector(`.results__link[href="#${id}"]`).classList.add('results__link--active');
}
export const limitRecipeTitle = (title, limit =17)=>{
    const newTitle =[];
    if(title.length>limit){
        title.split(' ').reduce((acc,curr)=>{
            if(acc + curr.length <= limit){
                newTitle.push(curr);
            }
            return acc + curr.length;
        },0);
        return `${newTitle.join(' ')} ...`;
    }
    return title;
}
const renderRecipes = recipe =>{
    const markup= `
            <li>
                <a class="results__link" href="#${recipe.recipe_id}">
                    <figure class="results__fig">
                        <img src="${recipe.image_url}" alt="${recipe.title}">
                    </figure>
                    <div class="results__data">
                        <h4 class="results__name">${ limitRecipeTitle(recipe.title)}</h4>
                        <p class="results__author">${recipe.publisher}</p>
                    </div>
                 </a>
            </li>`
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
}
//type : prev or next
const createButton = (page,type)=>`
<button class="btn-inline results__btn--${type}" data-goto=${type==='prev' ?  page-1 : page+1}>
    <span>Page ${type==='prev' ?  page-1 : page+1}</span>
    <svg class="search__icon">
        <use href="img/icons.svg#icon-triangle-${type==='prev' ? 'left' : 'right'}"></use>
    </svg>
</button>`

const renderButtons = (page,numResults,resPerPage) =>{
    const pages = Math.ceil(numResults/resPerPage);
    let button;
    if(page===1 && pages>1){
        //only button to goto next page
        button = createButton(page,'next');
    }
    else if(page<pages){
        // both buttons
        button = `
        ${createButton(page,'next')}
        ${createButton(page,'prev')}
        `;
    }
    else if (page===pages && pages>1){
        //only button to goto previous page
        button = createButton(page,'prev');
    }
    elements.searchResPages.insertAdjacentHTML('afterbegin',button);
}
export const renderResults = (recipes,page = 1,resPerPage = 10) =>{
    // render results of current page
    const start = (page -1) * resPerPage;
    const end = page * resPerPage;
    recipes.slice(start,end).forEach(renderRecipes);
    // render pagination buttons 
    renderButtons(page, recipes.length,resPerPage);
}
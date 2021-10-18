import axios from 'axios';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        } catch (e) {
            console.log(e);
        }
        
    }

    calcTime() {
        // ASSUME 15 MINS DURATION FOR MINIMUM 3 INGREDIENTS
        const numOfIng = this.ingredients.length;
        const periods = Math.ceil(numOfIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoon', 'teaspoons', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];
        const newIngredients = this.ingredients.map(el => {
             // 1, Uniform units
                let ingredients = el.toLowerCase();
                unitsLong.forEach((unit, i) => {
                    ingredients = ingredients.replace(unit, unitsShort[i]);
                })
             // 2, Remove Parenthesis
                
                ingredients = ingredients.replace(/ *\([^)]*\) */g, ' ');
            
             // 3, Parse ingredients into count, unit and ingredient
                const arrIng = ingredients.split(' ');
                const unitIndex = arrIng.findIndex(el2 => units.includes(el2));
                console.log(unitIndex);

                let objIng;
                if(unitIndex > -1) {
                    // there is a unit
                    // Ex: 4 1/2 cups => arraycount is [4, 1/2] => eval("4+1/2") => 4.5
                    // Ex: 4 cups, array count is 4
                    const arrCount = arrIng.slice(0, unitIndex);
                    let count;
                    if(arrCount.length === 1) {
                        count = eval(arrIng[0].replace('-', '+'));
                    } else {
                        count = eval(arrIng.slice(0, unitIndex).join("+"))
                    }
                    objIng = {
                        count,
                        unit: arrIng[unitIndex],
                        ingredients: arrIng.slice(unitIndex + 1).join(' ')
                    }
                } else if (parseInt(arrIng[0], 10)) {
                    // there is no unit, first element is number
                    objIng = {
                        count: parseInt(arrIng[0], 10),
                        unit: '',
                        ingredients: arrIng.slice(1).join(' ')
                    }

                } else if (unitIndex === 1) {
                    // there is no unit, no number in first position
                    objIng = {
                        count: 1,
                        unit: '',
                        ingredients
                    }
                }

             return objIng;
        });
        this.ingredients = newIngredients;
    }
y
    updateServings (type) {
        // Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;
        
        // Ingredients
        this.ingredients.forEach(ing => {
            ing.count = ing.count * (newServings / this.servings);
        });

        this.servings = newServings;
    }

}
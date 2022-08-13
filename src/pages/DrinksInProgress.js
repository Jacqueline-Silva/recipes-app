import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import { idSearch } from '../api/drinksAPI';
import shareIcon from '../images/shareIcon.svg';
import './styles.css';
import {
  removeFavorite,
  saveFavorite,
  getFavorite,
  setInProgressRecipe,
  getInProgressRecipes,
} from '../helpers/tokenLocalStorage';
import whiteHeartIcon from '../images/whiteHeartIcon.svg';
import blackHeartIcon from '../images/blackHeartIcon.svg';
import treatRecipe from '../helpers/treatingDataForLocal';

const copy = require('clipboard-copy');

const five = 5;
function DrinksInProgress(props) {
  const { match: { params: { recipeId } } } = props;
  const [recipe, setRecipe] = useState({});
  const { push } = useHistory();
  const [isFavorite, setIsFavorite] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [checkedIndex, setCheckedIndex] = useState([]);

  const getLink = () => {
    const string = window.location.href;
    const URL = string.split('/').splice(0, five).join('/');
    copy(URL);
    setLinkCopied(true);
  };

  const handleHeart = () => {
    setIsFavorite(!isFavorite);
  };

  const finishRecipe = () => {
    treatRecipe(recipeId, recipe, 'drink');
    push('/done-recipes');
  };

  const handleCheckBox = ({ target }, index) => {
    if (!checkedIndex.includes(`${index}`)) {
      setCheckedIndex([...checkedIndex, target.name]);
      return;
    }
    setCheckedIndex(checkedIndex.filter((e) => +e !== index));
  };

  const handleClick = () => {
    const obj = {
      id: recipeId,
      type: 'drink',
      nationality: '',
      category: recipe.strCategory,
      alcoholicOrNot: recipe.strAlcoholic,
      name: recipe.strDrink,
      image: recipe.strDrinkThumb,
    };
    if (isFavorite) {
      removeFavorite(obj);
      handleHeart();
      return;
    }
    saveFavorite(obj);
    handleHeart();
  };

  // Set recipe in storage
  useEffect(() => {
    const inProgressRecipesData = getInProgressRecipes();
    if (inProgressRecipesData.cocktails[recipeId]) {
      setCheckedIndex(inProgressRecipesData.cocktails[recipeId]);
      return;
    }
    setInProgressRecipe(recipeId, 'cocktails', checkedIndex);
  }, []);

  useEffect(() => {
    setInProgressRecipe(recipeId, 'cocktails', checkedIndex);
  }, [checkedIndex, recipeId]);

  useEffect(() => {
    const getRecipe = async () => {
      setRecipe(await idSearch(recipeId));
    };
    getRecipe();
  }, [recipeId]);

  useEffect(() => {
    const allFavorites = getFavorite();
    setIsFavorite(allFavorites.some((item) => item.id === recipeId));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recipeKeys = Object.keys(recipe);
  const ingredients = recipeKeys.filter((item) => item.includes('strIngredient'));
  const measure = recipeKeys.filter((item) => item.includes('strMeasure'));

  useEffect(() => {
    const allIngredients = ingredients.filter((item) => recipe[item]
      !== null && recipe[item] !== '');
    if (allIngredients.length === checkedIndex.length) {
      return setIsDisabled(false);
    }
    return setIsDisabled(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedIndex.length, ingredients, recipe]);

  return (
    <div className="drinks-in-progress">
      <img
        data-testid="recipe-photo"
        className="image"
        src={ recipe.strDrinkThumb }
        alt="drink"
        width="360px"
      />
      <div className="share-favorite">
        <h1 data-testid="recipe-title">{ recipe.strDrink }</h1>
        <div>
          <button
            type="button"
            className="share"
            data-testid="share-btn"
            onClick={ () => getLink() }
          >
            <img className="icons" src={ shareIcon } alt="shareIcon" />
          </button>
          {linkCopied && <span>Link copied!</span>}
          <button className="favorite" type="button" onClick={ handleClick }>
            <img
              src={ isFavorite ? blackHeartIcon : whiteHeartIcon }
              alt="Favorito"
              className="icons"
              data-testid="favorite-btn"
              />
          </button>
        </div>
      </div>
      <div className="receita">
        <p
          className="category"
          data-testid="recipe-category"
        >
          {`${recipe.strCategory} ${recipe.strAlcoholic}`}
        </p>
        <p className="title-ingredients">Ingredients</p>
        <div className="ingredients-check">
          { ingredients.filter((item) => recipe[item] !== null && recipe[item] !== '')
            .map((i, index) => (
              <label
                key={ index }
                data-testid={ `${index}-ingredient-step` }
                htmlFor={ `ingredient-${index}` }
              >
                <input
                  type="checkbox"
                  id={ `ingredient-${index}` }
                  className="checks"
                  name={ index }
                  onClick={ ({ target }) => {
                    if (checkedIndex.includes(`${index}`)) {
                      setCheckedIndex(checkedIndex.filter((e) => +e !== index));
                      handleCheckBox();
                      return;
                    }
                    setCheckedIndex([...checkedIndex, target.name]);
                    handleCheckBox();
                  } }
                />
                <span
                  key={ index }
                  className={
                    checkedIndex.some((item) => +item === index) ? 'checkbox' : ''
                  }
                >
                  { recipe[i] !== '' && `${recipe[measure[index]]} ${recipe[i]}` }
                </span>
              </label>
            ))}
        </div>
      </div>
      <p className="title-instructions">Instructions</p>
      <p data-testid="instructions" className="text">{ recipe.strInstructions }</p>
      <button
        type="button"
        onClick={ finishRecipe }
        data-testid="finish-recipe-btn"
        className="buttonFinish"
        disabled={ isDisabled }
      >
        Finish recipe
      </button>
    </div>
  );
}

DrinksInProgress.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      recipeId: PropTypes.string,
    }),
  }).isRequired,
};

export default DrinksInProgress;

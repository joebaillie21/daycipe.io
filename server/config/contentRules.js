export const contentVisibilityRules = {
    fact: {
      hideThreshold: -5,
      shouldHide: (content) => content.score < contentVisibilityRules.fact.hideThreshold
    },
    joke: {
      hideThreshold: -5,
      shouldHide: (content) => content.score < contentVisibilityRules.joke.hideThreshold
    },
    recipe: {
      hideThreshold: -5,
      shouldHide: (content) => content.score < contentVisibilityRules.recipe.hideThreshold
    }
  };
  
  export const evaluateContentVisibility = (type, content) => {
    if (!contentVisibilityRules[type]) {
      throw new Error(`Unknown content type: ${type}`);
    }
    
    return !contentVisibilityRules[type].shouldHide(content);
  };
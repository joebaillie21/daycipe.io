import { faker } from '@faker-js/faker';

// Create today's date in YYYY-MM-DD format
export const today = new Date().toISOString().split('T')[0];

export const testFacts = {
  math: {
    date: today,
    content: 'The Fibonacci sequence appears in nature.',
    source: 'Mathematics Journal',
    category: 'math'
  },
  physics: {
    date: today,
    content: 'Light travels at 299,792,458 meters per second.',
    source: 'Physics Today',
    category: 'physics'
  },
  bio: {
    date: today,
    content: 'DNA was discovered in 1869 by Friedrich Miescher.',
    source: 'Biology Institute',
    category: 'bio'
  }
};

export const testRecipes = {
  default: {
    date: today,
    content: 'Mix flour, sugar, eggs, and butter. Bake at 350°F for 20 minutes.',
    category: 'default'
  },
  vegan: {
    date: today,
    content: 'Blend tofu, nutritional yeast, and plant milk. Season to taste.',
    category: 'veganism'
  },
  kosher: {
    date: today,
    content: 'Prepare traditional challah bread using kosher ingredients.',
    category: 'kosher'
  }
};

export const testJokes = {
  standard: {
    date: today,
    content: 'Why did the programmer quit? They didn\'t get arrays.'
  },
  popular: {
    date: today,
    content: 'I told my computer I needed a break, and now it won\'t stop sending me Kit-Kat ads.'
  }
};

export function generateContentInDateRange(startDate, endDate) {
  const content = {
    facts: [],
    jokes: [],
    recipes: []
  };
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const currentDate = date.toISOString().split('T')[0];
    
    // Add a fact for each category
    Object.keys(testFacts).forEach(category => {
      content.facts.push({
        date: currentDate,
        content: faker.lorem.sentence(),
        source: faker.company.name(),
        category: testFacts[category].category
      });
    });
    
    // Add a joke
    content.jokes.push({
      date: currentDate,
      content: faker.lorem.sentence()
    });
    
    // Add recipes for different categories
    Object.keys(testRecipes).forEach(category => {
      content.recipes.push({
        date: currentDate,
        content: faker.lorem.paragraph(),
        category: testRecipes[category].category
      });
    });
  }
  
  return content;
}
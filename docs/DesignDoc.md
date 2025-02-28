# Daycipe.io Design Document

## Team Information
- Team name: Daycipe Devs
- Team members
  - Joe Baillie
  - Coray Bennett 
  - Ursula Parker
  - Ali Stambayev

## Executive Summary

Daycipe.io is a website that will display jokes, recipes, and facts to users.
The website will be built using React for the frontend, Node.js for the middleware,
and PostgreSQL for the database.


## Requirements

As a user, I want to see a new fact of the day, jokes, and a recipe every time I visit the site, so I can enjoy fresh content daily.
As a user, I want to upvote and downvote facts, jokes, and recipes, so I can share my preferences and influence the content displayed to others.
As a user, I want to report inappropriate or inaccurate content by clicking a report button, so I can help maintain the quality of the site.
As a user interested in a particular academic domain, I want to select an academic domain (biology, physics, math, chemistry, or computer science) for the fact of the day, so I can learn facts relevant to the area I'm most interested in.
As a user, I want the website to show the source of the fact so I can verify the authenticity and credibility of the content.
As a user, I want to see a unique recipe every day, so I can get a variety of meals.
As a user with dietary restrictions, I want to see recipe options tailored to my dietary preference (vegan, vegetarian, lactose intolerance, gluten intolerance, or kosher), so I can find suitable meals.
As a user, I want the jokes of the day to rotate in a carousel, so I can view each one and enjoy a variety of humor.
As a user, I want the joke of the day that is most upvotedto be shown first, so I can immediately view the joke that users like the best.
As a user, I want to be able to see all of the content between the day in which I am accessing the site and the past January 1st to view a full years content. 


### Definition of MVP
Daycipe.io must be able to display a fact, recipe, and joke to the user. It must also 
include functionality for reporting, upvoting, and viewing past facts, recipes, and jokes.

### MVP Features
* Fact of the day with a reference from a reputable website 
* Report button
* Fact specifications
* Recipe of the day
* Report button
* Recipe specifications
* Ingredient calculation according to Serving size selection
* Upvote
* Joke of the day
* Rotating carousel of 3 jokes - highest upvote gets shown first. 
* Calendar based viewing to see past fact, recipe, and 3 jokes of the day


## Architecture and Design

Daycipe.io will be adopting the MVC architecture, as there will be a distinct 
backend(model), frontend(view), and middleware(controller). 


### Software Architecture

![Model-View-Controller Architecture](<MVC Architecture.png>)

The software architecture for Daycipe.io will follow the Model-View-Controller (MVC) pattern. 
This architecture will help in separating concerns and organizing the codebase efficiently. 

- **Model**: The model will handle the data layer, interacting with the PostgreSQL database to fetch, store, and update information about facts, jokes, and recipes.
- **View**: The view will be built using React, providing a dynamic and responsive user interface to display the content to users.
- **Controller**: The controller, implemented using Node.js, will act as an intermediary between the model and the view, processing user requests, applying business logic, and returning the appropriate responses.

This architecture ensures that the application is scalable, maintainable, and easy to extend with new features in the future.

### Use Cases
> ![Use Case Diagram](<Use Case Diagram.png>)

- Viewing the content (fact, joke, and recipe) of the day.
- Upvoting and downvoting content.
- Reporting inappropriate or inaccurate content.
- Selecting an academic domain for the fact of the day.
- Viewing content tailored to dietary preferences.
- Viewing the most upvoted joke first.
- Accessing past content from the current day back to January 1st.

Actors involved in the use case diagram:
- **User**: Interacts with the system to view, upvote, downvote, and report content.
- **Admin**: Manages content and handles reported issues (not explicitly mentioned in the requirements but implied for content moderation).


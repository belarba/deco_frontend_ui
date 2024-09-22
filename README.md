# Deco Frontend UI

This project is an User Interface for this external [API](https://github.com/belarba/deco_backend_api) that's also part of this exercise.
It was developed using React with MaterialUI.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- Node.js (Any recent version)
- npm or yarn

## Installation

1. Clone the repository:

`git clone https://github.com/belarba/deco_frontend_ui.git`

2. Navigate to the project directory:

  `cd deco_fronted_ui`

3. Install dependencies:

  `npm install`

  or

  `yarn install`

## Configuration

This project depends on an external API. Follow the steps below to configure it correctly:

  1. Make sure the API is up and running. The API repository can be found [here](https://github.com/belarba/deco_backend_api)
  
  2. In the project root, you'll find an `.env.manifest` file. This contains a template for the required environment variables - right now it's just the API address.
  
  3. Create a `.env` file in the project root by copying the `.env.manifest`:
  
  `cp .env.manifest .env`
  
  4. Open the `.env` file and adjust the URL do match your API configuration:
  
  `REACT_APP_API_BASE_URL=http://localhost:3000/api/v1`

## Running the project

To start the development server:

`npm start`

or 

`yarn start`

The project will run at `http://localhost:3001` (or the next available port)

## My approach

I started with a super simple interface but enough to test the features - Import a JSON file, show the information, filter by the required field and pagination.

After that I applied MaterialUI to improve the design.

Then I broke it into smaller components, to facilitate future modifications and changes.
  

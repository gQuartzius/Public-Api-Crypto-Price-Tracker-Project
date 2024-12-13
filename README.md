# Crypto Price Checker

This web application fetches cryptocurrency prices using the CoinGecko API. It allows you to search for prices using both crypto names and symbols.

## Getting Started

1. **Clone the repository:**

    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd <YOUR_PROJECT_DIRECTORY>
    ```

2. **Install dependencies:**

    ```bash
    pnpm install
    ```

     or if you prefer `npm`:

    ```bash
    npm install
    ```

3. **Obtain an API key:**
    * Go to the [CoinGecko API](https://www.coingecko.com/api/pricing) and get your free API key.

4. **Set up your API key:**
    * Open the `index.js` file.
    * Find the following line:

        ```javascript
        const API_KEY = "YOUR_API_KEY_HERE";
        ```

    * Replace `YOUR_API_KEY_HERE` with your actual API key.

## Running the Application

1. **Start the server:**

    ```bash
    node index.js
    ```

    * Alternatively, if you have `nodemon` installed you can run:

    ```bash
    nodemon index.js
    ```

2. **Open in your browser:**
    * Go to `http://localhost:3000` in your web browser.

## Key Technologies

* **Express.js:** For the web server.
* **EJS:** For templating.
* **CoinGecko API:** For fetching cryptocurrency prices.
* **Bootstrap:** For styling.

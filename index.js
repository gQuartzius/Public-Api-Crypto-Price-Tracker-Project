import express from "express";
import axios from "axios";
import { fileURLToPath } from "url";
import { dirname } from "path";
import ejs from 'ejs';

// Get the directory of the current file using fileURLToPath and dirname
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Body parser middleware
app.use(express.urlencoded({ extended: true }));

// Set static files folder to 'directory/public'
app.use(express.static(__dirname + "/public"));

// Set view engine
app.set('view engine', 'ejs');

// API KEY (replace with your actual API key)
const API_KEY = "YOUR_API_KEY";
// Base URL for CoinGecko API
const URL = "https://api.coingecko.com/api/v3/";

// Configuration for axios requests, including API key header
const config = {
    headers: {
        "x-cg-api-key": API_KEY,
    },
};

// Route for the homepage
app.get("/", (req, res) => {
    res.render("index.ejs");
});

// Function to fetch the price of a cryptocurrency
async function getPrice(cryptoName) {
    try {
        // 1. Try to fetch price directly using the input as the coin id.
        let response = await axios.get(`${URL}simple/price?ids=${cryptoName}&vs_currencies=usd`, config);
        // If price is found, return the price and crypto name.
        if (response.data[cryptoName]?.usd) {
           return { price: response.data[cryptoName].usd, cryptoName: cryptoName }
        }

        // 2. If the input is not a valid id, fetch the list of all coins from the CoinGecko API.
        const responseList = await axios.get(`${URL}coins/list`, config);
        const cryptoList = responseList.data;

        // 3. Search for a matching crypto by name (with priority).
        let matchingCrypto = cryptoList.find(crypto => crypto.name.toLowerCase() === cryptoName.toLowerCase());

        // 4. If not found by name, search for matching crypto by symbol.
        if (!matchingCrypto) {
            const matchingCryptos = cryptoList.filter(
              (crypto) => crypto.symbol.toLowerCase() === cryptoName.toLowerCase()
            );
            // If no crypto is found, log it and return null.
            if (matchingCryptos.length === 0) {
                console.log("No matching crypto found for:", cryptoName);
                return null;
            }
            // If a single matching crypto is found, assign it to matchingCrypto
            if (matchingCryptos.length === 1) {
                matchingCrypto = matchingCryptos[0]
            } else {
                 // If multiple matching cryptos are found, return the list for selection.
                return { multiple: true, cryptos: matchingCryptos };
            }
        }
        // Extract crypto ID from the found crypto data.
        const cryptoId = matchingCrypto.id;
        // Fetch the crypto's price using its ID.
        const priceResponse = await axios.get(`${URL}simple/price?ids=${cryptoId}&vs_currencies=usd`, config);
        const priceUSD = priceResponse.data[cryptoId]?.usd;

        // If price is found, log it and return it with the crypto name
        if (priceUSD) {
            console.log(`Price found ${matchingCrypto.name} (${matchingCrypto.symbol.toUpperCase()}): ${priceUSD} USD`);
            return { price: priceUSD, cryptoName: matchingCrypto.name };
        } else {
            // If price is not found, log it and return null.
            console.log('Price not found for:', cryptoId);
            return null;
        }

    } catch (error) {
        // If there is an error, log it and re-throw it.
        console.error("Error fetching price:", error);
        throw new Error("Error fetching data. Please try again later.");
    }
}

// Function to handle errors and render the result page with error message.
function handleError(error, cryptoName, res) {
    console.error("Error in /price route:", error);
    res.render("result.ejs", {
        cryptoName,
        price: null,
        error: error.message || "Error fetching data. Please try again later.",
    });
}

// Route to handle crypto search via POST request.
app.post("/price", async (req, res) => {
    try {
        // Grab crypto name from the form submission.
        const cryptoName = req.body.cryptoName;
        // Fetch the crypto price using the getPrice function.
        const result = await getPrice(cryptoName);

         // If multiple cryptos are found, render the view for the user to select.
        if (result && result.multiple) {
             res.render("selectCrypto.ejs", { cryptos: result.cryptos });
        } else if (result) {
             // If a single crypto is found, render the result view with price and crypto name.
            res.render("result.ejs", { cryptoName: result.cryptoName, price: result.price });
        } else {
             // If no crypto is found, render the result view with an error message.
            res.render("result.ejs", { cryptoName, price: null, error: "No matching crypto found" });
        }
    } catch (error) {
         // Handle errors and render the result page with error.
        handleError(error, req.body.cryptoName, res);
    }
});

// Route to handle crypto selection after the user has chosen from the list.
app.post("/select", async (req, res) => {
    try{
        // Extract crypto id from request body
        const cryptoId = req.body.cryptoId
        // Fetch price of the selected crypto
        const priceResponse = await axios.get(`${URL}simple/price?ids=${cryptoId}&vs_currencies=usd`, config);
        const priceUSD = priceResponse.data[cryptoId]?.usd;
         // If price found, render the result page
         if (priceUSD) {
            // Get the full crypto data from id.
           const response = await axios.get(`${URL}coins/list`, config);
           const cryptoList = response.data;
           const matchingCrypto = cryptoList.find(
                (crypto) => crypto.id === cryptoId
              );
          res.render("result.ejs", { cryptoName: matchingCrypto.name, price: priceUSD });
         } else {
           // If price not found, display an error message.
           res.render("result.ejs", { cryptoName, price: null, error: "No matching crypto found" });
        }
    }catch(error){
        // Handle errors.
        handleError(error, null, res);
    }
})

// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
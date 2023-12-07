const axios = require("axios");
const { apiKey } = require("./config.json");

const baseUrl = "https://api.intigriti.com";

async function fetchData(endpoint) {
  try {
    const response = await axios.get(`${baseUrl}${endpoint}`, {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Something went wrong fetching ${baseUrl}${endpoint}:`,
      error
    );
  }
}

module.exports = { fetchData };

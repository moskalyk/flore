package main

import (
	"os"
	"bytes"
	"log"
	"net"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"github.com/oschwald/geoip2-golang"
	"strconv"
	"github.com/joho/godotenv"
)

type WeatherData struct {
	Main struct {
		Temperature float64 `json:"temp"`
	} `json:"main"`
}

type Response struct {
	Signature  string `json:"sig"`
	Msg 	   string `json:"msg"`
	Status     int    `json:"status"`
	Block      int    `json:"block"`
}

type TemperatureRequest struct {
	Celsius int `json:"celcius"`
}

func getWeather(latitude, longitude string, apiKey string) (float64, error) {
	url := fmt.Sprintf("http://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&units=metric&appid=%s", latitude, longitude, apiKey)

	response, err := http.Get(url)
	if err != nil {
		return 0, err
	}

	defer response.Body.Close()

	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return 0, err
	}

	var weather WeatherData
	err = json.Unmarshal(body, &weather)
	if err != nil {
		return 0, err
	}

	return weather.Main.Temperature, nil
}

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env file")
	}

	apiKey := os.Getenv("API_KEY")
	router := gin.Default()

	// Enable CORS
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	router.Use(cors.New(config))

	router.GET("/ip", func(c *gin.Context) {

		db, err := geoip2.Open("./GeoLite2-City_20230707/GeoLite2-City.mmdb")
		
		if err != nil {
			log.Fatal(err)
		}
		defer db.Close()

		ipClient := c.ClientIP()

		// If you are using strings that may be invalid, check that ip is not nil
		ip := net.ParseIP(ipClient)

		record, err := db.City(ip)

		if err != nil {
			log.Fatal(err)
		}

		temperature, err := getWeather(strconv.FormatFloat(record.Location.Latitude, 'f', -1, 64), strconv.FormatFloat(record.Location.Longitude, 'f', -1, 64), apiKey)

		fmt.Printf("%d", int(temperature))
		
		requestBody := TemperatureRequest{
			Celsius: int(temperature),
		}
	
		// Convert the request body to JSON
		jsonBody, err := json.Marshal(requestBody)
		if err != nil {
			fmt.Println("Error marshaling JSON:", err)
			return
		}
	
		// Send the POST request
		url := "http://localhost:5000/sig" // Replace with your API endpoint URL
		resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonBody))
		if err != nil {
			fmt.Println("Error sending request:", err)
			return
		}
		defer resp.Body.Close()
	
		// Check the response status code
		if resp.StatusCode != http.StatusOK {
			fmt.Println("Request failed with status code:", resp.StatusCode)
			return
		}
	
		// Read the response body
		body, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			fmt.Println("Error reading response body:", err)
			return
		}
	
		// Parse the response body
		var response Response
		err = json.Unmarshal(body, &response)
		if err != nil {
			fmt.Println("Error parsing response body:", err)
			return
		}
	
		// Access the parsed values
		fmt.Println("Signature:", response.Signature)
		fmt.Println("Block Number:", response.Block)
		fmt.Println("Status:", response.Status)
		fmt.Println("Msg:", response.Msg)
		
		returnValue := gin.H{
			"sig": response.Signature,
			"celcius": int(temperature),
			"block": response.Block,
		}

		// Return the response as JSON
		c.JSON(http.StatusOK, returnValue)

	})

	// listen
	router.Run(":8000")
}

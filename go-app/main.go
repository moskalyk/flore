package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/big"
	"net"
	"net/http"
	"os"
	"strconv"

	"github.com/0xsequence/go-sequence/indexer"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/oschwald/geoip2-golang"
	"github.com/twilio/twilio-go"
	twilioApi "github.com/twilio/twilio-go/rest/api/v2010"
)

type WeatherData struct {
	Main struct {
		Temperature float64 `json:"temp"`
	} `json:"main"`
}

type Response struct {
	Price     int    `json:"price"`
	Signature string `json:"sig"`
	Msg       string `json:"msg"`
	Status    int    `json:"status"`
	Block     int    `json:"block"`
}

type TemperatureRequest struct {
	Celsius int    `json:"celcius"`
	TokenID int    `json:"tokenID"`
	Address string `json:"address"`
}

type OrderPlacement struct {
	Price    int64  `json:"price"`
	Name     string `json:"name"`
	Street   string `json:"street"`
	City     string `json:"city"`
	Province string `json:"province"`
	Postal   string `json:"postal"`
	ID       int    `json:"id"`
	Address  string `json:"address"`
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

func sendOrderText(requestData OrderPlacement) {
	accountSid := os.Getenv("TWILIO_ACCOUNT_SID")
	authToken := os.Getenv("TWILIO_AUTH_TOKEN")

	client := twilio.NewRestClientWithParams(twilio.ClientParams{
		Username: accountSid,
		Password: authToken,
	})

	params := &twilioApi.CreateMessageParams{}
	params.SetTo(os.Getenv("DIGITS"))
	params.SetFrom("+16727020100")
	params.SetBody("Sequence Checkout order placed:" + requestData.Name + " " + requestData.Street + " " + requestData.City + " " + requestData.Postal + " " + requestData.Province + " for Token ID: " + fmt.Sprint(requestData.ID) + ", to Address:" + requestData.Address)

	resp, err := client.Api.CreateMessage(params)
	if err != nil {
		log.Println("Error sending SMS message: " + err.Error())
	} else {
		response, _ := json.Marshal(*resp)
		log.Println("Response: " + string(response))
	}
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
			"sig":     response.Signature,
			"celcius": int(temperature),
			"block":   response.Block,
		}

		// Return the response as JSON
		c.JSON(http.StatusOK, returnValue)

	})

	router.POST("/price", func(c *gin.Context) {

		var requestData struct {
			ID      int    `json:"id"`
			Address string `json:"address"`
		}

		// Bind the JSON body to the requestData struct
		if err := c.ShouldBindJSON(&requestData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Access the values from the JSON body
		log.Println(requestData.ID, requestData.Address)

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
			TokenID: requestData.ID,
			Address: requestData.Address,
		}

		// Convert the request body to JSON
		jsonBody, err := json.Marshal(requestBody)
		if err != nil {
			fmt.Println("Error marshaling JSON:", err)
			return
		}

		// Send the POST request
		url := "http://localhost:5000/sigWithID" // Replace with your API endpoint URL
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

		// // Parse the response body
		var response Response
		err = json.Unmarshal(body, &response)
		if err != nil {
			fmt.Println("Error parsing response body:", err)
			return
		}

		// // Access the parsed values
		fmt.Println("Signature:", response.Signature)
		fmt.Println("Block Number:", response.Block)
		fmt.Println("Status:", response.Status)
		fmt.Println("Msg:", response.Msg)

		returnValue := gin.H{
			"price":   response.Price,
			"sig":     response.Signature,
			"celcius": int(temperature),
			"block":   response.Block,
		}

		// Return the response as JSON
		// c.JSON(http.StatusOK, returnValue)
		c.JSON(http.StatusOK, returnValue)
	})

	router.POST("/order", func(c *gin.Context) {

		var requestData struct {
			Price    int64  `json:"price"`
			Name     string `json:"name"`
			Street   string `json:"street"`
			City     string `json:"city"`
			Province string `json:"province"`
			Postal   string `json:"postal"`
			ID       int    `json:"id"`
			Address  string `json:"address"`
		}

		// Bind the JSON body to the requestData struct
		if err := c.ShouldBindJSON(&requestData); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		seqIndexer := indexer.NewIndexerClient("https://polygon-indexer.sequence.app", http.DefaultClient)

		filter := &indexer.TransactionHistoryFilter{
			AccountAddress: &requestData.Address,
		}
		includeMetadata := true

		_, history, err := seqIndexer.GetTransactionHistory(context.Background(), filter, nil, &includeMetadata)
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println("transaction history:", history)

		sent := false
		for _, i := range history {
			for _, j := range i.Transfers {
				log.Println("%v \t", j.ContractAddress)
				log.Println("%v \t", j.To)
				log.Println("%v \t", j.Amounts)
				price := big.NewInt(requestData.Price)
				// if true && !sent {
				if !sent && j.ContractAddress == "0xdd0d8fee45c2d1ad1d39efcb494c8a1db4fde5b7" && j.To == "0xcc33ad129fa66c4688436b77e4a4eed2c90d86ee" && j.Amounts[0].Gte(price) {

					sendOrderText(requestData)

					sent = true

					returnValue := gin.H{
						"status": 200,
					}

					c.JSON(http.StatusOK, returnValue)
					break
				}
			}
		}

		returnValue := gin.H{
			"status": 400,
		}

		c.JSON(http.StatusNotFound, returnValue)
	})

	// router.POST("/order", func(c *gin.Context) {
	// 	var requestData struct {
	// 		Name     string `json:"name"`
	// 		Street   string `json:"street"`
	// 		City     string `json:"city"`
	// 		Province string `json:"province"`
	// 		Postal   string `json:"postal"`
	// 		ID       int    `json:"tokenID"`
	// 		Address  string `json:"address"`
	// 	}

	// 	// Bind the JSON body to the requestData struct
	// 	if err := c.ShouldBindJSON(&requestData); err != nil {
	// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	// 		return
	// 	}

	// 	// Access the values from the JSON body
	// 	log.Println(requestData.ID, requestData.Address)

	// 	returnValue := gin.H{
	// 		"status": 200,
	// 	}

	// 	// Return the response as JSON
	// 	// c.JSON(http.StatusOK, returnValue)
	// 	c.JSON(http.StatusOK, returnValue)
	// })

	// listen
	router.Run(":8000")
}

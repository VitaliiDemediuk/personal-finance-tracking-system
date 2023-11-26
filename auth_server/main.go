package main

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

var (
	secretKey    = []byte("your-secret-key") // Change this to a strong, unique secret key
	tokenExpTime = 15 * time.Minute            // Token expiration time
)

// User model
type User struct {
	gorm.Model
	Username    string
	Password    string
	FirstName   string
	LastName    string
	BirthDate   time.Time
	PhoneNumber string
}

// TokenDetails struct to hold access and refresh tokens
type TokenDetails struct {
	AccessToken   string
	RefreshToken  string
	AccessUUID    string
	RefreshUUID   string
	AccessExpires time.Time
	RefreshExpires time.Time
}

// ErrorResponse struct for returning error messages
type ErrorResponse struct {
	Message string `json:"message"`
}

var db *gorm.DB

func main() {
	// Initialize the database
	initDB()

	// Create Gin router
	r := gin.Default()

	// Routes
	r.POST("/register", register)
	r.POST("/login", login)
	r.POST("/token/refresh", refreshToken)

	// Protected route
	authGroup := r.Group("/api")
	authGroup.Use(authMiddleware)
	{
		authGroup.GET("/data", protectedRoute)
	}

	// Run the server
	r.Run(":9090")
}

// Initialize the SQLite database
func initDB() {
	var err error
	db, err = gorm.Open("sqlite3", "test.db")
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	db.AutoMigrate(&User{})
}

// Handle user registration
func register(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusUnprocessableEntity, ErrorResponse{Message: "Invalid JSON provided"})
		return
	}

	// Validate and parse birth date
	birthDate, err := time.Parse("2006-01-02", user.BirthDate.Format("2006-01-02"))

	if err != nil {
		c.JSON(http.StatusUnprocessableEntity, ErrorResponse{Message: "Invalid birth date format"})
		return
	}
	user.BirthDate = birthDate

	// Save the user to the database
	if err := saveUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Message: "Failed to register user"})
		return
	}

	// Respond with success
	c.JSON(http.StatusOK, gin.H{"message": "User registered successfully"})
}

// Handle user login
func login(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusUnprocessableEntity, ErrorResponse{Message: "Invalid JSON provided"})
		return
	}

	if err := authenticateUser(user.Username, user.Password); err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Message: "Invalid credentials"})
		return
	}

	// Create and send tokens
	tokens, err := createToken(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, ErrorResponse{Message: "Failed to create tokens"})
		return
	}

	c.JSON(http.StatusOK, tokens)
}

// Refresh access token
func refreshToken(c *gin.Context) {
	mapToken := map[string]string{}
	if err := c.ShouldBindJSON(&mapToken); err != nil {
		c.JSON(http.StatusUnprocessableEntity, ErrorResponse{Message: "Invalid JSON provided"})
		return
	}

	refreshToken := mapToken["refresh_token"]

	// Verify the refresh token
	token, err := jwt.Parse(refreshToken, func(token *jwt.Token) (interface{}, error) {
		return secretKey, nil
	})

	if err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Message: "Invalid refresh token"})
		return
	}

	// Check if the token is valid
	if _, ok := token.Claims.(jwt.Claims); !ok && !token.Valid {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Message: "Invalid refresh token"})
		return
	}

	// Extract user ID from the token
	claims, ok := token.Claims.(jwt.MapClaims)
	if ok && token.Valid {
		refreshUUID, ok := claims["refresh_uuid"].(string)
		if !ok {
			c.JSON(http.StatusUnprocessableEntity, ErrorResponse{Message: "Invalid refresh token"})
			return
		}

		// Delete the existing refresh token
		deleteRefreshToken(refreshUUID)

		// Create and send new tokens
		userID := uint(claims["user_id"].(float64))
		user := getUserByID(userID)
		if user == nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{Message: "Failed to get user details"})
			return
		}

		tokens, err := createToken(user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, ErrorResponse{Message: "Failed to create tokens"})
			return
		}

		c.JSON(http.StatusOK, tokens)
	} else {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Message: "Invalid refresh token"})
	}
}

// Middleware to authenticate requests
func authMiddleware(c *gin.Context) {
	tokenString := c.GetHeader("Authorization")

	// Check if token is present
	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Message: "Missing Authorization header"})
		c.Abort()
		return
	}

	// Verify the access token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return secretKey, nil
	})

	if err != nil {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Message: "Invalid token"})
		c.Abort()
		return
	}

	// Check if the token is valid
	if _, ok := token.Claims.(jwt.Claims); !ok && !token.Valid {
		c.JSON(http.StatusUnauthorized, ErrorResponse{Message: "Invalid token"})
		c.Abort()
		return
	}

	c.Next()
}

// Protected route accessible only with a valid access token
func protectedRoute(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "This is a protected route"})
}

// Authenticate user with username and password
func authenticateUser(username, password string) error {
	var user User
	if err := db.Where("username = ? AND password = ?", username, password).First(&user).Error; err != nil {
		return err
	}
	return nil
}

// Create access and refresh tokens
func createToken(user *User) (*TokenDetails, error) {
	// Create access token
	accessClaims := jwt.MapClaims{}
	accessClaims["authorized"] = true
	accessClaims["user_id"] = user.ID
	accessClaims["exp"] = time.Now().Add(tokenExpTime).Unix()
	accessClaims["iat"] = time.Now().Unix()
	accessUUID := generateUUID()
	accessClaims["access_uuid"] = accessUUID

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(secretKey)
	if err != nil {
		return nil, err
	}

	// Create refresh token
	refreshClaims := jwt.MapClaims{}
	refreshClaims["user_id"] = user.ID
	refreshClaims["exp"] = time.Now().Add(time.Hour * 24 * 7).Unix()
	refreshClaims["iat"] = time.Now().Unix()
	refreshUUID := generateUUID()
	refreshClaims["refresh_uuid"] = refreshUUID

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString(secretKey)
	if err != nil {
		return nil, err
	}

	// Store the refresh token in the database
	saveRefreshToken(refreshUUID, user.ID)

	// Create TokenDetails struct
	tokenDetails := &TokenDetails{
		AccessToken:   accessTokenString,
		RefreshToken:  refreshTokenString,
		AccessUUID:    accessUUID,
		RefreshUUID:   refreshUUID,
		AccessExpires: time.Unix(accessClaims["exp"].(int64), 0),
		RefreshExpires: time.Unix(refreshClaims["exp"].(int64), 0),
	}

	return tokenDetails, nil
}

// Save refresh token in the database
func saveRefreshToken(uuid string, userID uint) {
	db.Create(&RefreshToken{UserID: userID, Token: uuid})
}

// Delete refresh token from the database
func deleteRefreshToken(uuid string) {
	db.Where("token = ?", uuid).Delete(&RefreshToken{})
}

// Get user by ID
func getUserByID(userID uint) *User {
	var user User
	if err := db.First(&user, userID).Error; err != nil {
		return nil
	}
	return &user
}

// Generate a UUID (not RFC compliant)
func generateUUID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

func saveUser(user *User) error {
    if err := db.Create(user).Error; err != nil {
        return err
    }
    return nil
}

// RefreshToken model
type RefreshToken struct {
	gorm.Model
	UserID uint
	Token  string
}

package config

import (
	"log"
	"os"
	"strconv"

	"github.com/spf13/viper"
)

type Config struct {
	App struct {
		Name string
		Port string
	}
	Database struct {
		Dsn          string
		MaxIdleConns int
		MaxOpenConns int
	}
	Redis struct {
		Addr     string
		DB       int
		Password string
	}
	RAG struct {
		APIBase         string
		APIKey          string
		ChatModel       string
		EmbeddingModel  string
		EmbeddingDims   int
		TopK            int
		MaxContextChars int
		Temperature     float64
		Verbosity       string
	}
}

var AppConfig *Config

func InitConfig() {
	viper.SetConfigName("config")
	viper.SetConfigType("yml")
	viper.AddConfigPath("./config")

	if err := viper.ReadInConfig(); err != nil {
		log.Fatalf("Error reading config file :%v", err)
	}

	AppConfig = &Config{}

	if err := viper.Unmarshal(AppConfig); err != nil {
		log.Fatalf("Unable to decode into struct :%v", err)
	}

	if apiKey, ok := os.LookupEnv("EXCHANGEAPP_RAG_API_KEY"); ok {
		AppConfig.RAG.APIKey = apiKey
	}

	if apiBase, ok := os.LookupEnv("EXCHANGEAPP_RAG_API_BASE"); ok {
		AppConfig.RAG.APIBase = apiBase
	}

	if chatModel, ok := os.LookupEnv("EXCHANGEAPP_RAG_CHAT_MODEL"); ok {
		AppConfig.RAG.ChatModel = chatModel
	}

	if embeddingModel, ok := os.LookupEnv("EXCHANGEAPP_RAG_EMBEDDING_MODEL"); ok {
		AppConfig.RAG.EmbeddingModel = embeddingModel
	}

	if embeddingDims := os.Getenv("EXCHANGEAPP_RAG_EMBEDDING_DIMS"); embeddingDims != "" {
		if value, err := strconv.Atoi(embeddingDims); err == nil {
			AppConfig.RAG.EmbeddingDims = value
		}
	}

	if port := os.Getenv("EXCHANGEAPP_PORT"); port != "" {
		AppConfig.App.Port = port
	}

	if dsn := os.Getenv("EXCHANGEAPP_DATABASE_DSN"); dsn != "" {
		AppConfig.Database.Dsn = dsn
	}

	if maxIdle := os.Getenv("EXCHANGEAPP_DATABASE_MAX_IDLE_CONNS"); maxIdle != "" {
		if value, err := strconv.Atoi(maxIdle); err == nil {
			AppConfig.Database.MaxIdleConns = value
		}
	}

	if maxOpen := os.Getenv("EXCHANGEAPP_DATABASE_MAX_OPEN_CONNS"); maxOpen != "" {
		if value, err := strconv.Atoi(maxOpen); err == nil {
			AppConfig.Database.MaxOpenConns = value
		}
	}

	if redisAddr := os.Getenv("EXCHANGEAPP_REDIS_ADDR"); redisAddr != "" {
		AppConfig.Redis.Addr = redisAddr
	}

	if redisPassword := os.Getenv("EXCHANGEAPP_REDIS_PASSWORD"); redisPassword != "" {
		AppConfig.Redis.Password = redisPassword
	}

	if redisDB := os.Getenv("EXCHANGEAPP_REDIS_DB"); redisDB != "" {
		if value, err := strconv.Atoi(redisDB); err == nil {
			AppConfig.Redis.DB = value
		}
	}

	initDB()
	InitRedis()
}

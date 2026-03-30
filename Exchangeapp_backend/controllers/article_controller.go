package controllers

import (
	"encoding/json"
	"errors"
	"exchangeapp/global"
	"exchangeapp/models"
	"exchangeapp/services"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
	"gorm.io/gorm"
)

var cacheKey = "articles"

type articlePayload struct {
	Title   string `json:"title" binding:"required"`
	Content string `json:"content" binding:"required"`
	Preview string `json:"preview" binding:"required"`
}

func CreateArticle(ctx *gin.Context) {
	username := ctx.GetString("username")
	if username == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var payload articlePayload

	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	article := models.Article{
		Title:          payload.Title,
		Content:        payload.Content,
		Preview:        payload.Preview,
		AuthorUsername: username,
	}

	if err := global.Db.Create(&article).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := clearArticleCaches(article.ID); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, article)
}

func GetArticles(ctx *gin.Context) {
	cachedData, err := global.RedisDB.Get(cacheKey).Result()

	if err == redis.Nil {
		var articles []models.Article

		if err := global.Db.Find(&articles).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			} else {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			}
			return
		}

		articleJSON, err := json.Marshal(articles)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if err := global.RedisDB.Set(cacheKey, articleJSON, 10*time.Minute).Err(); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, articles)

	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	} else {
		var articles []models.Article
		if err := json.Unmarshal([]byte(cachedData), &articles); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, articles)
	}
}

func GetMyArticles(ctx *gin.Context) {
	username := ctx.GetString("username")
	if username == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var articles []models.Article
	if err := global.Db.Where("author_username = ?", username).Order("updated_at desc").Find(&articles).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, articles)
}

func GetArticlesByID(ctx *gin.Context) {
	id := ctx.Param("id")

	var article models.Article

	if err := global.Db.Where("id = ?", id).First(&article).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		} else {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}
	ctx.JSON(http.StatusOK, article)
}

func UpdateArticle(ctx *gin.Context) {
	username := ctx.GetString("username")
	if username == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	article, err := findOwnedArticle(ctx.Param("id"), username)
	if err != nil {
		handleArticleOwnershipError(ctx, err)
		return
	}

	var payload articlePayload
	if err := ctx.ShouldBindJSON(&payload); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	article.Title = payload.Title
	article.Content = payload.Content
	article.Preview = payload.Preview

	if err := global.Db.Save(&article).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := clearArticleCaches(article.ID); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, article)
}

func DeleteArticle(ctx *gin.Context) {
	username := ctx.GetString("username")
	if username == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	article, err := findOwnedArticle(ctx.Param("id"), username)
	if err != nil {
		handleArticleOwnershipError(ctx, err)
		return
	}

	if err := global.Db.Delete(&article).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := clearArticleCaches(article.ID); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "article deleted"})
}

func findOwnedArticle(id string, username string) (models.Article, error) {
	var article models.Article
	if err := global.Db.Where("id = ?", id).First(&article).Error; err != nil {
		return article, err
	}

	if article.AuthorUsername != username {
		return article, errors.New("forbidden")
	}

	return article, nil
}

func handleArticleOwnershipError(ctx *gin.Context, err error) {
	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		ctx.JSON(http.StatusNotFound, gin.H{"error": "article not found"})
	case err != nil && err.Error() == "forbidden":
		ctx.JSON(http.StatusForbidden, gin.H{"error": "you can only manage your own articles"})
	default:
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
	}
}

func clearArticleCaches(articleID uint) error {
	keys := []string{cacheKey}
	if articleID > 0 {
		keys = append(keys, likeCacheKey(articleID))
	}

	if err := global.RedisDB.Del(keys...).Err(); err != nil {
		return err
	}

	services.RAG.Invalidate()
	return nil
}

func likeCacheKey(articleID uint) string {
	return "article:" + strconv.FormatUint(uint64(articleID), 10) + ":likes"
}

package controllers

import (
	"exchangeapp/global"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis"
)

func LikeArticle(ctx *gin.Context) {
	articleID := ctx.Param("id")

	likeKey := likeKeyFromParam(articleID)
	if err := global.RedisDB.Incr(likeKey).Err(); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "Successfully liked the article"})

}

func GetArticleLikes(ctx *gin.Context) {
	articleID := ctx.Param("id")

	likeKey := likeKeyFromParam(articleID)
	likes, err := global.RedisDB.Get(likeKey).Result()

	if err == redis.Nil {
		likes = "0"
	} else if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"likes": likes})
}

func likeKeyFromParam(articleID string) string {
	if parsedID, err := strconv.ParseUint(articleID, 10, 64); err == nil {
		return likeCacheKey(uint(parsedID))
	}
	return "article:" + articleID + ":likes"
}

package controllers

import (
	"exchangeapp/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type assistantChatRequest struct {
	Question string                      `json:"question" binding:"required"`
	History  []services.AssistantMessage `json:"history"`
}

func AssistantChat(ctx *gin.Context) {
	var request assistantChatRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	reply, err := services.RAG.AnswerQuestion(ctx.Request.Context(), request.Question, request.History)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, reply)
}

func AssistantStatus(ctx *gin.Context) {
	status, err := services.RAG.Status(ctx.Request.Context())
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, status)
}

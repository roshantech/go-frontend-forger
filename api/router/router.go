package router

import (
	"forge/api/handlers"
	"forge/api/middleware"

	"github.com/gofiber/fiber/v2"
	"go.uber.org/zap"
)

type Deps struct {
	AuthHandler *handlers.AuthHandler
	ASTHandler  *handlers.ASTHandler
	JWTSecret   string
	Logger      *zap.Logger
}

func Setup(deps *Deps) *fiber.App {
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{"error": err.Error(), "code": "INTERNAL_ERROR"})
		},
	})

	api := app.Group("/api")

	// Public auth routes
	auth := api.Group("/auth")
	auth.Post("/register", deps.AuthHandler.Register)
	auth.Post("/login", deps.AuthHandler.Login)
	auth.Post("/forgot-password", deps.AuthHandler.ForgotPassword)
	auth.Post("/reset-password", deps.AuthHandler.ResetPassword)

	// AST inspection (public — file upload, no auth needed)
	astGroup := api.Group("/ast")
	astGroup.Post("/inspect", deps.ASTHandler.Inspect)
	astGroup.Post("/inspect-raw", deps.ASTHandler.InspectRaw)

	// Protected routes
	protected := api.Group("", middleware.JWTMiddleware(deps.JWTSecret))
	protected.Get("/auth/me", deps.AuthHandler.GetMe)

	return app
}

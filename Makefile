.PHONY: help build up down logs clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

build: ## Build all Docker images
	docker compose build

up: ## Start development environment
	docker compose up -d

down: ## Stop development environment
	docker compose down

logs: ## Show logs from all services
	docker compose logs -f

logs-backend: ## Show backend logs
	docker compose logs -f backend

logs-frontend: ## Show frontend logs
	docker compose logs -f frontend

logs-nginx: ## Show nginx logs
	docker compose logs -f nginx

prod-up: ## Start production environment
	docker compose -f docker-compose.prod.yml up -d

prod-down: ## Stop production environment
	docker compose -f docker-compose.prod.yml down

prod-build: ## Build production images
	docker compose -f docker-compose.prod.yml build

prod-logs: ## Show production logs
	docker compose -f docker-compose.prod.yml logs -f

prod-logs-backend: ## Show production backend logs
	docker compose -f docker-compose.prod.yml logs -f backend

prod-logs-frontend: ## Show production frontend logs
	docker compose -f docker-compose.prod.yml logs -f frontend

prod-logs-nginx: ## Show production nginx logs
	docker compose -f docker-compose.prod.yml logs -f nginx

clean: ## Remove all containers and images
	docker compose down -v --rmi all --remove-orphans

restart: down up ## Restart development environment
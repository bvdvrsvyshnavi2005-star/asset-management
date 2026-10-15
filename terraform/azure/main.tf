terraform {
  required_version = ">= 1.6"
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 4.0" }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

resource "azurerm_resource_group" "rg" {
  name     = "${var.project}-rg"
  location = var.location
}

resource "azurerm_service_plan" "plan" {
  name                = "${var.project}-plan"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux"
  sku_name            = "B1"
}

# Runs the backend container image. Push the image to a registry first and set var.backend_image.
resource "azurerm_linux_web_app" "api" {
  name                = "${var.project}-api-${var.suffix}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.plan.id
  https_only          = true

  site_config {
    application_stack {
      docker_image_name   = var.backend_image
      docker_registry_url = var.registry_url
    }
  }

  app_settings = {
    WEBSITES_PORT = "5001"
    NODE_ENV      = "production"
    # Set MONGO_URI and JWT_SECRET from Key Vault references or the portal - never hardcode them here.
  }
}

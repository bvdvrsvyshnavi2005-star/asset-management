variable "subscription_id" { type = string }
variable "location" {
  type    = string
  default = "westeurope"
}
variable "project" {
  type    = string
  default = "it-asset-manager"
}
variable "suffix" {
  type        = string
  description = "Short unique string - App Service names are globally unique."
}
variable "registry_url" {
  type    = string
  default = "https://index.docker.io"
}
variable "backend_image" {
  type        = string
  description = "e.g. youruser/it-asset-manager-backend:latest"
}

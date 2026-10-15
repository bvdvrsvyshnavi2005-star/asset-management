output "api_url" {
  value = "https://${azurerm_linux_web_app.api.default_hostname}"
}

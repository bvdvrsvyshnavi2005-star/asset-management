variable "region" {
  type    = string
  default = "us-east-1"
}

variable "project" {
  type    = string
  default = "it-asset-manager"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "admin_cidr" {
  type        = string
  description = "CIDR allowed to SSH, e.g. 203.0.113.4/32. Never use 0.0.0.0/0."
}

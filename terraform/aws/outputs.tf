output "api_public_ip" {
  value = aws_instance.api.public_ip
}

output "frontend_bucket" {
  value = aws_s3_bucket.frontend.bucket
}

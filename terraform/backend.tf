terraform {
  backend "s3" {
    bucket = "qmkdesign-frontend-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}

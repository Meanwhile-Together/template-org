# Terraform Cloud backend configuration
# For local development, comment out the cloud block and use local backend
# Note: Backend configuration cannot use variables - values must be provided via
# -backend-config flags or backend configuration files
terraform {
  # Uncomment and configure for Terraform Cloud
  # Values should be provided via -backend-config during terraform init
  # Example: terraform init -backend-config="organization=your-org" -backend-config="workspaces.name=staging"
  # cloud {
  #   organization = "your-org"
  #   workspaces {
  #     name = "staging"
  #   }
  # }

  # Local backend (default)
  backend "local" {
    path = "terraform.tfstate"
  }
}

variable "environment" {
  description = "Environment name (staging or production)"
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

variable "railway_token" {
  description = "Railway ACCOUNT token - for creating projects. Get from https://railway.app/account/tokens. Set via RAILWAY_TOKEN env var."
  type        = string
  sensitive   = true
}

variable "railway_project_token" {
  description = "Optional project token for non-Terraform tooling (Railway CLI, CI). Terraform uses railway_token only."
  type        = string
  sensitive   = true
  default     = ""
}

variable "railway_owner_project_id" {
  description = "Existing Railway project ID for this deploy (optional). When empty, Terraform may create a project named from app.owner."
  type        = string
  default     = ""
}

variable "railway_service_id_staging" {
  description = "Railway app service ID for staging (optional - will create if not provided)"
  type        = string
  default     = ""
}

variable "railway_service_id_production" {
  description = "Railway app service ID for production (optional - will create if not provided)"
  type        = string
  default     = ""
}

variable "railway_create_db_service" {
  description = "Whether Terraform creates an empty Railway service named \"db\" (layout only). Does not install PostgreSQL; add Postgres via Railway UI and wire DATABASE_URL to each app service — see docs/RAILWAY_DATABASE.md"
  type        = bool
  default     = false
}

variable "railway_db_service_id" {
  description = "Existing Railway db service ID (optional - will create if not provided and create_db_service is true)"
  type        = string
  default     = ""
}

variable "railway_workspace_id" {
  description = "Railway workspace ID (REQUIRED for project creation). Resolved automatically from app.owner (Railway API workspace name match) by apply.sh/destroy.sh/setup.sh when not set in env."
  type        = string
}

variable "terraform_cloud_organization" {
  description = "Terraform Cloud organization name (not used in backend, only for reference)"
  type        = string
  default     = ""
}

variable "terraform_cloud_workspace" {
  description = "Terraform Cloud workspace name (not used in backend, only for reference)"
  type        = string
  default     = ""
}

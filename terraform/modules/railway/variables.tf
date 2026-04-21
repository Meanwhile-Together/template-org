variable "service_name_base" {
  description = "Base name for app services (e.g. project-bridge); services will be <base>-staging and <base>-production"
  type        = string
}

variable "service_id_staging" {
  description = "Existing Railway app service ID for staging (optional - will create if not provided)"
  type        = string
  default     = ""
}

variable "service_id_production" {
  description = "Existing Railway app service ID for production (optional - will create if not provided)"
  type        = string
  default     = ""
}

variable "owner_project_id" {
  description = "Railway project ID (REQUIRED - must match the project from module.railway_owner)"
  type        = string
}

variable "db_service_id" {
  description = "Railway db service ID (for reference, app service will connect via Railway networking)"
  type        = string
  default     = ""
}

variable "environment" {
  description = "Environment name (staging or production) - used to deploy to correct Railway environment"
  type        = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "Environment must be either 'staging' or 'production'."
  }
}

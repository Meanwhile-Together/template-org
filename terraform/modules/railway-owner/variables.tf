variable "owner_name" {
  description = "Owner name (used for Railway project name)"
  type        = string
}

variable "owner_project_id" {
  description = "Existing Railway project ID for this deploy (optional). When empty, Terraform may create a project named from app.owner."
  type        = string
  default     = ""
}

variable "railway_token" {
  description = "Railway ACCOUNT token - for project creation only"
  type        = string
  sensitive   = true
}

variable "railway_project_token" {
  description = "Railway PROJECT token - for service creation, queries, and deploys (selects project + environment)"
  type        = string
  sensitive   = true
}

variable "workspace_id" {
  description = "Railway workspace ID (REQUIRED for project creation)"
  type        = string
}

variable "environment" {
  description = "Environment name (staging or production) — kept for provider compatibility"
  type        = string
}

variable "create_db_service" {
  description = "Whether to create a separate db service (default false)"
  type        = bool
  default     = false
}

variable "db_service_id" {
  description = "Existing db service ID (optional - will create if not provided and create_db_service is true)"
  type        = string
  default     = ""
}

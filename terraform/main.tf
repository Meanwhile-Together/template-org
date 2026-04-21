# Read app config from config/app.json
data "local_file" "app_config" {
  filename = "${path.module}/../config/app.json"
}

# Read platform array from config/deploy.json
data "local_file" "deploy_config" {
  filename = "${path.module}/../config/deploy.json"
}

locals {
  app_config    = jsondecode(data.local_file.app_config.content)
  deploy_config = jsondecode(data.local_file.deploy_config.content)
  platforms     = try(local.deploy_config.platform, [])

  # Check which platforms to provision (Railway only)
  has_railway = contains(local.platforms, "railway")

  # Get app name from app.json (use slug if available, otherwise name)
  app_name         = try(local.app_config.app.slug, try(local.app_config.app.name, "app"))
  project_id       = replace(lower(local.app_name), "/[^a-z0-9]+/", "-")
  project_id_clean = replace(local.project_id, "/^-+|-+$/", "")

  # Get owner from app.json (fall back to deploy.json for backwards compatibility)
  owner_name = try(local.app_config.app.owner, try(local.deploy_config.owner, ""))

  # Project token for service operations (use project token if set, fallback to account token)
  # Note: Project token is required for service creation, queries, and deploys
  # Account token is only for project creation
  railway_project_token = var.railway_project_token != "" ? var.railway_project_token : var.railway_token
}

# Railway project module (conditional)
# Project + optional db; app services live in module.railway_app (unified server per env).
module "railway_owner" {
  count  = local.has_railway ? 1 : 0
  source = "./modules/railway-owner"

  owner_name            = local.owner_name != "" ? local.owner_name : "default-owner"
  owner_project_id      = var.railway_owner_project_id
  railway_token         = var.railway_token
  railway_project_token = local.railway_project_token
  workspace_id          = var.railway_workspace_id
  environment           = var.environment
  create_db_service     = var.railway_create_db_service
  db_service_id         = var.railway_db_service_id
}

# Railway app service module (conditional)
# Creates app-staging and app-production services in that Railway project
module "railway_app" {
  count  = local.has_railway ? 1 : 0
  source = "./modules/railway"

  owner_project_id      = local.has_railway && length(module.railway_owner) > 0 ? module.railway_owner[0].project_id : ""
  db_service_id         = local.has_railway && length(module.railway_owner) > 0 ? module.railway_owner[0].db_service_id : ""
  service_name_base     = local.project_id_clean
  service_id_staging    = var.railway_service_id_staging
  service_id_production = var.railway_service_id_production
  environment           = var.environment
}

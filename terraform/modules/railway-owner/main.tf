# Railway project module (resource: railway_project.owner)
#
# One Railway project per Terraform state / deploy root. When RAILWAY_PROJECT_ID is set,
# apply.sh imports that project so Terraform tracks it without creating a duplicate.
#
# Railway layout (unified server):
# - Project: named from var.owner_name (usually app.owner) when Terraform creates it;
#   otherwise the project is the one imported from apply.sh / .env.
# - Services: "{slug}-staging", "{slug}-production" (from module.railway_app)
# - Optional: "db" when create_db_service is true
#
# Legacy "backend-staging" / "backend-production" services are no longer created;
# the unified server build deploys to the app services only.

locals {
  use_existing_db = var.db_service_id != ""
}

# Always exactly one project resource. When an existing project ID is passed,
# apply.sh imports it before apply so this resource tracks that project.
resource "railway_project" "owner" {
  count        = 1
  name         = var.owner_name
  workspace_id = var.workspace_id

  lifecycle {
    prevent_destroy = true
  }
}

locals {
  project_id = railway_project.owner[0].id
}

# Optional separate db service (disabled by default; Postgres often attached to the app service instead)
resource "railway_service" "db" {
  count      = var.create_db_service && !local.use_existing_db ? 1 : 0
  project_id = local.project_id
  name       = "db"

  depends_on = [railway_project.owner[0]]

  lifecycle {
    prevent_destroy = true
  }
}

locals {
  db_service_id = local.use_existing_db ? var.db_service_id : (length(railway_service.db) > 0 ? railway_service.db[0].id : "")
}

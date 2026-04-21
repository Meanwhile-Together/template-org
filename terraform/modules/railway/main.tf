# Railway App Service Module
#
# Creates two app services (staging and production) in that Railway project
# so both environments exist and are not renamed/destroyed when switching env.

locals {
  use_existing_staging = var.service_id_staging != ""
  use_existing_prod    = var.service_id_production != ""
}

resource "railway_service" "app_staging" {
  count      = !local.use_existing_staging ? 1 : 0
  project_id = var.owner_project_id
  name       = "${var.service_name_base}-staging"

  lifecycle {
    prevent_destroy = true
  }
}

resource "railway_service" "app_production" {
  count      = !local.use_existing_prod ? 1 : 0
  project_id = var.owner_project_id
  name       = "${var.service_name_base}-production"

  lifecycle {
    prevent_destroy = true
  }
}

locals {
  service_id_staging    = local.use_existing_staging ? var.service_id_staging : (length(railway_service.app_staging) > 0 ? railway_service.app_staging[0].id : "")
  service_id_production = local.use_existing_prod ? var.service_id_production : (length(railway_service.app_production) > 0 ? railway_service.app_production[0].id : "")
  service_name_staging  = "${var.service_name_base}-staging"
  service_name_production = "${var.service_name_base}-production"
}

# Note: Database connection is via Railway service networking
# The app service connects to the shared DB service (created by railway-owner module)
# Railway automatically provides environment variables for services in the same project:
# - DB_SERVICE_URL, DB_SERVICE_PORT (if service is named "db")
# - For Postgres plugin on db service: DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
# The app service should construct its database connection string using these variables

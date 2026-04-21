output "project_id" {
  description = "Railway project ID"
  value       = local.project_id
}

output "project_name" {
  description = "Railway project name"
  value       = railway_project.owner[0].name
}

# Kept for compatibility with older scripts; unified server does not use separate backend services.
output "backend_staging_service_id" {
  description = "Deprecated: always empty (unified server uses app-staging only)"
  value       = ""
}

output "backend_production_service_id" {
  description = "Deprecated: always empty (unified server uses app-production only)"
  value       = ""
}

output "db_service_id" {
  description = "Railway db service ID (empty if create_db_service is false)"
  value       = local.db_service_id
}

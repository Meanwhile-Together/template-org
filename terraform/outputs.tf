# Railway outputs (conditional)
output "railway_owner_project_id" {
  description = "Railway project ID"
  value       = local.has_railway && length(module.railway_owner) > 0 ? module.railway_owner[0].project_id : null
}

output "railway_owner_project_name" {
  description = "Railway project name"
  value       = local.has_railway && length(module.railway_owner) > 0 ? module.railway_owner[0].project_name : null
}

output "railway_backend_staging_service_id" {
  description = "Deprecated: unified server — always empty; use railway_app_service_id_staging"
  value       = local.has_railway && length(module.railway_owner) > 0 ? module.railway_owner[0].backend_staging_service_id : null
}

output "railway_backend_production_service_id" {
  description = "Deprecated: unified server — always empty; use railway_app_service_id_production"
  value       = local.has_railway && length(module.railway_owner) > 0 ? module.railway_owner[0].backend_production_service_id : null
}

output "railway_db_service_id" {
  description = "Railway db service ID (empty if create_db_service is false)"
  value       = local.has_railway && length(module.railway_owner) > 0 ? module.railway_owner[0].db_service_id : null
}

output "railway_app_service_id_staging" {
  description = "Railway app service ID (staging)"
  value       = local.has_railway && length(module.railway_app) > 0 ? module.railway_app[0].service_id_staging : null
}

output "railway_app_service_id_production" {
  description = "Railway app service ID (production)"
  value       = local.has_railway && length(module.railway_app) > 0 ? module.railway_app[0].service_id_production : null
}

output "railway_app_service_name_staging" {
  description = "Railway app service name (staging)"
  value       = local.has_railway && length(module.railway_app) > 0 ? module.railway_app[0].service_name_staging : null
}

output "railway_app_service_name_production" {
  description = "Railway app service name (production)"
  value       = local.has_railway && length(module.railway_app) > 0 ? module.railway_app[0].service_name_production : null
}

output "railway_project_id" {
  description = "Railway project ID (for railway up / CLI)"
  value       = local.has_railway && length(module.railway_owner) > 0 ? module.railway_owner[0].project_id : null
}

# Legacy: prefer railway_app_service_id_staging / railway_app_service_id_production; deploy step reads env-specific output
output "railway_service_id" {
  description = "Railway app service ID (staging fallback for backward compat; use railway_app_service_id_staging/production)"
  value       = local.has_railway && length(module.railway_app) > 0 ? module.railway_app[0].service_id_staging : null
}

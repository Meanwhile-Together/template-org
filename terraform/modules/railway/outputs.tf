output "service_id_staging" {
  description = "Railway app service ID (staging)"
  value       = local.service_id_staging
}

output "service_id_production" {
  description = "Railway app service ID (production)"
  value       = local.service_id_production
}

output "service_name_staging" {
  description = "Railway app service name (staging)"
  value       = local.service_name_staging
}

output "service_name_production" {
  description = "Railway app service name (production)"
  value       = local.service_name_production
}

output "owner_project_id" {
  description = "Railway project ID"
  value       = var.owner_project_id
}

output "db_service_id" {
  description = "Railway db service ID (for reference)"
  value       = var.db_service_id
}

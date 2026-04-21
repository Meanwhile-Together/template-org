# Account token only for Terraform. Project tokens are for deploy/CLI; using
# them here breaks `railway_project` refresh with "project Not Authorized".
provider "railway" {
  token = var.railway_token
}

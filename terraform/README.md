# Terraform Infrastructure as Code

This directory contains Terraform configuration for provisioning infrastructure (Railway) for the project.

## Structure

```
terraform/
├── main.tf              # Root module - orchestrates Railway resources
├── variables.tf          # Input variables
├── outputs.tf            # Output values for GitHub Actions
├── providers.tf          # Provider configurations
├── versions.tf           # Terraform and provider version constraints
├── backend.tf            # Backend configuration (Terraform Cloud or local)
├── modules/
│   └── railway/          # Railway service module
└── environments/
    ├── staging/          # Staging-specific configuration
    └── production/       # Production-specific configuration
```

## Prerequisites

1. **Terraform**: Install Terraform >= 1.5.0
2. **Terraform Cloud** (optional, for remote state)

## Setup

### 1. Configure Variables

Set environment variables or use `terraform.tfvars`:

```bash
export TF_VAR_app_name="My Application"
export TF_VAR_environment="staging"
export TF_VAR_railway_token="$RAILWAY_TOKEN"  # Account/team token, not project token
export TF_VAR_railway_service_id="$RAILWAY_SERVICE_ID"  # Optional: for existing services
```

### 2. Initialize and Apply

**Recommended:**
```bash
cd terraform
./apply.sh staging
```

This script reads `config/deploy.json`, checks for `RAILWAY_TOKEN`, and runs Terraform plan/apply.

**Manual:**
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## Platform Configuration

Deployment uses Railway only. `config/deploy.json` should have:

```json
{ "platform": ["railway"], ... }
```

## Railway Token Requirements

- Use an **account/team token** (not a project token) to create projects.
- Set `RAILWAY_TOKEN` from https://railway.app/account/tokens
- The `apply.sh` script can fetch your default workspace ID from the Railway API if `RAILWAY_WORKSPACE_ID` is not set.

## Railway Module

Manages Railway service references (no full provisioning - manual setup may be required).

**Outputs:** `service_id`, `service_name`

## Troubleshooting

- **Backend**: If Terraform Cloud fails, use local backend (comment out cloud block in `backend.tf`).
- **Token**: Ensure `RAILWAY_TOKEN` is an account/team token.

## GitHub Actions

Terraform is used by:
- `.github/workflows/03-deploy-staging.yml`
- `.github/workflows/04-deploy-production.yml`

Required secrets: `TF_API_TOKEN`, `TF_CLOUD_ORGANIZATION`, `TF_CLOUD_WORKSPACE_*`, `RAILWAY_TOKEN`.

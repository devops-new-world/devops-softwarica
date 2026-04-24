# Kubernetes Cluster Terraform Configuration

This Terraform configuration creates a Kubernetes cluster infrastructure on AWS with:

- 1 Master node
- Configurable number of worker nodes (default: 2)
- Security group with configurable ports (SSH, 6443, 443, 80)

## Prerequisites

1. AWS CLI configured with credentials
2. Terraform installed (>= 1.0)
3. An SSH key pair (public and private key) - the public key will be uploaded to AWS automatically

## Usage

1. **Copy the example variables file:**

   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit `terraform.tfvars` with your values:**
   - Update `ami_id` with the Ubuntu AMI ID for your region
   - Set `public_key_file` to the path of your SSH public key (e.g., `~/.ssh/id_rsa.pub`)
     - OR provide `public_key_inline` with the public key content as a string
   - Adjust `worker_count` to change the number of worker nodes
   - Modify security group CIDR blocks for better security

3. **Initialize Terraform:**

   ```bash
   terraform init
   ```

4. **Review the plan:**

   ```bash
   terraform plan
   ```

5. **Apply the configuration:**

   ```bash
   terraform apply
   ```

6. **Get outputs (IPs, SSH commands):**
   ```bash
   terraform output
   ```

## SSH Key Configuration

The Terraform configuration automatically creates an AWS Key Pair from your SSH public key. You can provide the public key in two ways:

**Option 1: From a file (recommended)**

```hcl
public_key_file = "~/.ssh/id_rsa.pub"
```

**Option 2: Inline**

```hcl
public_key_inline = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC..."
```

**Note**: The corresponding private key is needed to SSH into the instances after they are created. Make sure you have access to the private key file.

## Variables

- `public_key_file`: Path to SSH public key file (takes precedence over `public_key_inline`)
- `public_key_inline`: SSH public key as inline string (used if `public_key_file` is not provided)
- `worker_count`: Number of worker nodes (default: 2, total machines = 1 + worker_count)
- `allowed_ssh_cidr`: CIDR blocks for SSH (port 22)
- `allowed_k8s_api_cidr`: CIDR blocks for Kubernetes API (port 6443)
- `allowed_https_cidr`: CIDR blocks for HTTPS (port 443)
- `allowed_http_cidr`: CIDR blocks for HTTP (port 80)

## Security Notes

⚠️ **Important**: The default CIDR blocks (`0.0.0.0/0`) allow access from anywhere. For production use, restrict these to:

- Your IP address for SSH: `["YOUR_IP/32"]`
- Your VPC CIDR for internal ports: `["10.0.0.0/16"]`

## Finding Ubuntu AMI ID

To find the Ubuntu 22.04 LTS AMI ID for your region:

```bash
aws ec2 describe-images \
  --owners 099720109477 \
  --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
            "Name=state,Values=available" \
  --query "Images | sort_by(@, &CreationDate) | [-1].ImageId" \
  --output text \
  --region us-east-1
```

Replace `us-east-1` with your desired region.

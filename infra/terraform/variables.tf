variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name prefix for resources"
  type        = string
  default     = "demo-k8s"
}

variable "vm_type" {
  description = "Type of VM to create. Options: 'cluster' (k8s master/worker) or 'general' (single VM with docker)"
  type        = string
  default     = "cluster"
  
  validation {
    condition     = contains(["cluster", "general"], var.vm_type)
    error_message = "vm_type must be either 'cluster' or 'general'."
  }
}

variable "ami_id" {
  description = "AMI ID for the instances (Ubuntu recommended)"
  type        = string
  default     = "ami-0ecb62995f68bb549"
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "public_key_file" {
  description = "Path to the SSH public key file (e.g., ~/.ssh/id_rsa.pub). If provided, this takes precedence over public_key_inline"
  type        = string
  default     = ""
}

variable "public_key_inline" {
  description = "SSH public key as inline string (e.g., 'ssh-rsa AAAAB3...'). Used if public_key_file is not provided"
  type        = string
  default     = ""
}

variable "server_count" {
  description = "Number of server nodes to create"
  type        = number
  default     = 2
}

variable "disk_size" {
  description = "Root disk size in GB"
  type        = number
  default     = 30
}

variable "allowed_ssh_cidr" {
  description = "CIDR blocks allowed for SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Change this to your IP for security
}

variable "allowed_k8s_api_cidr" {
  description = "CIDR blocks allowed for Kubernetes API (6443)"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Change this to your IP or VPC CIDR for security
}

variable "allowed_https_cidr" {
  description = "CIDR blocks allowed for HTTPS (443)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "allowed_http_cidr" {
  description = "CIDR blocks allowed for HTTP (80)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}


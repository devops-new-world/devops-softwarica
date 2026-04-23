terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Random suffix for unique resource names
resource "random_id" "suffix" {
  byte_length = 4
}

# Read public key from file if provided, otherwise use inline
locals {
  public_key = var.public_key_file != "" ? file(var.public_key_file) : var.public_key_inline
}

# Create AWS Key Pair from public key
resource "aws_key_pair" "k8s_key" {
  count      = var.vm_type == "cluster" ? 1 : 0
  key_name   = "${var.project_name}-key-${random_id.suffix.hex}"
  public_key = local.public_key

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.project_name}-key-${random_id.suffix.hex}"
  }
}

# Security Group for Kubernetes nodes
resource "aws_security_group" "k8s_sg" {
  name        = "${var.project_name}-k8s-sg-${random_id.suffix.hex}"
  description = "Security group for Kubernetes master and worker nodes"

  # SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidr
    description = "SSH"
  }

  # Kubernetes API Server
  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = var.allowed_k8s_api_cidr
    description = "Kubernetes API Server"
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = var.allowed_https_cidr
    description = "HTTPS"
  }

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.allowed_http_cidr
    description = "HTTP"
  }

  # Allow all traffic between nodes in the same security group
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    self      = true
    description = "Internal node communication"
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name = "${var.project_name}-k8s-sg-${random_id.suffix.hex}"
  }
}

# Master Node
resource "aws_instance" "master" {
  count = var.vm_type == "cluster" ? 1 : 0

  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = length(aws_key_pair.k8s_key) > 0 ? aws_key_pair.k8s_key[0].key_name : ""
  vpc_security_group_ids = [aws_security_group.k8s_sg.id]

  root_block_device {
    volume_size = var.disk_size
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              hostnamectl set-hostname ${var.project_name}-m${count.index + 1}
              echo "127.0.0.1 ${var.project_name}-m${count.index + 1}" >> /etc/hosts
              EOF

  tags = {
    Name  = "${var.project_name}-master-${count.index + 1}"
    Role  = "master"
    Type  = "k8s-master"
  }
}

# Server Nodes
resource "aws_instance" "server" {
  count = var.vm_type == "cluster" ? var.server_count : 0

  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = length(aws_key_pair.k8s_key) > 0 ? aws_key_pair.k8s_key[0].key_name : ""
  vpc_security_group_ids = [aws_security_group.k8s_sg.id]

  root_block_device {
    volume_size = var.disk_size
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              hostnamectl set-hostname ${var.project_name}-s${count.index + 1}
              echo "127.0.0.1 ${var.project_name}-s${count.index + 1}" >> /etc/hosts
              EOF

  tags = {
    Name  = "${var.project_name}-server-${count.index + 1}"
    Role  = "server"
    Type  = "k8s-server"
  }
}

# General VM
resource "aws_instance" "general" {
  count = var.vm_type == "general" ? 1 : 0

  ami                    = var.ami_id
  instance_type          = var.instance_type
  vpc_security_group_ids = [aws_security_group.k8s_sg.id]

  root_block_device {
    volume_size = var.disk_size
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              # Add Docker's official GPG key:
              sudo apt-get update
              sudo apt-get install -y ca-certificates curl
              sudo install -m 0755 -d /etc/apt/keyrings
              sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
              sudo chmod a+r /etc/apt/keyrings/docker.asc
              
              # Add the repository to Apt sources:
              echo \
                "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
                $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
                sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
              sudo apt-get update
              
              sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
              sudo apt-get install -y npm
              sudo usermod -aG docker ubuntu
              
              # Enable password authentication
              sed -i 's/^PasswordAuthentication\s*no/PasswordAuthentication yes/' /etc/ssh/sshd_config.d/*
              sed -i 's/^PasswordAuthentication\s*no/PasswordAuthentication yes/' /etc/ssh/sshd_config || true
              systemctl restart sshd || true
              systemctl restart ssh || true
              
              echo -e "changeme\nchangeme" | sudo -S passwd ubuntu
              
              hostnamectl set-hostname ${var.project_name}-general
              echo "127.0.0.1 ${var.project_name}-general" >> /etc/hosts
              EOF

  tags = {
    Name  = "${var.project_name}-general"
    Role  = "general"
    Type  = "general-vm"
  }
}

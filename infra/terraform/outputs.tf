output "master_public_ip" {
  description = "Public IP address of the master node"
  value       = length(aws_instance.master) > 0 ? aws_instance.master[0].public_ip : null
}

output "master_private_ip" {
  description = "Private IP address of the master node"
  value       = length(aws_instance.master) > 0 ? aws_instance.master[0].private_ip : null
}

output "server_public_ips" {
  description = "Public IP addresses of server nodes"
  value       = length(aws_instance.server) > 0 ? aws_instance.server[*].public_ip : null
}

output "server_private_ips" {
  description = "Private IP addresses of server nodes"
  value       = length(aws_instance.server) > 0 ? aws_instance.server[*].private_ip : null
}

output "key_pair_name" {
  description = "Name of the created AWS Key Pair"
  value       = length(aws_key_pair.k8s_key) > 0 ? aws_key_pair.k8s_key[0].key_name : null
}

output "master_ssh_command" {
  description = "SSH command to connect to master node (update with your private key path)"
  value       = length(aws_instance.master) > 0 ? "ssh -i <path-to-your-private-key> ubuntu@${aws_instance.master[0].public_ip}" : null
}

output "server_ssh_commands" {
  description = "SSH commands to connect to server nodes (update with your private key path)"
  value       = length(aws_instance.server) > 0 ? [for i, ip in aws_instance.server[*].public_ip : "ssh -i <path-to-your-private-key> ubuntu@${ip}"] : null
}

output "general_vm_public_ip" {
  description = "Public IP of the general VM"
  value       = length(aws_instance.general) > 0 ? aws_instance.general[0].public_ip : null
}

output "general_vm_ssh_command" {
  description = "SSH command to connect to general VM using password (password: changeme)"
  value       = length(aws_instance.general) > 0 ? "ssh ubuntu@${aws_instance.general[0].public_ip}" : null
}

output "security_group_id" {
  description = "Security group ID"
  value       = aws_security_group.k8s_sg.id
}


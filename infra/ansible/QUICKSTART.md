# Quick Start Guide

## Minimal Setup (3 nodes: 1 master + 2 workers)

### 1. Edit `inventory.yml`:

```yaml
all:
  children:
    k8s_master:
      hosts:
        master-node:
          ansible_host: YOUR_MASTER_IP
          ansible_user: ubuntu
          ansible_ssh_private_key_file: ~/.ssh/your-key.pem
    
    k8s_workers:
      hosts:
        worker-node-1:
          ansible_host: WORKER_1_IP
          ansible_user: ubuntu
          ansible_ssh_private_key_file: ~/.ssh/your-key.pem
        worker-node-2:
          ansible_host: WORKER_2_IP
          ansible_user: ubuntu
          ansible_ssh_private_key_file: ~/.ssh/your-key.pem
```

### 2. Run the playbook:

```bash
ansible-playbook playbook.yml
```

### 3. Verify:

```bash
# SSH to master node
ssh -i ~/.ssh/your-key.pem ubuntu@YOUR_MASTER_IP

# Check nodes
kubectl get nodes

# Check pods
kubectl get pods -n kube-system
```

## Adding More Worker Nodes

Simply add more entries to `k8s_workers` in `inventory.yml`:

```yaml
k8s_workers:
  hosts:
    worker-node-1:
      ansible_host: WORKER_1_IP
      ansible_user: ubuntu
      ansible_ssh_private_key_file: ~/.ssh/your-key.pem
    worker-node-2:
      ansible_host: WORKER_2_IP
      ansible_user: ubuntu
      ansible_ssh_private_key_file: ~/.ssh/your-key.pem
    worker-node-3:  # Add as many as you need!
      ansible_host: WORKER_3_IP
      ansible_user: ubuntu
      ansible_ssh_private_key_file: ~/.ssh/your-key.pem
    worker-node-4:
      ansible_host: WORKER_4_IP
      ansible_user: ubuntu
      ansible_ssh_private_key_file: ~/.ssh/your-key.pem
```

Then run the playbook again - it will automatically join all new workers!

## Common Commands

```bash
# Run on all nodes
ansible-playbook playbook.yml

# Run only on workers
ansible-playbook playbook.yml --limit k8s_workers

# Run only on a specific worker
ansible-playbook playbook.yml --limit worker-node-3

# Run only prerequisites
ansible-playbook playbook.yml --tags prerequisites

# Check connectivity
ansible all -m ping
```




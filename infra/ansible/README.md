# Kubernetes Cluster Deployment Ansible Role

This Ansible role automates the deployment of a Kubernetes cluster using `kubeadm` with flexible support for any number of worker nodes.

## Features

- ✅ **Flexible Worker Nodes**: Supports any number of worker nodes - just add them to the inventory
- ✅ **Automated Setup**: Handles all prerequisites, containerd installation, and Kubernetes setup
- ✅ **Idempotent**: Safe to run multiple times
- ✅ **CNI Support**: Automatically installs Calico networking
- ✅ **Node Labeling**: Automatically labels worker nodes

## Prerequisites

- Ansible 2.9 or higher
- Ubuntu 20.04+ or 22.04+ servers
- SSH access to all nodes (master and workers)
- At least 2 CPU cores and 4GB RAM per node
- Port 6443 open between all nodes (for Kubernetes API)
- Port 22 open for SSH access

## Quick Start

### 1. Update Inventory

Edit `inventory.yml` or `inventory.ini` to include your nodes:

**YAML format (inventory.yml):**

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
        # Add as many worker nodes as you need!
```

**INI format (inventory.ini):**

```ini
[k8s_master]
master-node ansible_host=YOUR_MASTER_IP ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/your-key.pem

[k8s_workers]
worker-node-1 ansible_host=WORKER_1_IP ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/your-key.pem
worker-node-2 ansible_host=WORKER_2_IP ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/your-key.pem
# Add more worker nodes here - no limit!
```

### 2. Run the Playbook

```bash
cd ansible
ansible-playbook playbook.yml
```

### 3. Verify Cluster

After deployment, SSH to the master node and run:

```bash
kubectl get nodes
kubectl get pods -n kube-system
```

## Configuration Options

You can customize the deployment by modifying variables in `playbook.yml` or `roles/k8s-cluster/defaults/main.yml`:

### Key Variables

| Variable            | Default          | Description                              |
| ------------------- | ---------------- | ---------------------------------------- |
| `k8s_version`       | `1.30`           | Kubernetes version to install            |
| `pod_network_cidr`  | `192.168.0.0/16` | Pod network CIDR (must match CNI)        |
| `cni_provider`      | `calico`         | CNI provider (currently supports Calico) |
| `disable_swap`      | `true`           | Disable swap on all nodes                |
| `enable_ip_forward` | `true`           | Enable IP forwarding                     |

### Example: Custom Configuration

```yaml
- name: Deploy Kubernetes Cluster
  hosts: k8s_master:k8s_workers
  become: yes

  roles:
    - k8s-cluster

  vars:
    k8s_version: "1.29"
    pod_network_cidr: "10.244.0.0/16"
    master_init_extra_args: "--apiserver-advertise-address=172.31.40.47"
```

## Adding More Worker Nodes

To add more worker nodes to an existing cluster:

1. **Add the new node to inventory:**

   ```yaml
   k8s_workers:
     hosts:
       # ... existing workers ...
       worker-node-3:
         ansible_host: NEW_WORKER_IP
         ansible_user: ubuntu
         ansible_ssh_private_key_file: ~/.ssh/your-key.pem
   ```

2. **Run the playbook again:**

   ```bash
   ansible-playbook playbook.yml --limit k8s_workers
   ```

   Or run only on the new worker:

   ```bash
   ansible-playbook playbook.yml --limit worker-node-3
   ```

The role will automatically:

- Install prerequisites
- Install containerd and Kubernetes tools
- Join the new worker to the cluster
- Wait for it to become ready

## Role Structure

```
ansible/
├── roles/
│   └── k8s-cluster/
│       ├── defaults/
│       │   └── main.yml          # Default variables
│       ├── vars/
│       │   └── main.yml           # Internal variables
│       ├── tasks/
│       │   ├── main.yml           # Main task file
│       │   ├── prerequisites.yml  # System prerequisites
│       │   ├── containerd.yml     # Containerd installation
│       │   ├── k8s_install.yml    # Kubernetes tools installation
│       │   ├── master.yml         # Master node initialization
│       │   ├── worker.yml         # Worker node joining
│       │   └── cni.yml            # CNI installation
│       └── handlers/
│           └── main.yml           # Handlers for services
├── playbook.yml                    # Main playbook
├── inventory.yml                   # Inventory (YAML format)
├── inventory.ini                   # Inventory (INI format)
├── ansible.cfg                     # Ansible configuration
└── README.md                       # This file
```

## What the Role Does

### On All Nodes:

1. Disables swap
2. Loads required kernel modules (overlay, br_netfilter)
3. Configures kernel parameters (sysctl)
4. Installs and configures containerd
5. Installs Kubernetes tools (kubeadm, kubelet, kubectl)

### On Master Node:

1. Initializes the cluster with `kubeadm init`
2. Sets up kubeconfig for the user
3. Waits for master to be ready

### On Worker Nodes:

1. Gets join command from master
2. Joins the cluster with `kubeadm join`
3. Waits for node to be ready

### On Master Node (after workers join):

1. Installs Calico CNI
2. Labels worker nodes
3. Displays cluster status

## Troubleshooting

### Check if nodes are ready:

```bash
kubectl get nodes
```

### Check pod status:

```bash
kubectl get pods -n kube-system
```

### View logs:

```bash
kubectl logs -n kube-system <pod-name>
```

### Re-run specific tasks:

```bash
# Only run prerequisites
ansible-playbook playbook.yml --tags prerequisites

# Only install containerd
ansible-playbook playbook.yml --tags containerd

# Only setup master
ansible-playbook playbook.yml --tags master

# Only setup workers
ansible-playbook playbook.yml --tags worker
```

## Security Notes

- Ensure port 6443 is only accessible between cluster nodes
- Use SSH keys instead of passwords
- Regularly update Kubernetes and system packages
- Review and adjust firewall rules as needed

## License

This role is provided as-is for educational and deployment purposes.

# Production Deployment Guide (LMS)

This guide explains how to deploy the LMS project on a production server using Docker.

---

## Server Details

Replace with your server IP or domain:

```bash
YOUR_SERVER_IP
````

After deployment:

* Frontend: `http://YOUR_SERVER_IP:5173`
* Backend: `http://YOUR_SERVER_IP:5000`

---

## 1. Install Docker & Docker Compose

Run the following commands on your server:

```bash
sudo apt update

# Install Docker
sudo apt install -y docker.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin
```

Verify installation:

```bash
docker --version
docker compose version
```

---

## 2. Clone the Project

```bash
git clone YOUR_GITHUB_REPO_URL
cd LMS
```

---

## 3. Create `.env` File

```bash
cp .env.example .env
```

---

## 4. Generate JWT Key

```bash
openssl rand -base64 48
```

Copy the generated value.

---

## 5. Edit `.env` File

---

## 6. Build and Start Containers

```bash
docker compose up -d --build
```

---

## 7. Access the Application

Frontend:

```bash
http://YOUR_SERVER_IP:5173
```

Backend:

```bash
http://YOUR_SERVER_IP:5000/swagger
```

---

## 8. Useful Commands

Start containers:

```bash
docker compose up -d
```

Stop containers:

```bash
docker compose down
```

Rebuild containers:

```bash
docker compose up -d --build
```

Check status:

```bash
docker compose ps
```

---

## 9. Security Notes

* Use strong passwords
* Do not commit `.env` to GitHub
* Change default admin credentials after first login
* Use HTTPS in production

---

---

## Final Result

Frontend:

```bash
http://YOUR_SERVER_IP:5173
```

Backend:

```bash
http://YOUR_SERVER_IP:5000/swagger
```

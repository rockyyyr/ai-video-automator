# 🛠️ Installation Guide
This guide walks you through setting up the required tools and services using Docker. Make sure you have Docker Desktop installed before continuing.

# ✅ Step 1: Install Docker Desktop
Download and install Docker Desktop from here.
Follow the installation instructions for your operating system.
Ensure Docker is running before proceeding.

# 📦 Step 2: Run Required Services
Each of the following services will be run as Docker containers.

# 🔄 n8n (Automation Tool)
docker run -d --name n8n -p 5678:5678 -e WEBHOOK_URL=http://host.docker.internal:5678 -e N8N_DEFAULT_BINARY_DATA_MODE=filesystem -v C:\Docker\n8n-data:/home/node/.n8n docker.n8n.io/n8nio/n8n

If you using n8n on a vps or have a custom domain change the WEBHOOK_URL to that


# 💾 MiniIO (Object Storage) — Required before NCA Toolkit
Do not use the latest version!

docker run -d -p 9000:9000 -p 9001:9001 --name miniio -v C:\Docker\minio-data:/data -e MINIO_ROOT_USER=admin -e MINIO_ROOT_PASSWORD=password123 quay.io/minio/minio:RELEASE.2025-04-22T22-12-26Z server /data --console-address ":9001"

Access Console:
URL: http://localhost:9001
Username: admin
Password: password123
Next Steps:
Log into the MiniIO console.
Create a bucket named nca-toolkit.
Generate Access and Secret Keys:
You can use the default root credentials or create a new user with appropriate permissions.
Save these keys; you’ll need them for the NCA Toolkit setup.

# 🗣️ Kokoro TTS (Text-to-Speech)
docker run -d --gpus all -p 8880:8880 --name kokoro-tts ghcr.io/remsky/kokoro-fastapi-gpu:v0.2.2

# ⚠️ Requires a compatible NVIDIA GPU and Docker GPU support.
For CPU only version run
docker run -p 8880:8880 --name kokoro-tts-cpu ghcr.io/remsky/kokoro-fastapi-cpu:v0.2.2

# 📋 Baserow (Database UI)
docker run -d --name baserow -e BASEROW_PUBLIC_URL=http://localhost:85 -v C:\Docker\baserow-data:/baserow/data -p 85:80 --restart unless-stopped baserow/baserow:1.32.5


# 🚀 Step 3: Install NCA Toolkit
Once MiniIO is set up and your access keys are ready:

docker run -d -p 8080:8080 --name nca-toolkit -e API_KEY=thekey -e S3_ENDPOINT_URL=http://host.docker.internal:9000 -e S3_ACCESS_KEY=your_access_key -e S3_SECRET_KEY=your_secret_key -e S3_BUCKET_NAME=nca-toolkit -e S3_REGION=None stephengpope/no-code-architects-toolkit:latest

Replace your_access_key and your_secret_key with the values from MiniIO.

✅ You're Done!
Your services should now be running on the following ports:
Service
URL
n8n
http://http://host.docker.internal/:5678
MiniIO
http://host.docker.internal:9001
Kokoro TTS
http://host.docker.internal:8880/web
Baserow
http://host.docker.internal:85
NCA Toolkit
http://host.docker.internal:8080



Note that the NCA Toolkit does not have a webUI this is just an API see there github to find out about the end points and what can be done

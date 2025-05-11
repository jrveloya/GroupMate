# GroupMate

GroupMate is a task management web application built for students and early professionals collaborating on group projects. It provides an intuitive interface, role-based access, and seamless deployment on AWS infrastructure.

## Features

### 🧑‍💼 User Management
- Role-based access: managers and members
- JWT-secured endpoints
- Profile update and deletion

### 📁 Project Management
- Create, update, delete projects
- Assign team members
- Project-specific announcements

### ✅ Task Management
- Assign tasks to members
- Track task status: active, complete, archived
- Comments and real-time updates

### 💬 Comment System
- Add comments to individual tasks
- Authenticated user attribution
- Timestamped activity log

### 📢 Announcements
- Project-wide announcements
- Accessible only to project members

### 🔐 Authentication & Security
- JWT Authentication with secure password hashing
- Role-based endpoint access
- MongoDB ObjectId validation

## Tech Stack

- **Frontend:** React, TailwindCSS, AWS Amplify
- **Backend:** Flask, Flask-JWT-Extended, PyMongo
- **Database:** MongoDB (local or EC2-hosted)
- **Infrastructure:** Docker, AWS Fargate, ECS, ECR, ALB, IAM

## Getting Started (Local Development)

### Backend
```bash
pip install -r requirements.txt
python run.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Deployment (AWS)

- Backend containerized using Docker and deployed on AWS Fargate.
- ECR used for container image storage.
- Load Balancer routes traffic to ECS tasks.
- MongoDB hosted via EC2 or Atlas (optional).

## Future Improvements

- Role-based dashboard UI
- Notification system for mentions and updates
- File upload support per task or project

## License

MIT License

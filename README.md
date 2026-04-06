🎧 3D / 8D / 16D Audio Converter

A full-stack web application that converts normal songs into immersive 3D, 8D, and 16D audio experiences.
Upload any song or provide a source, and the system processes it using advanced audio manipulation techniques.

🚀 Features
🎵 Convert normal audio into:
3D Audio
8D Audio
16D Audio
📤 Upload audio files
☁️ Cloud storage integration (Cloudinary)
⚡ Fast processing using FFmpeg
🔐 Secure backend with validation & rate limiting
📱 Fully responsive frontend (React + Tailwind + MUI)

🏗️ Tech Stack
Frontend (Client)
React (Vite)
Tailwind CSS
Material UI (MUI)
Styled Components
Lucide Icons

Backend (Server)
Node.js
Express.js
MongoDB (Mongoose)
FFmpeg (audio processing)
Cloudinary (file storage)
Multer (file upload)
Nodemailer / Resend (emails)


📁 Project Structure
project-root/
│
├── client/        # Frontend (React + Vite)
├── server/        # Backend (Node.js + Express)
│
└── README.md

⚙️ Installation & Setup
1️⃣ Clone Repository
https://github.com/Jayveer-kumar/BeatMagic.git
cd BeatMagic

2️⃣ Setup Server
cd server
npm install

Create a .env file inside server/:

PORT=8080
MONGO_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_API_KEY=your_email_service_key

Run server:

npm start

3️⃣ Setup Client
cd client
npm install
npm run dev

🎛️ How It Works
User uploads a song or provides a source
Server receives the file using Multer
Audio is processed using FFmpeg
Effects are applied to create:
Spatial movement (left ↔ right)
Depth simulation
Surround sound illusion
Processed file is uploaded to Cloudinary
User gets downloadable / playable output

📦 Server Dependencies
express
mongoose
fluent-ffmpeg
multer
cloudinary
dotenv
cors
helmet
express-rate-limit
express-validator
nodemailer / resend
ytdl-core

📦 Client Dependencies
react
vite
tailwindcss
@mui/material
styled-components
lucide-react
typed.js

🔒 Security Features
Rate limiting (prevent spam)
Input validation
Secure headers (Helmet)
Environment variable protection
🎯 Future Improvements
🎚️ Custom audio controls (speed, bass, echo)
📱 Mobile app version
🔊 Real-time preview before download
🎧 Headphone optimization modes
🧠 AI-based sound enhancement
🤝 Contributing

Contributions are welcome!

Fork the repo
Create a new branch
Make changes
Submit a pull request
📜 License

This project is licensed under the ISC License.

👨‍💻 Author

Developed by Jayveer

⭐ Support

If you like this project, don’t forget to star ⭐ the repo!

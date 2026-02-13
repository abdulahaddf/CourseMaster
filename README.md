# CourseMaster - Modern EdTech Platform

A full-stack educational technology platform built with Next.js 16, TypeScript, MongoDB, and Tailwind CSS. Features a professional UI/UX with support for students and administrators.

![CourseMaster](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop)

## ✨ Features

### For Students
- 📚 Browse and search courses by category, level, and price
- 🎓 Enroll in courses and track progress
- 📊 Personal dashboard with learning analytics
- 🎬 Interactive lesson player with video, articles, and quizzes
- 📝 Submit assignments and take quizzes
- 🏆 Progress tracking and completion certificates
- 📧 Welcome email upon registration

### For Administrators
- 🛡️ Full platform oversight and management
- 👤 User management (view, edit roles, delete users)
- 📊 Platform-wide analytics
- 📝 Review assignment submissions
- ✅ Review quiz attempts and scores
- 📚 Course management (create, edit, publish, delete)
- 💰 Revenue tracking

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT with HTTP-only cookies
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS 4
- **UI Components:** Custom component library with CVA
- **Form Handling:** React Hook Form + Zod validation
- **Email:** Nodemailer (Gmail SMTP)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Notifications:** Sonner

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/abdulahaddf/courseMaster.git
cd courseMaster
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Admin Registration Key
ADMIN_REGISTRATION_KEY=your_admin_secret_key

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Email Configuration (Nodemailer - Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_gmail_address
SMTP_PASS=your_gmail_app_password
SMTP_FROM=your_gmail_address
```

4. Seed the database with sample data:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Accounts

After seeding, you can log in with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@coursemaster.com | Password123 |
| Student | mike@example.com | Password123 |
| Student | emily@example.com | Password123 |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/          # Public pages (home, courses)
│   ├── (auth)/            # Authentication pages
│   ├── (student)/         # Student dashboard
│   ├── (admin)/           # Admin dashboard
│   └── api/               # API routes
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   ├── admin/             # Admin components
│   └── dashboard/         # Dashboard components
├── lib/                   # Utilities and configurations
├── models/                # Mongoose models
└── store/                 # Redux store and slices
```

## 🎨 UI Components

The project includes a custom component library:

- **Button** - Multiple variants (default, outline, ghost, link)
- **Input** - With validation, icons, and password toggle
- **Card** - Glass and elevated variants
- **Badge** - Status indicators
- **Progress** - Progress bars
- **Avatar** - User avatars with fallback
- **Select/Textarea** - Form inputs
- **Skeleton** - Loading states

## 🔐 Authentication

- JWT-based authentication with HTTP-only cookies
- Middleware-protected routes
- Role-based access control (student, admin)
- Session persistence across page refreshes

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/me` | Get current user | Yes |

### Course Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/courses` | Get all published courses | No |
| POST | `/api/courses` | Create a new course | Admin |
| GET | `/api/courses/[slug]` | Get course by slug | No |
| PUT | `/api/courses/[slug]` | Update course | Admin |
| DELETE | `/api/courses/[slug]` | Delete course | Admin |

### Enrollment Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/enrollments` | Get user enrollments | Yes |
| POST | `/api/enrollments` | Enroll in a course | Yes |
| PUT | `/api/enrollments/[id]/progress` | Update lesson progress | Yes |

### Assignment Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/assignments` | Get user's assignment submissions | Yes |
| POST | `/api/assignments` | Submit an assignment | Yes |

### Quiz Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/quizzes` | Get user's quiz attempts | Yes |
| POST | `/api/quizzes` | Submit a quiz attempt | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/analytics` | Get platform analytics | Admin |
| GET | `/api/admin/users` | Get all users (paginated) | Admin |
| GET | `/api/admin/users/[id]` | Get user by ID | Admin |
| PUT | `/api/admin/users/[id]` | Update user (role) | Admin |
| DELETE | `/api/admin/users/[id]` | Delete user | Admin |
| GET | `/api/admin/enrollments` | Get all enrollments | Admin |
| GET | `/api/admin/assignments` | Get all assignment submissions | Admin |
| PUT | `/api/admin/assignments/[id]` | Grade assignment | Admin |
| GET | `/api/admin/quizzes` | Get all quiz attempts | Admin |

### Request/Response Examples

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Enroll in Course
```bash
POST /api/enrollments
Content-Type: application/json

{
  "courseId": "course_id_here"
}
```

#### Submit Assignment
```bash
POST /api/assignments
Content-Type: application/json

{
  "lessonId": "lesson_id",
  "courseId": "course_id",
  "content": "Assignment submission content",
  "attachments": ["url1", "url2"]
}
```

#### Submit Quiz
```bash
POST /api/quizzes
Content-Type: application/json

{
  "lessonId": "lesson_id",
  "courseId": "course_id",
  "answers": [
    { "questionId": "q1", "selectedOption": 0 },
    { "questionId": "q2", "selectedOption": 2 }
  ]
}
```

## 📱 Responsive Design

The platform is fully responsive with:
- Mobile-first approach
- Collapsible sidebar navigation
- Adaptive layouts for all screen sizes
- Touch-friendly interactions

## 🎯 Future Enhancements

- [ ] Payment integration (Stripe)
- [ ] Video hosting integration
- [ ] Live classes with WebRTC
- [ ] Discussion forums
- [ ] Advanced analytics
- [ ] Course recommendations
- [ ] Mobile app (React Native)
- [ ] Instructor role with course creation

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Abdul Ahad**
- GitHub: [@abdulahaddf](https://github.com/abdulahaddf)

---

Built with ❤️ using Next.js

# InternFlow 🚀

> An AI-powered internship and recruitment platform connecting students and companies with intelligent matching, resume analysis, and automatic notifications.

![Hero Image](public/screenshots/hero.png)

---

## 🌟 Key Features

### 👨‍🎓 Student Features
- **Profile Management**: Maintain academic records, majors, university details, and upload CVs.
- **Smart Application History**: Apply to internships in one click and track application status timelines.
- **AI Career Preparation**: Access tailored interview questions and study guides for specific roles.

### 🏢 Company Features
- **Employer Profile**: Set up company details, manage listings, and request platform verification.
- **Job Posting Management**: Post, update, and withdraw internship opportunities with advanced filters.
- **Applicant Management**: View applicants, track views, and update hiring statuses.

### 🤖 AI Core
- **Resume Analysis**: Upload CVs for detailed feedback, strengths/weaknesses profiling, and suggested roles.
- **Job Matching Score**: Calculate precise match percentages between candidate profiles and job requirements.
- **Applicant Ranking Leaderboard**: Rank internship applicants automatically based on AI score compatibility.
- **Career Chat Agent**: Interact with a chatbot helper for immediate career guidance.

### 🔔 Notifications
- **Event-Driven Triggers**: Receive real-time alerts for status updates, application reviews, and system alerts.
- **Preferences Center**: Toggle push notifications and select email notifications for job updates.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **AI Integration**: [OpenAI / Gemini SDK](https://openai.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Environment**: [Docker Compose](https://www.docker.com/)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions)

---

## 📐 System Architecture

The following diagram illustrates the flow of data through the platform:

```mermaid
graph TD
    Browser[Browser / Client] -->|HTTP / API Requests| NextJS[Next.js App Router]
    NextJS -->|API Request| APIRoutes[API Routes /api/*]
    APIRoutes -->|Service Logic| Services[Services Layer]
    Services -->|Prisma Client| Prisma[Prisma ORM]
    Prisma -->|Queries| PostgreSQL[(PostgreSQL Database)]
```

---

## 📊 Database ER Diagram

The database relationships are structured as follows:

```mermaid
erDiagram
    USER {
        string id PK
        string name
        string email
        string password
        Role role
        datetime createdAt
    }
    STUDENT_PROFILE {
        string id PK
        string userId FK
        string university
        string major
        string[] skills
        string cvUrl
    }
    COMPANY {
        string id PK
        string userId FK
        string name
        string description
        boolean approved
    }
    INTERNSHIP {
        string id PK
        string title
        string description
        string location
        string type
        string companyId FK
        datetime createdAt
    }
    APPLICATION {
        string id PK
        string studentId FK
        string internshipId FK
        Status status
        datetime createdAt
    }
    RESUME_ANALYSIS {
        string id PK
        string studentId FK
        string summary
        json skills
        json education
        json experience
        json strengths
        json weaknesses
        json suggestedRoles
        datetime createdAt
        datetime updatedAt
    }
    JOB_MATCH_RESULT {
        string id PK
        string studentId FK
        string internshipId FK
        int matchScore
        string summary
        json matchingSkills
        json missingSkills
        json improvementSuggestions
        string recruiterTakeaway
    }
    INTERVIEW_PREP {
        string id PK
        string studentId FK
        string internshipId FK
        json technicalQuestions
        json behavioralQuestions
        json studyTopics
    }
    NOTIFICATION {
        string id PK
        string userId FK
        string title
        string message
        NotificationType type
        boolean read
        datetime createdAt
    }
    NOTIFICATION_PREFERENCE {
        string id PK
        string userId FK
        boolean emailApplications
        boolean emailInternships
        boolean emailMarketing
        boolean pushNotifications
    }
    ACTIVITY_LOG {
        string id PK
        string userId FK
        string action
        json metadata
        datetime createdAt
    }

    USER ||--o| STUDENT_PROFILE : "has profile"
    USER ||--o| COMPANY : "has profile"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o| NOTIFICATION_PREFERENCE : "defines"
    USER ||--o{ ACTIVITY_LOG : "logs"

    STUDENT_PROFILE ||--o{ APPLICATION : "submits"
    STUDENT_PROFILE ||--o| RESUME_ANALYSIS : "analyzes"
    STUDENT_PROFILE ||--o{ JOB_MATCH_RESULT : "receives match"
    STUDENT_PROFILE ||--o{ INTERVIEW_PREP : "prepares"

    COMPANY ||--o{ INTERNSHIP : "posts"

    INTERNSHIP ||--o{ APPLICATION : "receives"
    INTERNSHIP ||--o{ JOB_MATCH_RESULT : "calculates match"
    INTERNSHIP ||--o{ INTERVIEW_PREP : "structures prep"
```

---

## ⚙️ Installation & Local Setup

Get the application up and running locally by following these steps:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/internflow.git
cd internflow
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/internflow?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
OPENAI_API_KEY="your-openai-api-key"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Spin up Database Services (Docker Compose)
```bash
docker compose up -d
```

### 5. Run Database Migrations
```bash
npx prisma db push
```

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📸 Screenshots

Here are previews of key interfaces within the InternFlow platform:

### Student Dashboard
![Student Dashboard](public/screenshots/1.png)

### Company Dashboard
![Company Dashboard](public/screenshots/2.png)

### AI Analysis
![AI Analysis](public/screenshots/3.png)

### Applicant Ranking
![Applicant Ranking](public/screenshots/4.png)

### Notifications
![Notifications](public/screenshots/5.png)

### API Documentation
Interactive API docs are exposed at `/docs` when the server is running.
![API Documentation](public/screenshots/6.png)

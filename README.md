# Maa Sati IAC — Interactive 3D Digital Campus

**Live preview:** https://maasatitechiac.vercel.app  
**Repository:** https://github.com/satitech-admin/maasatitechiac

## Design
This version follows the newly supplied **3D Digital Campus reference**, replacing the previous Retro Pixel Academy direction. The central futuristic blue/cyan campus uses the supplied reference image with its duplicate screenshot header removed. Six glowing buildings are interactive navigation hotspots. The **official blue-and-gold Maa Sati IAC logo** provided by the institute is preserved, with its full proportions intact. Both image assets are embedded in the homepage itself to prevent missing-image deployment issues.

## Features available in preview
- Interactive 3D campus hero, desktop hover highlights, clickable school/college/internship/course/project/certificate buildings
- Dedicated pages for School Programs, College Courses, Internships, Student Projects, Certificates and About
- Four detailed course pathways: Web Development, App Development, Artificial Intelligence and Data Science
- Seven-day school program curriculum and seminar information
- Internship track cards and application UI demonstrations
- School mini-project gallery with category filters and explicitly fictional demo student profiles
- Gamified student learning portal: XP, levels, completion quests, daily missions, browser-local save, achievements
- Curated Study Buddy FAQ chat
- Certificate ID checker that safely refuses to claim validity without a real issuer registry
- Responsive navigation and reduced-motion support

## Run
This project currently contains a standalone HTML/CSS/JavaScript frontend in `index.html`. Open it in a browser or run any static server. The repository also contains earlier React/Vite prototype files, but **the deployment entrypoint is the new self-contained index.html**. The embedded source images mean it does not depend on separate asset hosting.

## Important production limitations
This is a **functional frontend demonstration, not a production LMS**. Student logins, true enrollments, payments, protected recordings, live class scheduling, certificate issuance, real submissions, real analytics and model-backed AI need backend services plus credentials and security checks. Demo registration forms validate locally but do **not** persist or send submissions. XP is local browser state and must not be treated as a verified educational record. All student gallery sample identities are fictional.

### Before launch
- Add real authentication with server-enforced student/teacher/admin authorization, secure database and private video storage
- Set up course batches, trainers, recordings and attendance
- Configure consent and moderation for schoolchildren's images and full names
- Implement project submissions, eligibility checks and authorized certificates with QR/ID verification
- Connect a trusted payment provider, email notifications and secure AI gateway
- Conduct full desktop/mobile, security, accessibility and end-to-end testing

No real student records, payment status or certificate issuance should be inferred from this preview.

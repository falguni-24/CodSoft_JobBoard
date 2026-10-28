const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SavedJob = require('../models/SavedJob');

const seedData = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jobconnect';

  try {
    console.log(`Connecting to database for seeding at: ${uri}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB. Starting database reset & seed...');

    // Clear existing collections
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await SavedJob.deleteMany({});
    console.log('Cleared existing Users, Jobs, Applications, and SavedJobs.');

    // 1. Create Demo Employer
    const demoEmployer = await User.create({
      name: 'Sarah Jenkins (TechNova HR)',
      email: 'employer@jobconnect.demo',
      password: 'Employer@1234',
      role: 'employer',
      profile: {
        headline: 'Director of Talent Acquisition at TechNova Solutions',
        bio: 'TechNova is an innovative global software solutions provider delivering next-generation digital cloud platforms to enterprise clients.',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        companyName: 'TechNova Solutions',
        companyWebsite: 'https://technova.example.com',
      },
    });

    // 2. Create Demo Candidate
    const demoCandidate = await User.create({
      name: 'Alex Rivera',
      email: 'candidate@jobconnect.demo',
      password: 'Candidate@1234',
      role: 'candidate',
      profile: {
        headline: 'Senior Full Stack & React Developer | Node.js & TypeScript',
        bio: 'Passionate software engineer with 5+ years of experience building high-performance web applications, scalable REST APIs, and delightful customer-facing UIs.',
        phone: '+1 (555) 876-5432',
        location: 'Austin, TX',
        portfolioUrl: 'https://alexrivera.dev',
        skills: ['React', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'TypeScript', 'Tailwind CSS', 'Docker'],
        experience: [
          {
            title: 'Full Stack Engineer',
            company: 'NextWave Systems',
            location: 'Austin, TX',
            startDate: '2022-01',
            endDate: 'Present',
            current: true,
            description: 'Engineered performant React interfaces, integrated microservices in Node.js, and improved application load times by 40%.',
          },
          {
            title: 'Frontend Developer',
            company: 'Apex Codeworks',
            location: 'Remote',
            startDate: '2020-03',
            endDate: '2021-12',
            current: false,
            description: 'Created reusable component libraries in React and converted complex Figma designs to pixel-perfect responsive web pages.',
          },
        ],
        education: [
          {
            degree: 'B.S. in Computer Science',
            institution: 'University of Texas at Austin',
            graduationYear: '2020',
            fieldOfStudy: 'Computer Science & Software Engineering',
          },
        ],
      },
    });

    console.log('Created Demo Accounts:');
    console.log(` - Employer:  employer@jobconnect.demo / Employer@1234`);
    console.log(` - Candidate: candidate@jobconnect.demo / Candidate@1234`);

    // 3. Create 12 Diverse, Realistic Job Listings
    const jobsData = [
      {
        title: 'Senior Full Stack Developer',
        company: 'TechNova Solutions',
        location: 'Remote, US',
        category: 'Software Development',
        jobType: 'Full-Time',
        experience: 'Senior Level',
        salaryRange: { min: 130000, max: 165000, currency: 'USD', period: 'yearly' },
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker', 'AWS'],
        employerId: demoEmployer._id,
        status: 'active',
        description: 'TechNova Solutions is looking for a versatile Senior Full Stack Developer to lead development on our core enterprise cloud platform. You will build user-centric features, architect robust APIs, and collaborate closely with product and UX teams.',
        responsibilities: [
          'Design and maintain scalable web applications utilizing React, Node.js, and MongoDB.',
          'Collaborate with product managers and UX designers to transform specifications into intuitive features.',
          'Optimize web performance, maintain high test coverage, and uphold strict code standards.',
          'Mentor junior team members and participate in architectural reviews.',
        ],
        qualifications: [
          '5+ years of software development experience with modern JavaScript / TypeScript.',
          'Deep proficiency in React, Node.js, Express, and NoSQL databases.',
          'Solid understanding of cloud deployment (AWS or GCP) and containerization.',
          'Strong communication skills and collaborative team mindset.',
        ],
      },
      {
        title: 'Lead Frontend React Architect',
        company: 'CloudScale Inc.',
        location: 'San Francisco, CA',
        category: 'Software Development',
        jobType: 'Full-Time',
        experience: 'Lead / Principal',
        salaryRange: { min: 160000, max: 200000, currency: 'USD', period: 'yearly' },
        skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux / Zustand', 'Vite'],
        employerId: demoEmployer._id,
        status: 'active',
        description: 'CloudScale Inc. is hiring a Lead Frontend Architect to establish engineering best practices, oversee our design system, and drive next-generation frontend performance across multiple web portals.',
        responsibilities: [
          'Drive frontend architecture decisions, state management patterns, and build pipelines.',
          'Oversee and evolve our design system component library.',
          'Conduct code reviews, mentor engineers, and ensure adherence to accessibility (WCAG AA).',
          'Benchmark rendering performance, Core Web Vitals, and client caching mechanisms.',
        ],
        qualifications: [
          '7+ years in frontend development with 4+ years leading frontend initiatives.',
          'Expert-level mastery of React, TypeScript, and modern CSS frameworks.',
          'Demonstrated track record of delivering high-traffic web applications with top Core Web Vitals.',
        ],
      },
      {
        title: 'Machine Learning & AI Engineer',
        company: 'Synthetix AI',
        location: 'Boston, MA',
        category: 'Data Science',
        jobType: 'Full-Time',
        experience: 'Senior Level',
        salaryRange: { min: 145000, max: 185000, currency: 'USD', period: 'yearly' },
        skills: ['Python', 'PyTorch', 'LLMs', 'FastAPI', 'Vector Databases', 'Hugging Face'],
        employerId: demoEmployer._id,
        status: 'active',
        description: 'Join Synthetix AI to build cutting-edge generative AI applications and intelligent workflow automation systems for enterprise clients.',
        responsibilities: [
          'Develop, fine-tune, and evaluate large language models and RAG pipelines.',
          'Deploy performant inference services using FastAPI and containerized orchestration.',
          'Collaborate with data engineers to curate and preprocess large proprietary datasets.',
          'Monitor model drift, latency, and accuracy in production environments.',
        ],
        qualifications: [
          'B.S. or M.S. in Computer Science, Data Science, or related field.',
          '4+ years practical experience deploying ML / Deep Learning models in production.',
          'Hands-on experience with LLM orchestration frameworks and embedding retrieval.',
        ],
      },
      {
        title: 'Senior Product Designer (UI/UX)',
        company: 'PixelCraft Studio',
        location: 'Austin, TX / Remote',
        category: 'Design',
        jobType: 'Full-Time',
        experience: 'Senior Level',
        salaryRange: { min: 115000, max: 145000, currency: 'USD', period: 'yearly' },
        skills: ['Figma', 'User Research', 'Design Systems', 'Wireframing', 'Prototyping', 'Accessibility'],
        employerId: demoEmployer._id,
        status: 'active',
        description: 'PixelCraft Studio creates intuitive digital experiences. We are looking for an empathetic Senior Product Designer to spearhead research, wireframing, and visual design for our customer portal.',
        responsibilities: [
          'Lead end-to-end UX/UI design processes from discovery and wireframing to high-fidelity prototypes.',
          'Conduct qualitative interviews and usability tests with active users.',
          'Maintain a coherent, scalable design system in Figma alongside frontend developers.',
          'Deliver developer-ready design assets and responsive layout guidelines.',
        ],
        qualifications: [
          '4+ years designing B2B or B2C web/mobile platforms.',
          'Stunning portfolio displaying thoughtful UX problem solving and polished UI craft.',
          'Fluency in Figma, prototyping tools, and atomic design system methodologies.',
        ],
      },
      {
        title: 'Growth Marketing Lead',
        company: 'HyperGrowth Media',
        location: 'New York, NY',
        category: 'Marketing',
        jobType: 'Full-Time',
        experience: 'Mid Level',
        salaryRange: { min: 95000, max: 125000, currency: 'USD', period: 'yearly' },
        skills: ['SEO', 'Google Ads', 'Content Strategy', 'HubSpot', 'Conversion Optimization', 'Analytics'],
        employerId: demoEmployer._id,
        status: 'active',
        description: 'HyperGrowth Media is seeking an analytical Growth Marketing Lead to supercharge our inbound customer acquisition, organic search ranking, and digital marketing funnels.',
        responsibilities: [
          'Plan and execute multi-channel digital acquisition campaigns across Google, LinkedIn, and content channels.',
          'Perform rigorous A/B testing on landing pages to maximize conversion rates.',
          'Analyze traffic, CAC, and LTV metrics using Google Analytics and business intelligence tools.',
          'Manage external copywriters, designers, and SEO consultants.',
        ],
        qualifications: [
          '3+ years in growth marketing or performance marketing within tech or digital agencies.',
          'Proven record scaling paid channels while lowering customer acquisition costs.',
          'Strong analytical chops with Excel, GA4, and marketing automation platforms.',
        ],
      },
      {
        title: 'Financial Analyst & Strategic Planning',
        company: 'Apex Financial Partners',
        location: 'Chicago, IL',
        category: 'Finance',
        jobType: 'Full-Time',
        experience: 'Mid Level',
        salaryRange: { min: 90000, max: 120000, currency: 'USD', period: 'yearly' },
        skills: ['Financial Modeling', 'Excel', 'Forecasting', 'SQL', 'Tableau', 'Budgeting'],
        employerId: demoEmployer._id,
        status: 'active',
        description: 'Apex Financial Partners is hiring a diligent Financial Analyst to support executive leadership with financial forecasting, variance analysis, and long-term capital allocation.',
        responsibilities: [
          'Build dynamic financial forecast models and budget projections.',
          'Prepare monthly and quarterly financial review presentations for stakeholders.',
          'Extract operational metrics using SQL and create interactive dashboards in Tableau.',
          'Evaluate ROI on prospective capital investments and business partnerships.',
        ],
        qualifications: [
          'Bachelor’s degree in Finance, Accounting, Economics, or related discipline.',
          '3+ years financial modeling and budgeting experience.',
          'Advanced Excel proficiency (DCF models, sensitivity tables, pivot queries).',
        ],
      },
      {
        title: 'DevOps & Cloud Infrastructure Engineer',
        company: 'BlueSky Cloud',
        location: 'Seattle, WA / Remote',
        category: 'Software Development',
        jobType: 'Remote',
        experience: 'Senior Level',
        salaryRange: { min: 135000, max: 170000, currency: 'USD', period: 'yearly' },
        skills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD GitHub Actions', 'Prometheus', 'Linux'],
        employerId: demoEmployer._id,
        status: 'active',
        description: 'BlueSky Cloud is on a mission to build resilient, self-healing cloud infrastructure. We are looking for an experienced DevOps Engineer to manage our multi-region Kubernetes clusters.',
        responsibilities: [
          'Automate AWS infrastructure provisioning using Terraform and GitOps practices.',
          'Manage and scale Kubernetes clusters, ingress controllers, and service meshes.',
          'Build robust CI/CD pipelines to enable zero-downtime microservice deployments.',
          'Implement observability, alerting, and incident response runbooks.',
        ],
        qualifications: [
          '4+ years managing production Linux environments on AWS or GCP.',
          'Strong practical experience with Docker, Kubernetes, and Helm.',
          'Solid scripting ability in Bash, Python, or Go.',
        ],
      },
      {
        title: 'Senior Product Manager (B2B SaaS)',
        company: 'MetricFlow',
        location: 'Denver, CO',
        category: 'Product Management',
        jobType: 'Full-Time',
        experience: 'Senior Level',
        salaryRange: { min: 140000, max: 175000, currency: 'USD', period: 'yearly' },
        skills: ['Product Strategy', 'Agile / Scrum', 'Roadmapping', 'User Research', 'Data Analysis', 'Jira'],
        employerId: demoEmployer._id,
        status: 'active',
        description: 'MetricFlow is seeking a Senior Product Manager to drive roadmap execution for our enterprise analytics suite. You will balance customer needs, commercial goals, and technical feasibility.',
        responsibilities: [
          'Define product vision, quarterly OKRs, and prioritize the feature roadmap.',
          'Conduct extensive discovery calls with enterprise customers to understand pain points.',
          'Author clear PRDs, user stories, and acceptance criteria for engineering sprints.',
          'Partner with sales and marketing teams to execute successful product launches.',
        ],
        qualifications: [
          '5+ years product management experience in B2B SaaS applications.',
          'Strong track record of taking complex software features from concept to successful launch.',
          'Exceptional stakeholder management and verbal communication skills.',
        ],
      },
      {
        title: 'Customer Success Operations Specialist',
        company: 'OmniDesk Care',
        location: 'Atlanta, GA',
        category: 'Customer Support',
        jobType: 'Full-Time',
        experience: 'Entry Level',
        salaryRange: { min: 55000, max: 70000, currency: 'USD', period: 'yearly' },
        skills: ['Zendesk', 'Client Communication', 'CRM', 'Problem Solving', 'Customer Retention', 'Onboarding'],
        employerId: demoEmployer._id,
        status: 'active',
        description: 'Join OmniDesk Care as a Customer Success Specialist! You will assist new enterprise clients during onboarding, resolve critical inquiries, and advocate for customer happiness.',
        responsibilities: [
          'Guide customers through onboarding webinars, software configuration, and account setup.',
          'Triage and resolve incoming customer tickets with empathy and speed.',
          'Identify common user difficulties and author self-help knowledge base guides.',
          'Proactively check in with accounts to prevent churn and encourage renewals.',
        ],
        qualifications: [
          '1-2 years experience in customer support, client relations, or account management.',
          'Excellent written communication and troubleshooting skills.',
          'Familiarity with CRM tools like Zendesk, Salesforce, or Intercom.',
        ],
      },
      {
        title: 'Data Platform & Analytics Engineer',
        company: 'DataSphere Labs',
        location: 'Remote',
        category: 'Data Science',
        jobType: 'Remote',
        experience: 'Senior Level',
        salaryRange: { min: 130000, max: 160000, currency: 'USD', period: 'yearly' },
        skills: ['Snowflake', 'dbt', 'SQL', 'Python', 'Airflow', 'Data Modeling'],
        employerId: demoEmployer._id,
        status: 'active',
        description: 'DataSphere Labs is expanding its modern data stack. We need an experienced Data Platform Engineer to design reliable data pipelines, implement dbt transformations, and manage Snowflake warehouses.',
        responsibilities: [
          'Build, maintain, and optimize ELT pipelines using Airflow, dbt, and Snowflake.',
          'Design dimensional data models (star schema) to empower self-service business intelligence.',
          'Enforce data quality tests, documentation standards, and governance policies.',
          'Collaborate with analytics teams to accelerate dashboard query performance.',
        ],
        qualifications: [
          '4+ years building automated data pipelines in production environments.',
          'Mastery of SQL, dimensional modeling, and Python.',
          'Extensive experience with modern data tools like Snowflake, BigQuery, or dbt.',
        ],
      },
      {
        title: 'Junior Frontend Developer Intern',
        company: 'TechNova Solutions',
        location: 'Remote',
        category: 'Software Development',
        jobType: 'Internship',
        experience: 'Entry Level',
        salaryRange: { min: 40000, max: 55000, currency: 'USD', period: 'yearly' },
        skills: ['HTML5', 'CSS3', 'JavaScript', 'React Basics', 'Git', 'Responsive Design'],
        employerId: demoEmployer._id,
        status: 'active',
        description: 'Great launchpad for an aspiring developer! TechNova Solutions offers a structured 6-month internship working on real client projects alongside senior engineers.',
        responsibilities: [
          'Implement UI components using HTML5, modern CSS, and React.',
          'Test cross-browser compatibility and ensure mobile responsiveness.',
          'Fix bugs identified by QA and participate in daily agile standups.',
          'Learn enterprise version control workflows with Git and GitHub pull requests.',
        ],
        qualifications: [
          'Demonstrated foundational knowledge of JavaScript, HTML, and CSS.',
          'Familiarity with React or modern component-based frameworks.',
          'Curiosity, enthusiasm to learn, and proactive communication.',
        ],
      },
      {
        title: 'Enterprise Account Executive',
        company: 'CloudScale Inc.',
        location: 'Chicago, IL / Remote',
        category: 'Sales',
        jobType: 'Full-Time',
        experience: 'Mid Level',
        salaryRange: { min: 100000, max: 150000, currency: 'USD', period: 'yearly' },
        skills: ['B2B Sales', 'SaaS Solutions', 'Contract Negotiation', 'Prospecting', 'Salesforce', 'CRM'],
        employerId: demoEmployer._id,
        status: 'active',
        description: 'CloudScale Inc. is hiring a driven Account Executive to manage the full sales cycle for our enterprise cloud security and scaling products.',
        responsibilities: [
          'Prospective, qualify, and close high-value enterprise SaaS deals.',
          'Deliver compelling product demonstrations to VP and C-level decision makers.',
          'Collaborate with solutions architects to address technical questions during buyer evaluation.',
          'Consistently meet and exceed quarterly revenue quotas.',
        ],
        qualifications: [
          '3+ years quota-carrying SaaS or technical sales experience.',
          'Proven record of closing multi-year enterprise contracts.',
          'Strong consultative selling skills and pipeline discipline.',
        ],
      },
      {
        title: 'Part-Time Data Science & Analytics Consultant',
        company: 'Synthetix AI',
        location: 'Remote',
        category: 'Data Science',
        jobType: 'Part-Time',
        experience: 'Mid Level',
        salaryRange: { min: 60000, max: 85000, currency: 'USD', period: 'yearly' },
        skills: ['Python', 'SQL', 'Data Analysis', 'Tableau', 'Machine Learning', 'Pandas'],
        employerId: demoEmployer._id,
        status: 'active',
        description: 'Synthetix AI is seeking a flexible Part-Time Data Science & Analytics Consultant (approx. 20 hrs/week) to analyze client telemetry, build predictive customer models, and create executive KPI dashboards.',
        responsibilities: [
          'Perform exploratory data analysis and build statistical models using Python and Pandas.',
          'Develop executive dashboards and automated KPI tracking in Tableau / PowerBI.',
          'Collaborate with machine learning engineers to validate predictive feature sets.',
        ],
        qualifications: [
          '2+ years practical data science or data analytics experience.',
          'Strong command of Python, SQL, and data visualization tools.',
          'Ability to work independently in a remote part-time schedule.',
        ],
      },
    ];

    const insertedJobs = await Job.insertMany(jobsData);
    console.log(`Successfully seeded ${insertedJobs.length} job listings.`);

    // 4. Create sample application for demo candidate to the first job
    const sampleResumeDummyPath = path.join(__dirname, '..', 'uploads', 'resumes', 'demo-resume.pdf');
    // Ensure dir exists
    const uploadsResumesDir = path.dirname(sampleResumeDummyPath);
    const fs = require('fs');
    if (!fs.existsSync(uploadsResumesDir)) {
      fs.mkdirSync(uploadsResumesDir, { recursive: true });
    }
    if (!fs.existsSync(sampleResumeDummyPath)) {
      fs.writeFileSync(sampleResumeDummyPath, '%PDF-1.4 [Demo Candidate Resume Content]');
    }

    // Update candidate profile with demo resume
    demoCandidate.profile.resumePath = sampleResumeDummyPath;
    demoCandidate.profile.resumeOriginalName = 'Alex_Rivera_Resume.pdf';
    demoCandidate.profile.resumeUpdatedAt = new Date();
    await demoCandidate.save();

    await Application.create({
      jobId: insertedJobs[0]._id,
      candidateId: demoCandidate._id,
      resumePath: sampleResumeDummyPath,
      resumeOriginalName: 'Alex_Rivera_Resume.pdf',
      coverLetter: 'Dear Hiring Manager at TechNova Solutions,\n\nI am thrilled to apply for the Senior Full Stack Developer position. With over 5 years of experience in React and Node.js, I have architected high-performance applications and microservices that increased user engagement. I would love to bring my expertise to TechNova.\n\nBest regards,\nAlex Rivera',
      portfolioUrl: 'https://alexrivera.dev',
      status: 'Reviewed',
      statusNotes: 'Strong React and Node.js background. Matches technical stack well.',
    });

    // Save job for demo candidate
    await SavedJob.create({
      candidateId: demoCandidate._id,
      jobId: insertedJobs[1]._id,
    });

    console.log('Created sample application & saved job for demo candidate.');
    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed with error:', error);
    process.exit(1);
  }
};

seedData();

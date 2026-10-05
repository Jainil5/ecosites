export interface ResumeLink {
  label: string;
  href: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface EducationItem {
  school: string;
  degree: string;
  period: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

export interface Resume {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  links: ResumeLink[];
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillGroup[];
  certifications: string[];
}

export const resume: Resume = {
  name: 'Jainil Patel',
  title: 'Software Engineer',
  location: 'Pune, India',
  email: 'jainiljp72525@gmail.com',
  phone: '+91-8238889347',
  links: [
    { label: 'GitHub', href: 'https://github.com/Jainil5' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/Jainil5' },
    { label: 'LeetCode', href: 'https://leetcode.com/u/jainil5/' },
  ],
  summary:
    'Software Engineer with hands-on experience building and shipping production systems — from data platforms and ETL automation to cloud infrastructure on AWS (S3, Athena, Lambda). Skilled in Python, SQL, and PySpark for large datasets, with CI/CD, Docker, Kubernetes, and automated testing across dev/test/prod environments.',
  experience: [
    {
      role: 'AI Intern',
      company: 'Dassault Systèmes',
      period: 'Jun 2026 – Present',
      bullets: [
        'Built data infrastructure for enterprise multi-agent services using Python, Java, and LangGraph.',
        'Maintained PostgreSQL, vector DB, and Redis pipelines with pytest tests, cutting query latency by 35%.',
      ],
    },
    {
      role: 'Data Science Intern',
      company: 'Smollan India',
      period: 'Mar 2024 – Nov 2024',
      bullets: [
        'Onboarded new datasets and automated ETL and reporting workflows with Python, PySpark, and SQL, reducing manual effort by 70%.',
        'Built NLP pipelines (SpaCy, scikit-learn) and recommendation services with Named Entity Recognition.',
      ],
    },
    {
      role: 'Trainee Engineer',
      company: 'EffyBiz',
      period: 'Sep 2023 – Dec 2023',
      bullets: [
        'Deployed inference services as Docker microservices (Python/Flask) with logging and root-cause analysis.',
      ],
    },
  ],
  education: [
    {
      school: 'Symbiosis Institute of Technology, Pune',
      degree: 'M.Tech. — Artificial Intelligence & Machine Learning',
      period: '2025 – 2027',
    },
    {
      school: 'Uka Tarsadia University',
      degree: 'B.Tech. — Computer Engineering',
      period: '2019 – 2024',
    },
  ],
  skills: [
    {
      label: 'Data Engineering',
      items: [
        'Snowflake',
        'Apache Airflow',
        'PySpark',
        'Databricks',
        'ETL/ELT',
        'Data Modeling',
        'Data Quality Tests',
        'Pandas',
        'NumPy',
        'Hive',
      ],
    },
    {
      label: 'Programming & SQL',
      items: [
        'Python',
        'SQL',
        'Java',
        'Go',
        'Bash',
        'Git',
        'Pull Request Reviews',
        'Data Structures & Algorithms',
        'OOP',
      ],
    },
    {
      label: 'Cloud, Containers & CI/CD',
      items: [
        'AWS (S3, Athena, Lambda, EC2)',
        'Azure',
        'Docker',
        'Kubernetes',
        'CI/CD',
        'RabbitMQ',
        'Event-Driven Architecture',
        'pytest',
        'Unit Testing',
      ],
    },
    {
      label: 'Databases & AI Systems',
      items: [
        'PostgreSQL',
        'MongoDB',
        'Redis',
        'Supabase',
        'Apache Iceberg',
        'FastAPI',
        'Flask',
        'MCP',
        'LangChain',
        'LangGraph',
        'RAG',
        'LLMs',
        'MLflow',
        'NLP/NER',
      ],
    },
  ],
  certifications: [
    'Cloud Computing with AWS (edX)',
    'AWS Cloud Practitioner Essentials (edX)',
    'Machine Learning (edX)',
    'Introduction to Generative AI (Google)',
  ],
};

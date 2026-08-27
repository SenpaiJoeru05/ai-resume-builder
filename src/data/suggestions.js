// Curated suggestion lists for as-you-type autocomplete across the resume forms.
// Local + static on purpose: instant, free, offline. The AI "Suggest Skills"
// button (geminiService) remains the dynamic, role-tailored complement to these.

export const JOB_TITLES = [
  'Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Full Stack Developer', 'Mobile Developer', 'iOS Developer', 'Android Developer',
  'DevOps Engineer', 'Site Reliability Engineer', 'Cloud Engineer', 'Data Engineer',
  'Data Scientist', 'Data Analyst', 'Machine Learning Engineer', 'AI Engineer',
  'QA Engineer', 'Test Automation Engineer', 'Security Engineer', 'Systems Administrator',
  'Database Administrator', 'Engineering Manager', 'Technical Lead', 'Solutions Architect',
  'Product Manager', 'Senior Product Manager', 'Product Owner', 'Project Manager',
  'Program Manager', 'Scrum Master', 'Business Analyst', 'Product Designer',
  'UX Designer', 'UI Designer', 'UX Researcher', 'Graphic Designer', 'Visual Designer',
  'Web Designer', 'Art Director', 'Creative Director', 'Motion Designer',
  'Marketing Manager', 'Digital Marketing Manager', 'Marketing Specialist', 'SEO Specialist',
  'Content Marketing Manager', 'Social Media Manager', 'Brand Manager', 'Growth Manager',
  'Content Writer', 'Copywriter', 'Technical Writer', 'Editor',
  'Sales Representative', 'Account Executive', 'Account Manager', 'Sales Manager',
  'Business Development Manager', 'Customer Success Manager', 'Customer Support Specialist',
  'Operations Manager', 'Office Manager', 'Administrative Assistant', 'Executive Assistant',
  'Human Resources Manager', 'HR Specialist', 'Recruiter', 'Talent Acquisition Specialist',
  'Accountant', 'Financial Analyst', 'Finance Manager', 'Bookkeeper', 'Auditor',
  'Investment Analyst', 'Consultant', 'Management Consultant', 'Strategy Consultant',
  'Registered Nurse', 'Physician', 'Pharmacist', 'Medical Assistant', 'Physical Therapist',
  'Teacher', 'Professor', 'Instructional Designer', 'Tutor', 'School Counselor',
  'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Industrial Engineer',
  'Architect', 'Lawyer', 'Paralegal', 'Legal Assistant',
  'Chef', 'Restaurant Manager', 'Event Coordinator', 'Logistics Coordinator',
  'Supply Chain Manager', 'Warehouse Manager', 'Real Estate Agent', 'Photographer',
  'Video Editor', 'Chief Executive Officer', 'Chief Technology Officer',
  'Chief Operating Officer', 'Chief Financial Officer', 'Chief Marketing Officer',
]

export const INDUSTRIES = [
  'Technology / Software', 'Information Technology', 'Finance', 'Banking', 'Insurance',
  'Healthcare', 'Pharmaceuticals', 'Biotechnology', 'Education', 'E-commerce', 'Retail',
  'Manufacturing', 'Automotive', 'Aerospace', 'Construction', 'Real Estate', 'Hospitality',
  'Travel & Tourism', 'Food & Beverage', 'Media & Entertainment', 'Marketing & Advertising',
  'Telecommunications', 'Energy', 'Oil & Gas', 'Renewable Energy', 'Government', 'Non-Profit',
  'Legal Services', 'Consulting', 'Transportation & Logistics', 'Agriculture', 'Gaming',
  'Fashion & Apparel', 'Sports & Fitness', 'Cybersecurity', 'Artificial Intelligence',
  'Fintech', 'EdTech', 'HealthTech', 'Human Resources',
]

export const SKILLS = [
  // Programming & web
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'Go', 'Rust', 'Ruby',
  'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'SQL', 'HTML', 'CSS', 'Sass',
  'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Node.js', 'Express', 'Django',
  'Flask', 'FastAPI', 'Spring Boot', 'Ruby on Rails', 'Laravel', '.NET', 'GraphQL',
  'REST APIs', 'Redux', 'Tailwind CSS', 'Bootstrap', 'jQuery', 'Webpack', 'Vite',
  // Data & cloud
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'AWS', 'Azure',
  'Google Cloud Platform', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Jenkins',
  'Git', 'GitHub Actions', 'Linux', 'Bash', 'Pandas', 'NumPy', 'TensorFlow', 'PyTorch',
  'scikit-learn', 'Spark', 'Hadoop', 'Tableau', 'Power BI', 'Looker', 'dbt', 'Airflow',
  'Machine Learning', 'Deep Learning', 'Data Analysis', 'Data Visualization', 'ETL',
  // Design & product
  'Figma', 'Sketch', 'Adobe XD', 'Adobe Photoshop', 'Adobe Illustrator', 'InDesign',
  'After Effects', 'Premiere Pro', 'Prototyping', 'Wireframing', 'User Research',
  'Usability Testing', 'Design Systems', 'Interaction Design', 'Information Architecture',
  'Accessibility (a11y)', 'Responsive Design',
  // Business / marketing / PM
  'Project Management', 'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Asana', 'Trello',
  'Product Strategy', 'Roadmapping', 'A/B Testing', 'SEO', 'SEM', 'Google Analytics',
  'Google Ads', 'Content Marketing', 'Email Marketing', 'Social Media Marketing',
  'Salesforce', 'HubSpot', 'CRM', 'Market Research', 'Budgeting', 'Financial Modeling',
  'Excel', 'Microsoft Office', 'Google Workspace', 'Stakeholder Management',
  // Soft skills
  'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
  'Time Management', 'Adaptability', 'Collaboration', 'Creativity', 'Attention to Detail',
  'Public Speaking', 'Negotiation', 'Mentoring', 'Conflict Resolution', 'Decision Making',
  'Customer Service', 'Presentation Skills', 'Organization', 'Strategic Planning',
]

export const LANGUAGES = [
  'English', 'Spanish', 'Mandarin Chinese', 'Hindi', 'Arabic', 'French', 'German',
  'Portuguese', 'Russian', 'Japanese', 'Korean', 'Italian', 'Dutch', 'Turkish',
  'Vietnamese', 'Polish', 'Ukrainian', 'Tagalog', 'Filipino', 'Cebuano', 'Thai',
  'Indonesian', 'Malay', 'Bengali', 'Urdu', 'Persian', 'Hebrew', 'Greek', 'Swedish',
  'Norwegian', 'Danish', 'Finnish', 'Czech', 'Romanian', 'Hungarian', 'Swahili',
]

export const DEGREES = [
  'High School Diploma', 'Associate Degree', 'Bachelor of Arts (B.A.)',
  'Bachelor of Science (B.S.)', 'Bachelor of Fine Arts (B.F.A.)',
  'Bachelor of Business Administration (BBA)', 'Bachelor of Engineering (B.E.)',
  'Master of Arts (M.A.)', 'Master of Science (M.S.)',
  'Master of Business Administration (MBA)', 'Master of Fine Arts (M.F.A.)',
  'Master of Engineering (M.Eng.)', 'Doctor of Philosophy (Ph.D.)',
  'Juris Doctor (J.D.)', 'Doctor of Medicine (M.D.)', 'Certificate', 'Diploma',
]

export const FIELDS_OF_STUDY = [
  'Computer Science', 'Software Engineering', 'Information Technology', 'Data Science',
  'Information Systems', 'Electrical Engineering', 'Mechanical Engineering',
  'Civil Engineering', 'Chemical Engineering', 'Biomedical Engineering', 'Mathematics',
  'Statistics', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Finance', 'Accounting',
  'Business Administration', 'Marketing', 'Management', 'Psychology', 'Sociology',
  'Political Science', 'Communications', 'Journalism', 'English', 'History',
  'Graphic Design', 'Industrial Design', 'Architecture', 'Nursing', 'Medicine',
  'Law', 'Education', 'Environmental Science', 'Human Resources',
]

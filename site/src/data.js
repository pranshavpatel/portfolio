export const profile = {
  name: 'Pranshav Patel',
  email: 'pranshavpatel1803@gmail.com',
  github: 'https://github.com/pranshavpatel',
  linkedin: 'https://linkedin.com/in/pranshavpatel',
  location: 'Raleigh, NC',
  // The ?v= part changes with each new résumé, so browsers fetch it again
  // instead of showing a copy they cached.
  resume: 'uploads/resume_pranshavpatel.pdf?v=2026-10-31'
};

// The notebook's first page.
export const about = {
  text: 'I’m a CS master’s student at NC State, graduating in May 2027, and I’ve interned at LexisNexis and Trading Technologies. I like building AI systems end to end and then finding out whether they actually work: benchmarks against a baseline, controlled A/B runs, labeled evals.',
  now: 'inference engineering: paged KV caching, continuous batching and decode backends, by building NanoServe.'
};

// The projects, in the order the résumé lists them. Every figure is in the
// résumé (public/uploads/) and was checked against the project's repository;
// the comment on each project says where.
export const projects = [
  {
    // github.com/pranshavpatel/policyBot: README "Retrieval quality", "Groundedness guardrail",
    // "Agent engine".
    slug: 'policybot', n: '01', title: 'PolicyBot', kind: 'Full-stack RAG assistant', context: 'Personal project · live on Vercel / Render',
    github: 'https://github.com/pranshavpatel/policyBot', live: 'https://policy-bot-two.vercel.app',
    personalNote: 'An HR assistant that answers policy questions with RAG and files leave requests, behind one JWT access and audit layer.',
    decision: 'One question never found its policy: the splitter stripped section headers from chunks. I put them back into the indexed text.',
    metric: '0.958', metricLabel: 'MRR with reranking, 67 labeled questions',
    chart: { title: 'RAG retrieval, 67 questions', rows: [{ l: 'Recall@1', v: 92.5, max: 100, show: '92.5%' }, { l: 'MRR', v: 0.958, max: 1, show: '0.958' }] },
    stack: ['RAG', 'BM25', 'Cross-encoder', 'LangGraph', 'FastAPI', 'React'],
    results: [
      { v: '92.5%', l: 'Recall@1, hybrid retrieval + reranking' },
      { v: '90.0%', l: 'answers correct end to end (63 / 70)' },
      { v: '2', l: 'agent engines: ReAct loop, LangGraph' },
      { v: '105', l: 'tests, run in CI' }
    ]
  },
  {
    // github.com/pranshavpatel/llm-inference-engine: README "Measured result", BENCHMARKS.md,
    // environment/phase6-vm-vllm/README.md. The repository spells the name NanoServe.
    slug: 'nanoserve', n: '02', title: 'NanoServe', kind: 'Single-GPU LLM inference engine', context: 'Personal project',
    github: 'https://github.com/pranshavpatel/llm-inference-engine',
    personalNote: 'I built a Qwen2.5 server end to end: paged KV memory, continuous batching, an OpenAI-style streaming API and L40S benchmarks.',
    decision: 'I kept plain PyTorch attention as the reference and made FlashInfer decode opt-in, so both ran the same saved traces.',
    metric: '+81%', metricLabel: 'output tokens/sec at 2 req/s, reference path overloaded',
    chart: { title: 'Output tokens / sec at 2 req/s', rows: [{ l: 'Reference attention', v: 75.4, max: 150, show: '75.4', tone: 'light' }, { l: 'FlashInfer decode (opt-in)', v: 136.6, max: 150, show: '136.6' }] },
    stack: ['Python', 'PyTorch', 'CUDA', 'FlashInfer', 'Hugging Face', 'vLLM'],
    results: [
      { v: '75.4 → 136.6', l: 'output tokens / sec, median of 3 runs' },
      { v: '19.2 s → 145 ms', l: 'p99 time-to-first-token' },
      { v: '92 → 0 of 387', l: 'failed requests' },
      { v: '3,691', l: 'requests in the vLLM baseline run' }
    ]
  },
  {
    // github.com/pranshavpatel/fitbit-mcp: README and docs/validation.md section 4 (render time);
    // docs/mcp-tool-use-results.md on the mcp-agent-eval branch (32 cases, 192 trials, expiry failures).
    slug: 'fitbit-mcp', n: '03', title: 'Fitbit-MCP', kind: 'Personal health data platform', context: 'Personal project · used daily',
    github: 'https://github.com/pranshavpatel/fitbit-mcp',
    personalNote: 'A local-first MCP server for my Fitbit and Google Health data, with OAuth and resumable imports into SQLite.',
    decision: 'My agent eval caught the model reusing a confirmation after it had expired, so I added regression tests.',
    metric: '45 s → 3 s', metricLabel: 'dashboard render over 2 million heart-rate samples',
    chart: { title: 'Dashboard render time', rows: [{ l: 'Before', v: 45, max: 50, show: '45 s', tone: 'light' }, { l: 'With an index and a cache', v: 3, max: 50, show: '3 s' }] },
    stack: ['Python', 'MCP', 'SQLite'],
    results: [
      { v: '13', l: 'MCP tools' },
      { v: '2M', l: 'heart-rate samples in the dashboard' },
      { v: '32', l: 'synthetic agent workflows' },
      { v: '192', l: 'model trials in the agent eval' }
    ]
  }
];

// Experience, education and skills follow the résumé in public/uploads/.
export const experience = [
  { dates: 'Jun – Aug 2026', role: 'Data Science Intern', org: 'LexisNexis Legal & Professional',
    stats: [{ v: '66%', l: 'fewer prompt tokens' }, { v: '63%', l: 'lower inference cost' }, { v: '38%', l: 'lower end-to-end latency' }, { v: '20', l: 'controlled A/B experiments' }],
    points: [
      'Re-architected an agentic LLM pipeline for legal due diligence (Python, Google ADK, LiteLLM, FastAPI, Pydantic), replacing a nondeterministic LLM planning step with a deterministic, budget-capped evidence-retrieval layer driven by versioned JSON review plans.',
      'Cut LLM prompt tokens by 66%, inference cost by 63% and end-to-end latency by 38% (mean across 20 controlled A/B experiments) while keeping output quality on par with the production baseline.',
      'Designed a reproducible A/B evaluation harness with frozen inputs, isolated per-arm processes, input hashing, automated quality gates and LLM-as-judge scoring.',
      'Shipped the layer as a feature-flagged, opt-in capability across 3 runtime modes, with per-document fallback for backward compatibility with production behavior.'
    ] },
  { dates: 'Dec 2024 – Jun 2025', role: 'Software Engineer Intern', org: 'Trading Technologies',
    stats: [{ v: '80%+', l: 'manual regression cases automated' }, { v: '6 h → <1 h', l: 'regression run time' }, { v: '70%', l: 'less manual verification' }, { v: '35%', l: 'faster ingestion and validation' }],
    points: [
      'Automated more than 80% of manual regression test cases for the SCORE compliance product, reducing execution time from 6 hours to under 1 hour.',
      'Developed Python scripts to validate critical financial data transformations (KRM to RISK, WFE pipelines) and automated RESTful API validation, reducing manual verification effort by 70%.',
      'Built scalable automation frameworks on AWS (S3, DynamoDB, EC2, EMR, Glue Jobs), accelerating data ingestion and validation pipelines by 35%.',
      'Partnered with QA and engineering teams to standardize test automation practices, reducing release-cycle bottlenecks by 40%.'
    ] }
];

export const education = [
  { dates: '2025 – 2027', school: 'North Carolina State University', degree: 'Master of Computer Science', gpa: 'GPA 4.0 / 4.0',
    courses: 'Software Engineering, DevOps, Design and Analysis of Algorithms, Advanced Topics in ML and Neural Networks' },
  { dates: '2021 – 2025', school: 'Nirma University', degree: 'B.Tech, Computer Science', gpa: 'GPA 8.58 / 10',
    courses: 'Database Management Systems, Data Structures and Algorithms, Software Engineering, Machine Learning' }
];

export const skills = [
  { g: 'Languages', items: 'Python, JavaScript, SQL, C/C++, Java' },
  { g: 'Frontend & backend', items: 'React, Tailwind CSS, Node.js, FastAPI, Pydantic, REST APIs, SSE streaming, JWT, RBAC' },
  { g: 'Databases', items: 'MySQL, SQLite, MongoDB, Redis, DynamoDB' },
  { g: 'AI / LLM', items: 'LLM agents, tool calling, RAG, LangGraph, Google ADK, LiteLLM, MCP, LLM-as-judge evals' },
  { g: 'Performance', items: 'PyTorch, Hugging Face, vLLM, FlashInfer, KV caching, continuous batching, benchmarking' },
  { g: 'Cloud & DevOps', items: 'AWS (S3, SQS/SNS, EC2, EMR, Glue), Docker, CI/CD' }
];

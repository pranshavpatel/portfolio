export const profile = {
  name: 'Pranshav Patel',
  email: 'pranshavpatel1803@gmail.com',
  github: 'https://github.com/pranshavpatel',
  linkedin: 'https://linkedin.com/in/pranshavpatel',
  location: 'Raleigh, NC',
  resume: 'uploads/resume_pranshavpatel.pdf'
};

export const projects = [
  {
    slug: 'nanoserve', n: '01', title: 'Nanoserve', kind: 'Single-GPU LLM inference engine', context: 'Personal project',
    summary: 'An end-to-end Qwen2.5 inference engine with paged KV caching, continuous batching and an OpenAI-style streaming API.',
    metric: '+81%', metricLabel: 'throughput, FlashInfer decode',
    stack: ['Python', 'PyTorch', 'CUDA', 'FlashInfer', 'Hugging Face', 'vLLM'],
    results: [
      { v: '75.4 → 136.6', l: 'output tokens / sec' },
      { v: '19.2 s → 145 ms', l: 'p99 time-to-first-token' },
      { v: '92 / 387', l: 'request failures eliminated' },
      { v: '3,691', l: 'requests replayed vs vLLM' }
    ],
    figure: 'architecture diagram — scheduler → paged KV cache → decode backend',
    sections: [
      { h: 'What I built', p: ['Built an end-to-end Qwen2.5 inference engine with custom model execution and SafeTensors loading, physical paged KV caching, continuous batching, recompute preemption, and an OpenAI-style HTTP/SSE streaming API.'] },
      { h: 'FlashInfer paged-decode backend', p: ['Integrated an opt-in FlashInfer paged-decode backend that increased measured in-window throughput by 81% (75.4 → 136.6 output tokens/sec), reduced p99 time-to-first-token from 19.2 s to 145 ms, and eliminated 92/387 request failures on a pinned Qwen2.5-1.5B workload running on an NVIDIA L40S.'] },
      { h: 'How I measured it', p: ['Built a repeatable benchmarking system to measure inference speed, reliability and resource usage; checked model execution against Hugging Face and replayed 3,691 requests against a same-session vLLM baseline with zero missing metrics or client scheduling violations.'] }
    ]
  },
  {
    slug: 'lexisnexis', n: 'Internship', personal: false, title: 'Deterministic evidence retrieval', kind: 'Agentic LLM pipeline for legal due diligence', context: 'LexisNexis Legal & Professional · Data Science Intern · 2026',
    summary: 'Replaced a nondeterministic LLM planning step with a budget-capped retrieval layer driven by versioned JSON review plans.',
    metric: '−63%', metricLabel: 'inference cost',
    stack: ['Python', 'Google ADK', 'LiteLLM', 'FastAPI', 'Pydantic'],
    results: [
      { v: '−66%', l: 'LLM prompt tokens' },
      { v: '−63%', l: 'inference cost' },
      { v: '−38%', l: 'end-to-end latency' },
      { v: '20', l: 'controlled A/B experiments' }
    ],
    figure: 'pipeline diagram — review plan → evidence retrieval → LLM review',
    sections: [
      { h: 'What changed', p: ['Re-architected an agentic LLM pipeline for legal due diligence (Python, Google ADK, LiteLLM, FastAPI, Pydantic), replacing a nondeterministic LLM planning step with a deterministic, budget-capped evidence-retrieval layer driven by versioned JSON review plans.', 'Cut LLM prompt tokens by 66%, inference cost by 63%, and end-to-end latency by 38% (mean across 20 controlled A/B experiments) while keeping output quality on par with the production baseline.'] },
      { h: 'How I measured it', p: ['Designed a reproducible A/B evaluation harness with frozen inputs, isolated per-arm processes, input hashing, automated quality gates, and LLM-as-judge scoring.'] },
      { h: 'Shipping it', p: ['Shipped the layer as a feature-flagged, opt-in capability across 3 runtime modes, with per-document fallback ensuring backward compatibility with production behavior.'] }
    ]
  },
  {
    slug: 'policybot', n: '02', title: 'PolicyBot', kind: 'Full-stack HR RAG assistant', context: 'Personal project · live on Render / Vercel',
    summary: 'Hybrid retrieval with reranking, a groundedness check, and two interchangeable agent engines behind one access layer.',
    metric: '0.958', metricLabel: 'MRR on 67 labeled questions',
    stack: ['FastAPI', 'React', 'LangGraph', 'BM25', 'Cross-encoder', 'JWT'],
    results: [
      { v: '92.5%', l: 'Recall@1' },
      { v: '0.958', l: 'MRR' },
      { v: '67', l: 'labeled eval questions' },
      { v: '2', l: 'agent engines: ReAct, LangGraph' }
    ],
    figure: 'screenshot — chat UI with cited policy sections',
    sections: [
      { h: 'What I built', p: ['Shipped a full-stack RAG assistant (FastAPI, React) live on Render/Vercel with one JWT role-based access and audit layer shared by the REST API, chat agent and a Slack bot.'] },
      { h: 'Retrieval', p: ['Built hybrid BM25 + dense retrieval with cross-encoder reranking (Recall@1 92.5%, MRR 0.958 on 67 labeled questions); traced the last retrieval miss to a chunking bug that stripped section headers, fixed it, and added a groundedness check that blocks unsupported numbers in answers.'] },
      { h: 'Agents', p: ['Built interchangeable hand-rolled ReAct and LangGraph agent engines, the latter with per-user conversation memory; fixed a production bug in both that wrote duplicate leave requests by making successful tool calls terminal.'] }
    ]
  },
  {
    slug: 'fitbit-mcp', n: '03', title: 'Fitbit-MCP', kind: 'Personal health data platform', context: 'Personal project · used daily',
    summary: 'A local-first MCP server that syncs Fitbit data into SQLite and powers a dashboard, a phone app and daily coaching notes.',
    metric: 'r = 0.97', metricLabel: 'recovery score vs WHOOP',
    stack: ['MCP', 'Python', 'SQLite', 'LLMs'],
    results: [
      { v: '0.97', l: 'Pearson r vs WHOOP' },
      { v: '15.6 → 6.9', l: 'mean absolute error' },
      { v: '46% → 85%', l: 'band agreement' },
      { v: '13', l: 'MCP tools' }
    ],
    figure: 'Bland–Altman plot — before / after recalibration',
    sections: [
      { h: 'What I built', p: ['Built a local-first MCP server (13 tools) that syncs Fitbit / Google Health data into SQLite, powering a terminal dashboard, phone app and LLM-written daily coaching notes that I use every day.'] },
      { h: 'Validation', p: ['Validated my recovery score against WHOOP’s (Pearson r = 0.97); diagnosed a constant offset with Bland–Altman analysis and recalibrated, cutting mean absolute error from 15.6 to 6.9 points and raising band agreement from 46% to 85%.'] }
    ]
  }
];

export const experience = [
  { dates: 'Jun – Aug 2026', role: 'Data Science Intern', org: 'LexisNexis Legal & Professional', slug: 'lexisnexis',
    blurb: 'Re-architected an agentic LLM pipeline for legal due diligence around a deterministic, budget-capped evidence-retrieval layer, and built the A/B evaluation harness used to validate it.',
    points: ['Re-architected an agentic LLM pipeline for legal due diligence around a deterministic, budget-capped evidence-retrieval layer.', 'Cut prompt tokens 66%, inference cost 63% and latency 38% across 20 controlled A/B experiments, with quality on par with production.'] },
  { dates: 'Dec 2024 – Jun 2025', role: 'Software Engineer Intern', org: 'Trading Technologies', slug: null,
    blurb: 'Automated regression testing for the SCORE compliance product and built AWS-backed validation for financial data pipelines and REST APIs.',
    points: ['Automated more than 80% of manual regression test cases for the SCORE compliance product, reducing execution time from 6 hours to under 1 hour.', 'Built automation frameworks on AWS (S3, DynamoDB, EC2, EMR, Glue Jobs) that sped up file ingestion and validation by 35%.'] }
];

export const education = [
  { dates: '2025 – 2027', school: 'North Carolina State University', degree: 'Master of Computer Science', gpa: 'GPA 4.0 / 4.0' },
  { dates: '2021 – 2025', school: 'Nirma University', degree: 'B.Tech, Computer Science', gpa: 'GPA 8.58 / 10' }
];

export const skills = [
  { g: 'LLM inference', items: 'FlashInfer, vLLM, KV caching, continuous batching, benchmarking' },
  { g: 'AI / ML', items: 'PyTorch, Hugging Face, Google ADK, LangChain, LangGraph, RAG, MCP, BM25, cross-encoder reranking' },
  { g: 'Model training', items: 'SFT, LoRA, QLoRA, PEFT' },
  { g: 'Web & APIs', items: 'FastAPI, Pydantic, Node.js, React, Tailwind CSS, REST, JWT, RBAC' },
  { g: 'Cloud & data', items: 'AWS (S3, SQS/SNS, EC2, DynamoDB, EMR, Glue), Docker, CI/CD, Redis, MongoDB, MySQL' },
  { g: 'Languages', items: 'Python, C/C++, Java, JavaScript, SQL' }
];

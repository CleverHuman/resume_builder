import { ResumeData } from "./types";

export const SAMPLE: ResumeData = {
  personal: {
    name: "Jeremy Wyatt Judge",
    title: "Staff Software Engineer",
    location: "Apple Valley, CA",
    email: "jeremy.wyatt.judge@outlook.com",
    phone: "+1 (760) 273-5358",
    job_title: "Senior Backend Engineer",
    company: "Acme Corp",
  },
  summary:
    "Staff Software Engineer with over 7 years building internet-scale distributed " +
    "systems and developer platforms. Expert in Go and Python services that sustain " +
    "billions of daily requests at 99.99% availability across Tier-0 infrastructure. " +
    "Proven leader of remote-first teams, aligning distributed engineering partners " +
    "across product and infrastructure organizations.",
  skills: {
    "Core Languages": ["Go", "Python", "Java", "C++"],
    "Distributed Systems": ["Tier-0 Services", "gRPC", "API Design", "Event Streaming"],
    "Data & Storage": ["Cassandra", "TiDB", "Redis", "PostgreSQL"],
    "Cloud & Orchestration": ["Kubernetes", "Docker", "Terraform", "AWS"],
    "Reliability Engineering": [
      "SLO/SLA Management",
      "Latency Optimization",
      "Observability",
      "Incident Response",
    ],
    "Remote & Distributed Delivery": [
      "Async Communication",
      "Remote-First Workflows",
      "Cross-Functional Alignment",
      "Distributed Team Leadership",
    ],
  },
  experience: [
    {
      position: "Staff Software Engineer",
      company: "Discord",
      location: "San Francisco, CA (Remote)",
      start_date: "May 2024",
      end_date: "Jun 2026",
      highlights: [
        "Led redesign of the core messaging platform in Go, cutting p99 read latency by **38%** across services handling 4 billion daily events.",
        "Owned Tier-0 services powering feeds and notifications, sustaining **99.99%** availability while scaling throughput to 5 million requests per second.",
        "Drove API design standards and gRPC migration across the content platform, improving developer velocity for partner teams in Feeds and Ads.",
        "Mentored 8 backend engineers and led design reviews, raising on-call reliability and reducing Sev-1 incidents by **45%** over 4 quarters.",
        "Rebuilt the legacy monolith request path into modular Go services, deploying 2 critical migrations with **zero downtime** for 130 million users.",
      ],
    },
    {
      position: "Staff Software Engineer",
      company: "Dropbox",
      location: "San Francisco, CA (Remote)",
      start_date: "Mar 2022",
      end_date: "Apr 2024",
      highlights: [
        "Architected a distributed metadata service in Go and Python, scaling to 2 billion daily operations while lowering p95 latency by **30%**.",
        "Led API redesign for the file sync platform, increasing throughput **3x** and serving over 700 million registered users with high reliability.",
        "Introduced gRPC contracts and schema governance across storage services, improving cross-team API consistency and accelerating onboarding for distributed product teams.",
        "Mentored 5 senior engineers and drove migration off legacy services, cutting infrastructure cost by **22%** across the storage platform.",
      ],
    },
    {
      position: "Senior Software Engineer",
      company: "GitLab",
      location: "San Francisco, CA (Remote)",
      start_date: "May 2020",
      end_date: "Feb 2022",
      highlights: [
        "Built Go microservices for the CI platform used by millions of developers, improving pipeline scheduling throughput by **35%** during peak load.",
        "Designed API endpoints and data models for developer-facing services, partnering across fully remote teams to ship features on asynchronous workflows.",
        "Improved reliability of core platform services through observability and load testing, reducing recurring production incidents.",
      ],
    },
    {
      position: "Software Engineer",
      company: "Quora",
      location: "Mountain View, CA",
      start_date: "Jan 2019",
      end_date: "May 2020",
      highlights: [
        "Developed Python backend services for the Q&A feed, supporting 300 million monthly users and improving content retrieval latency by **25%**.",
        "Implemented ranking and caching improvements for content delivery, collaborating with product engineers to raise relevance across high-traffic community feeds.",
      ],
    },
  ],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      institution: "San Jose State University",
      location: "San Jose, CA",
      start_year: "2014",
      end_year: "2018",
    },
  ],
};

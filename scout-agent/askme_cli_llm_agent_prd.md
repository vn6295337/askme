
# 📄 Product Requirements Document (PRD)

## Product Name  
**askme-cli — LLM Scout Agent (MVP Extension)**

---

## 1. Purpose

Enhance the existing `askme-cli` app by building an autonomous agent that scans public sources weekly to identify and track **free-to-use large language models (LLMs)**—including **open-source** and **proprietary free-tier** offerings—based in the **US or Europe** and capable of **English text generation**. The agent will populate a new LLM listing table in the app’s backend hosted on **Render.com**.

---

## 2. Background & Rationale

The `askme-cli` tool (repo: [github.com/vn6295337/askme](https://github.com/vn6295337/askme)) provides a terminal-based interface for querying LLMs such as Llama, Gemini, and Mistral. It requires zero local configuration and is designed with privacy and ease of use in mind.

Currently, model selection is hardcoded or limited. This project adds dynamic discovery of new LLMs that meet the app's privacy and usage standards, providing users with richer choices over time.

---

## 3. Goals

- Discover **LLMs with free-tier access**, both open-source and proprietary.
- Limit models to those from **US or European** entities.
- Include only those that support **English text generation**.
- Update a centralized table **weekly** with latest qualifying models.
- Store data in the **Render backend** for future CLI access.
- Use only **free tools**, except for development support via **Claude Code**.
- Ensure agent compatibility with current Linux-based Chromebook development setup (repo symlinked from USB drive).

---

## 4. Functional Requirements

### 4.1 Discovery Agent

- Crawl GitHub, Hugging Face, arXiv, Papers with Code, and blog releases.
- Filter LLMs by:
  - Region: **US or Europe**
  - Access: **Free tier or open source**
  - Capability: **English text generation**
- Runs on a **weekly schedule**
- Uses only free/open-access APIs and tools

### 4.2 Data Schema

| Field | Description |
|-------|-------------|
| Model Name | Official name |
| Publisher | Organization behind the model |
| Country | US or European origin |
| Access Type | `Open Source` or `Proprietary - Free Tier` |
| License/Terms | Usage terms or API documentation |
| Model Size | E.g., 7B, 13B |
| Release Date | Date first announced or released |
| Source URL | Canonical URL (GitHub, HF, blog, etc.) |
| Inference Support | CPU/GPU/API access |
| Deprecation/Expiry | Known end-of-life or sunset date (if any) |

### 4.3 Data Format

- Primary: JSON (e.g., `llms.json`)
- Optional: CSV or SQLite

---

## 5. Backend Integration (Render.com)

### 5.1 Current Setup

- Backend: Node.js (`server.js`, `package.json`)
- APIs for Mistral, Gemini, and Llama stored as **environment variables**
- No existing database; backend deployed on Render

### 5.2 Proposed Upgrades

| Task | Description |
|------|-------------|
| JSON Storage | Use `fs` or `lowdb` to persist LLM metadata (e.g., `llms.json`) |
| New API Route | `POST /api/llms` to accept model list from agent |
| Optional API | `GET /api/llms` for consumption by `askme-cli` |
| Auth | Require token/key to POST updates |

---

## 6. Agent-to-Backend Flow

1. Agent runs weekly, discovers qualifying LLMs.
2. Sends full list to `POST /api/llms` endpoint.
3. Backend persists to `llms.json`.
4. **CLI must read from `GET /api/llms` to integrate dynamic model access.**

---

## 7. Technical Requirements

- Programming language: Python or Node.js preferred.
- Must use **free tools only** (GitHub Actions, public APIs, etc.).
- Agent may be scheduled via GitHub Actions or Render cron.
- Development tools may include **Claude Code**.
- Code should run and be testable on a **Linux-based Chromebook terminal**, where the `askme-cli` repo is available via symbolic link from a USB drive.

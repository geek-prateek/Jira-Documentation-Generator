
# 🚀 Jira Documentation Generator — MCP Server

A Node.js-based **Model Context Protocol (MCP) Server** that connects AI assistants like Cursor with Jira to automatically generate technical documentation, acceptance criteria, and team discussion summaries.

This project demonstrates how MCP enables AI applications to interact with external services through standardized tools.

---

## 📌 What is MCP?

**MCP (Model Context Protocol)** is an open standard that allows AI applications to communicate with external tools, APIs, and data sources.

For example, when a user asks:

> "Generate documentation for Jira issue PROJ-123."

The AI assistant uses our MCP Server to fetch Jira information and generate documentation.

### Why MCP?

Without MCP, each AI application may need its own custom Jira integration.

With MCP, a compatible AI application can connect to a reusable Jira MCP Server.

**MCP is not an AI model. It is a protocol that connects AI applications with external capabilities.**

---

## 🏗️ MCP Architecture

MCP has three main components:

| Component | Description | In Our Project |
|---|---|---|
| MCP Host | Application where users interact with AI | Cursor |
| MCP Client | Manages communication with an MCP Server | Cursor's MCP Client |
| MCP Server | Exposes tools and connects to external services | Node.js application |

### Project Architecture

```text
                    USER
                      |
                      v
                Cursor (Host)
                      |
                      v
                  MCP Client
                      |
                  MCP Protocol
                      |
                      v
                MCP Server
                  (Node.js)
                      |
                      v
       generateDocumentationFromJira
                      |
              +-------+-------+
              |               |
              v               v
          Jira REST API    OpenAI API
              |               |
              +-------+-------+
                      |
                      v
              Generated Markdown
                      |
                      v
                    Cursor
                      |
                      v
                     USER
```

**Responsibilities:**

- **Cursor:** Receives user requests and calls available MCP tools.
- **MCP Server:** Handles tool execution and coordinates external APIs.
- **Jira API:** Provides issue details and comments.
- **OpenAI:** Generates structured documentation from Jira information.

---

## 🔄 Complete Project Flow

### Example Request

> Generate technical documentation for Jira ticket PROJ-123.

### Step-by-Step Execution

```text
1. User sends a request in Cursor
                |
                v
2. Cursor discovers and calls the MCP tool
                |
                v
3. MCP Server receives the Jira issue ID
                |
                v
4. Fetch Jira issue details and comments
                |
                v
5. Send relevant Jira information to OpenAI
                |
                v
6. Generate:
   - Technical Requirements
   - Acceptance Criteria
   - Team Discussion Summary
                |
                v
7. Combine results into Markdown
                |
                v
8. Return documentation through MCP
                |
                v
9. Cursor displays the final result
```

### Example Output

```markdown
# Jira Documentation — PROJ-123

## Technical Requirements
- Implement employee password reset functionality.
- Validate password reset tokens.
- Handle token expiration.

## Acceptance Criteria
- Users can request password resets.
- Invalid or expired tokens are rejected.
- Users can update their passwords successfully.

## Team Discussion
- Development team discussed token validation.
- QA requested additional test scenarios.
```

The output above is an illustrative example.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Node.js | MCP Server runtime |
| JavaScript | Application logic |
| MCP SDK | MCP communication and tool registration |
| Zod | Tool input validation |
| Stdio Transport | Communication between Cursor and the server |
| Jira REST API | Fetch Jira issues and comments |
| OpenAI API | Generate documentation |

---

## 🔧 How MCP Tools Work

An **MCP Tool** is a function exposed by an MCP Server that an AI application can discover and call.

Our project exposes:

`generateDocumentationFromJira`

### Tool Input

```json
{
  "jiraId": "PROJ-123"
}
```

### Simplified Tool Registration

```javascript
server.tool(
  "generateDocumentationFromJira",
  {
    jiraId: z.string()
  },
  async ({ jiraId }) => {
    // Fetch issue information from Jira
    // Generate documentation using OpenAI
    // Return the generated result
  }
);
```

The MCP SDK handles protocol communication, while our JavaScript code performs the actual work.

### Main Functions

| Function | Responsibility |
|---|---|
| `fetchJiraIssue()` | Fetch issue details from Jira |
| `fetchJiraComments()` | Fetch comments from Jira |
| `generateAIRequirements()` | Generate technical requirements |
| `extractAcceptanceCriteria()` | Generate acceptance criteria |
| `summarizeCommentsAsConversation()` | Summarize team discussions |
| `generateDocumentation()` | Combine generated documentation |
| `init()` | Initialize the MCP Server |

---

## 🔌 How MCP Communication Works

This project uses **stdio (Standard Input/Output)** transport.

```text
Cursor
   |
   | Starts MCP Server
   v
Node.js Process
   |
   | MCP Initialization
   v
Tool Discovery
   |
   | Tool Call + Jira ID
   v
Tool Execution
   |
   | Tool Result
   v
Cursor
```

Stdio allows the MCP Client and Server to exchange structured messages through process input and output streams.

MCP also supports HTTP-based communication in other implementations.

### MCP Capabilities

MCP supports three important capabilities:

- **Tools:** Execute operations, such as generating Jira documentation.
- **Resources:** Expose data that clients can read.
- **Prompts:** Provide reusable prompt templates.

This project primarily demonstrates **MCP Tools**.

---

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- Jira Cloud account and API access
- OpenAI API access
- Cursor or another MCP-compatible application

### 1. Clone the Repository

```bash
git clone https://github.com/geek-prateek/Jira-Documentation-Generator.git

cd Jira-Documentation-Generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Credentials

Provide the required Jira and OpenAI configuration:

- Jira Base URL
- Jira Email / Username
- Jira API Token
- OpenAI API Key

Keep credentials secure and never commit secrets to GitHub.

### 4. Configure the MCP Server in Cursor

Example stdio MCP configuration:

```json
{
  "mcpServers": {
    "jira-documentation": {
      "command": "node",
      "args": [
        "/absolute/path/to/Jira-Documentation-Generator/index.js"
      ]
    }
  }
}
```

Replace the example path with your local project path.

Make sure the project credentials are configured before using the tool.

### 5. Use the Tool

Open Cursor and ask:

> Generate technical documentation for Jira issue PROJ-123.

Cursor can call the connected MCP tool and display the generated documentation.

---

## 🧠 MCP vs REST API vs RAG

| Concept | Main Purpose |
|---|---|
| MCP | Connect AI applications with external tools and services |
| REST API | Enable applications to communicate through HTTP endpoints |
| LLM | Understand and generate natural-language content |
| RAG | Retrieve relevant external information to support LLM answers |

### How They Work Together

```text
Cursor
   |
   | MCP
   v
Node.js MCP Server
   |
   | REST API
   v
Jira
   |
   | Retrieved Information
   v
OpenAI
   |
   v
Generated Documentation
```

**Important:** MCP does not replace REST APIs or LLMs. It provides a standardized way for AI applications to access external functionality.

This project retrieves Jira information through APIs. It does not require a vector database.

---

## ❓ Frequently Asked Questions

**Q1. Is MCP an AI model?**

No. MCP is a communication protocol that connects AI applications with external tools and data sources.

**Q2. What is the difference between MCP Host and MCP Server?**

The Host is the AI application where users interact. The Server provides external capabilities through tools, resources, or prompts.

**Q3. Who decides which MCP tool to call?**

The AI application uses the user's request and available tool definitions to select a suitable tool, according to its configuration and permissions.

**Q4. Does MCP replace the Jira REST API?**

No. The MCP Server uses Jira REST APIs internally to retrieve data.

**Q5. What is tool discovery?**

It allows an MCP Client to discover the tools exposed by a connected MCP Server.

**Q6. Why is Zod used?**

Zod defines and validates the expected tool input, such as a Jira issue ID.

**Q7. Why is stdio used?**

Stdio provides a simple way for a local MCP Client and Server to communicate without requiring a separate MCP HTTP endpoint.

**Q8. Can the same MCP Server work with other AI applications?**

Yes, if those applications support compatible MCP features and are configured to use the server.

**Q9. Does MCP require a vector database?**

No. MCP can work directly with REST APIs, databases, files, and other external systems.

**Q10. What does OpenAI do in this project?**

OpenAI converts retrieved Jira information into readable technical documentation and summaries.

---

## ✅ Key Takeaways

- MCP connects AI applications to external capabilities.
- The Host provides the user interface.
- The MCP Client manages protocol communication.
- The MCP Server exposes tools.
- Tools perform operations using structured inputs.
- Jira provides the issue information.
- OpenAI generates documentation from that information.
- The generated result returns to Cursor through MCP.

---

## 🎯 Project Summary

This project demonstrates how to build an MCP Server that connects an AI assistant with Jira and OpenAI.

### Remember This Flow

```text
User
  ↓
Cursor (MCP Host)
  ↓
MCP Client
  ↓
MCP Server (Node.js)
  ↓
generateDocumentationFromJira
  ↓
Jira REST API
  ↓
Issue Details + Comments
  ↓
OpenAI
  ↓
Technical Documentation
  ↓
MCP Server Response
  ↓
Cursor
  ↓
User
```

**In One Sentence:**

The user asks Cursor to generate Jira documentation, Cursor calls the MCP tool, the Node.js server fetches Jira data, OpenAI generates structured documentation, and the result is returned to Cursor.

---

**Built to demonstrate MCP architecture, tool calling, Jira integration, and AI-powered documentation generation.**

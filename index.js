import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fetch from "node-fetch";
import OpenAI from "openai";

const server = new McpServer({
    name: "Jira Documentation Generator",
    version: "1.0.0"
});

const OPENAI_API_KEY = "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"
const JIRA_BASE_URL = "https://vishwasraj345.atlassian.net";
const JIRA_EMAIL = "vishwasraj345@gmail.com";
const JIRA_TOKEN = "ATATT3xFfGF0DNXo_JnLSSBrxbJUxBdKknZPdhu28ZHJJ3IzKa6GcifZP2EJrXyM-Ti8Y1-tHDdsQ1TICHwW_Q-oY2NdNv4lTUiUPwO4R_w8P4ZlHjIOIRro3cE5_GrWVFPL3uMbrokSvv1dvGF2PShF_JdlaoTocFd3PgXZc3gkXZCAnp7FyIc=BA65F8FA";
const AUTH_HEADER = "Basic " + Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString("base64");

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

async function fetchJiraIssue(jiraId) {
    const res = await fetch(`${JIRA_BASE_URL}/rest/api/3/issue/${jiraId}`, {
        method: "GET",
        headers: {
            "Authorization": AUTH_HEADER,
            "Accept": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch JIRA issue");
    }

    const data = await res.json();
    const fields = data.fields;
    const summary = data.fields.summary;
    const rawDesc = data.fields.description;

    let description = "";
    try {
        description = rawDesc.content.map(block => 
            block.content.map(item => item.text).join(" ")
        ).join("\n");
    } catch (e) {
        description = "No structured description found.";
    }

    const metadata = {
        issueType: fields.issuetype?.name || "N/A",
        status: fields.status?.name || "N/A",
        priority: fields.priority?.name || "N/A",
        assignee: fields.assignee?.displayName || "Unassigned",
        reporter: fields.reporter?.displayName || "Unknown",
        created: fields.created || "N/A",
        updated: fields.updated || "N/A"
    };

    return { summary, description, metadata };
}

async function generateAIRequirements(summary, description) {
    const prompt = `You are a senior software engineer. Based on the following JIRA task summary and description, extract clear, detailed technical requirements:

    Summary: ${summary}

    Description: ${description}

    Respond with a bullet-point list of technical requirements.`.trim();

    const chatResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "system", content: "You are a helpful software engineer." },
            { role: "user", content: prompt }
        ],
        temperature: 0.3
    });

    const text = chatResponse.choices[0].message.content;
    return text;
}

async function extractAcceptanceCriteria(summary, description) {
    const prompt = `You're a software engineer. Based on the following JIRA summary and description, extract a list of Acceptance Criteria that could be used as a developer checklist.

    Respond using Markdown format with [ ] checkboxes.

    Summary: ${summary}

    Description: ${description}`.trim();

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "system", content: "You are a helpful software developer." },
            { role: "user", content: prompt }
        ],
        temperature: 0.2
    });

    return response.choices[0].message.content.trim();
}

async function summarizeCommentsAsConversation(comments) {
    const rawThread = comments.map(c => `${c.author}: ${c.body}`).join("\n");

    const prompt = `You are summarizing a technical team discussion from a JIRA ticket.
    Format the following comment thread as a team conversation block, using emojis and Markdown style:

    ${rawThread}`.trim();

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            { role: "system", content: "You are a helpful summarizer for software teams." },
            { role: "user", content: prompt }
        ],
        temperature: 0.3
    });

    return response.choices[0].message.content.trim();
}

async function fetchJiraComments(jiraId) {
    const res = await fetch(`${JIRA_BASE_URL}/rest/api/3/issue/${jiraId}/comment`, {
        method: "GET",
        headers: {
            "Authorization": AUTH_HEADER,
            "Accept": "application/json"
        }
    });

    if (!res.ok) {
        throw new Error("Failed to fetch JIRA comments");
    }

    const data = await res.json();
    const comments = data.comments.map(c => ({
        author: c.author.displayName,
        body: c.body.content.map(block =>
            block.content.map(item => item.text).join(" ")
        ).join(" ")
    }));

    return comments;
}

async function generateDocumentation(summary, description, metadata, comments) {
    const aiRequirements = await generateAIRequirements(summary, description);
    const acceptanceChecklist = await extractAcceptanceCriteria(summary, description);
    const teamDiscussion = await summarizeCommentsAsConversation(comments);

    return `## Generated Documentation

    ### Summary
    ${summary}

    ### Metadata
    - **Issue Type**: ${metadata.issueType}
    - **Status**: ${metadata.status}
    - **Priority**: ${metadata.priority}
    - **Assignee**: ${metadata.assignee}
    - **Reporter**: ${metadata.reporter}
    - **Created**: ${new Date(metadata.created).toLocaleDateString()}
    - **Last Updated**: ${new Date(metadata.updated).toLocaleDateString()}

    ### Technical Requirements
    ${aiRequirements}

    ### Acceptance Criteria
    ${acceptanceChecklist}

    ### Team Discussion
    ${teamDiscussion}`;
}

server.tool("generateDocumentationFromJira", {
    jiraId: z.string()
}, async ({ jiraId }) => {
    try {
        const { summary, description, metadata } = await fetchJiraIssue(jiraId);
        const comments = await fetchJiraComments(jiraId);
        const doc = generateDocumentation(summary, description, metadata, comments);
        return { content: [{ type: "text", text: doc }] };
    } catch (error) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };
    }
});

async function init() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

init();
